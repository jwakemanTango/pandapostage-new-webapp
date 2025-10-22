import React, { useEffect, useState, useCallback, useRef } from "react";
import { Circle, PlugZap } from "lucide-react";

interface SavedScale {
  productName: string;
  vendorId: number;
  productId: number;
}

interface WeightReading {
  value: number;
  unit: string;
}

export const UsbScaleReader: React.FC = () => {
  const [supported, setSupported] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<HIDDevice | null>(null);
  const [weight, setWeight] = useState<WeightReading | null>(null);
  const [savedScale, setSavedScale] = useState<SavedScale | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [fadeOut, setFadeOut] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectedDeviceRef = useRef<HIDDevice | null>(null);
  useEffect(() => {
    connectedDeviceRef.current = connectedDevice;
  }, [connectedDevice]);

  const filters = [
    { vendorId: 0x0a5f, productId: 0x0009 }, // DYMO M25 / M10
    { vendorId: 0x0922, productId: 0x8003 }, // Stamps.com 25lb
    { vendorId: 0x1446, productId: 0x6a73 }, // Smart Weigh
  ];

  // ------------------------------------------------------------
  // Setup and hotplug event listeners
  // ------------------------------------------------------------
  useEffect(() => {
    if (!("hid" in navigator)) return;
    setSupported(true);

    const hid = (navigator as any).hid;
    const stored = JSON.parse(localStorage.getItem("savedScale") || "null");
    if (stored) setSavedScale(stored);

    const handleConnect = async (event: any) => {
      const device: HIDDevice = event.device;
      console.log("🔌 HID connect:", device.productName);

      if (
        stored &&
        device.vendorId === stored.vendorId &&
        device.productId === stored.productId
      ) {
        console.log("⚡ Auto-connecting to saved scale...");
        await connect(device);
      }
    };

    const handleDisconnect = async (event: any) => {
      const device: HIDDevice = event.device;
      console.log("❌ HID disconnect:", device.productName);

      if (
        connectedDeviceRef.current &&
        device.vendorId === connectedDeviceRef.current.vendorId &&
        device.productId === connectedDeviceRef.current.productId
      ) {
        setConnectedDevice(null);
        setWeight(null);
        showStatus("Device disconnected");
      }
    };

    hid.addEventListener("connect", handleConnect);
    hid.addEventListener("disconnect", handleDisconnect);

    refreshDevices();

    return () => {
      hid.removeEventListener("connect", handleConnect);
      hid.removeEventListener("disconnect", handleDisconnect);
    };
  }, []);

  // ------------------------------------------------------------
  // Refresh + autoconnect retry
  // ------------------------------------------------------------
  const refreshDevices = useCallback(async () => {
    if (!("hid" in navigator)) return;
    const devices = await (navigator as any).hid.getDevices();
    if (!connectedDevice && savedScale) {
      const match = devices.find(
        (d: HIDDevice) =>
          d.vendorId === savedScale.vendorId &&
          d.productId === savedScale.productId
      );
      if (match) {
        await connect(match);
      }
    }
  }, [connectedDevice, savedScale]);

  useEffect(() => {
    if (!("hid" in navigator)) return;
    if (!savedScale) return;

    const hid = (navigator as any).hid;
    let cancelled = false;

    const tryConnectLoop = async (attempt = 1) => {
      if (cancelled || attempt > 6) return;
      const devices: HIDDevice[] = await hid.getDevices();

      const match = devices.find(
        (d) =>
          d.vendorId === savedScale.vendorId &&
          d.productId === savedScale.productId
      );

      if (match) {
        if (!match.opened) {
          console.log(`🔁 Auto-connecting saved scale (attempt ${attempt})`);
          try {
            await connect(match);
          } catch (err) {
            console.warn("Auto-connect failed:", err);
          }
        }
        return;
      }

      setTimeout(() => tryConnectLoop(attempt + 1), 2000);
    };

    tryConnectLoop();
    return () => {
      cancelled = true;
    };
  }, [savedScale]);

  // ------------------------------------------------------------
  // Core helpers
  // ------------------------------------------------------------
  const saveScale = (device: HIDDevice) => {
    const scale = {
      productName: device.productName,
      vendorId: device.vendorId,
      productId: device.productId,
    };
    localStorage.setItem("savedScale", JSON.stringify(scale));
    setSavedScale(scale);
  };

  const parseWeightReport = (data: DataView): WeightReading | null => {
    if (data.byteLength < 5) return null;
    const status = data.getUint8(0);
    const unitCode = data.getUint8(1);
    const rawWeight = data.getUint16(3, true);
    if (status !== 2 && status !== 4) return null;

    let ounces = 0;
    if (unitCode === 11) ounces = rawWeight / 10;
    else if (unitCode === 2) ounces = rawWeight / 28.3495;
    else ounces = rawWeight;

    const pounds = Math.floor(ounces / 16);
    const remainingOz = ounces % 16;
    return { value: pounds + remainingOz / 16, unit: "lb" };
  };

  const connect = async (device: HIDDevice) => {
    try {
      if (isConnecting) return;
      setIsConnecting(true);

      if (!device.opened) {
        await device.open();
      }

      setConnectedDevice(device);
      showStatus(`Connected to ${device.productName}`);

      device.addEventListener("inputreport", (event: HIDInputReportEvent) => {
        const parsed = parseWeightReport(event.data);
        if (parsed) setWeight(parsed);
      });

      saveScale(device);
    } catch (err: any) {
      if (!String(err).includes("open")) {
        console.error("Failed to open device:", err);
        showStatus("Failed to connect");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    if (!connectedDevice) return;
    await connectedDevice.close();
    setConnectedDevice(null);
    setWeight(null);
    showStatus("Device disconnected");
  };

  // ------------------------------------------------------------
  // Smart reconnect (auto or via user)
  // ------------------------------------------------------------
  const quickReconnect = async () => {
    if (!("hid" in navigator)) {
      showStatus("WebHID not supported in this browser");
      return;
    }

    const hid = (navigator as any).hid;
    try {
      const current: HIDDevice[] = await hid.getDevices();

      const match = current.find(
        (d: HIDDevice) =>
          savedScale &&
          d.vendorId === savedScale.vendorId &&
          d.productId === savedScale.productId
      );

      if (match) {
        console.log("🔁 Found pre-authorized HID device, connecting...");
        await connect(match);
        return;
      }

      // fallback: open browser picker if permission lost
      console.log("⚠️ No pre-authorized device found, requesting permission...");
      const newDevices: HIDDevice[] = await hid.requestDevice({ filters });

      if (newDevices.length > 0) {
        const device = newDevices[0];
        console.log("✅ Device selected via browser picker:", device.productName);
        await connect(device);
        return;
      }

      showStatus("No device selected");
    } catch (err: any) {
      console.error("Reconnect failed:", err);
      if (
        err?.message?.includes("User cancelled") ||
        err?.name === "NotFoundError"
      ) {
        showStatus("Connection cancelled");
      } else {
        showStatus("Failed to connect");
      }
    }
  };

  const showStatus = (msg: string) => {
    setFadeOut(false);
    setStatusMsg(msg);
    setTimeout(() => setFadeOut(true), 2500);
  };

  const formatWeight = (reading: WeightReading) => {
    if (!reading) return "--";
    const totalOz = reading.value * 16;
    const pounds = Math.floor(totalOz / 16);
    const ounces = totalOz % 16;
    if (pounds <= 0) return `${ounces.toFixed(1)} oz`;
    return `${pounds} lb ${ounces.toFixed(1)} oz`;
  };

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return !supported ? (
    <p className="text-red-600 text-center mt-6">
      WebHID not supported in this browser.
    </p>
  ) : (
    <div className="p-6 bg-white rounded-2xl shadow-lg max-w-sm mx-auto border border-gray-100 text-center relative">
      <div className="flex justify-center items-center mb-2">
        <Circle
          size={10}
          className={
            connectedDevice ? "text-green-500 fill-green-500" : "text-gray-300"
          }
        />
      </div>

      <p className="text-6xl font-extrabold text-gray-900 tracking-tight select-none">
        {connectedDevice && weight ? formatWeight(weight) : "--"}
      </p>

      {!connectedDevice && (
        <div className="mt-4 flex flex-col items-center">
          <button
            disabled={isConnecting}
            onClick={quickReconnect}
            className={`flex items-center gap-1 px-4 py-2 rounded text-sm ${
              isConnecting
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <PlugZap size={14} />
            {isConnecting
              ? "Connecting..."
              : connectedDevice
              ? "Reconnect Scale"
              : "Connect Scale"}
          </button>
          {savedScale && (
            <p className="text-xs text-gray-500 mt-2">
              Last used: {savedScale.productName}
            </p>
          )}
        </div>
      )}

      {connectedDevice && (
        <button
          onClick={disconnect}
          className="mt-4 text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
        >
          Disconnect
        </button>
      )}

      <p
        className={`text-sm mt-3 transition-opacity duration-700 ${
          fadeOut ? "opacity-0" : "opacity-100"
        } ${connectedDevice ? "text-gray-500" : "text-red-500"}`}
      >
        {statusMsg ||
          (connectedDevice
            ? `Connected to ${connectedDevice.productName}`
            : "No device connected")}
      </p>
    </div>
  );
};

export default UsbScaleReader;
