import React, { useEffect, useState, useRef } from "react";

interface WeightReading {
  ounces: number;
  grams: number;
  raw: number[];
}

type DisplayMode = "imperial" | "metric";

export const UsbScaleMonitor: React.FC = () => {
  const [supported, setSupported] = useState(false);
  const [device, setDevice] = useState<HIDDevice | null>(null);
  const [weight, setWeight] = useState<WeightReading | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("imperial");
  const [isOffline, setIsOffline] = useState(false);
  const [savedDeviceInfo, setSavedDeviceInfo] = useState<string | null>(null);

  const deviceRef = useRef<HIDDevice | null>(null);
  deviceRef.current = device;

  const filters = [
    { vendorId: 0x0a5f, productId: 0x0009 }, // DYMO M25/M10
    { vendorId: 0x0922, productId: 0x8003 }, // Stamps.com 25lb
    { vendorId: 0x1446, productId: 0x6a73 }, // Smart Weigh
  ];

  // --- Initialize + attempt auto-connect ---
  useEffect(() => {
    if (!("hid" in navigator)) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const hid = (navigator as any).hid;
    const lastKey = localStorage.getItem("lastUsbScaleKey");
    setSavedDeviceInfo(lastKey || null);

    (async () => {
      const devices: HIDDevice[] = await hid.getDevices();
      if (lastKey && devices.length > 0) {
        const match = devices.find(
          (d) => `${d.vendorId}:${d.productId}` === lastKey
        );
        if (match) {
          console.log("Auto-connecting to saved device:", match.productName);
          await connect(match);
        }
      }
    })();

    const handleDisconnect = (event: HIDConnectionEvent) => {
      if (deviceRef.current && event.device === deviceRef.current) {
        console.warn("Device disconnected:", event.device.productName);
        setDevice(null);
        setWeight(null);
        setIsOffline(true);
      }
    };

    hid.addEventListener("disconnect", handleDisconnect);
    return () => {
      hid.removeEventListener("disconnect", handleDisconnect);
    };
  }, []);

  // --- Polling for reappearance ---
  useEffect(() => {
    if (!("hid" in navigator)) return;
    const hid = (navigator as any).hid;

    const interval = setInterval(async () => {
      const devices: HIDDevice[] = await hid.getDevices();
      const current = deviceRef.current;
      const lastKey = localStorage.getItem("lastUsbScaleKey");

      const stillPresent =
        current &&
        devices.some(
          (d) =>
            d.vendorId === current.vendorId && d.productId === current.productId
        );

      if (current && !stillPresent) {
        console.warn("Scale powered off or disconnected.");
        setDevice(null);
        setWeight(null);
        setIsOffline(true);
      }

      // Try reconnecting
      if (!current && lastKey && !isConnecting && devices.length > 0) {
        const match = devices.find(
          (d) => `${d.vendorId}:${d.productId}` === lastKey
        );
        if (match) {
          console.log("Reconnecting to saved device:", match.productName);
          await connect(match);
          setIsOffline(false);
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isConnecting]);

  // --- Connection management ---
  const connect = async (dev?: HIDDevice) => {
    setError(null);
    setIsConnecting(true);
    try {
      let selected = dev;
      if (!selected) {
        const devices = await (navigator as any).hid.requestDevice({ filters });
        if (devices.length === 0) {
          setIsConnecting(false);
          return;
        }
        selected = devices[0];
      }

      await selected.open();
      selected.addEventListener("inputreport", handleReport);
      setDevice(selected);
      setIsOffline(false);

      const key = `${selected.vendorId}:${selected.productId}`;
      localStorage.setItem("lastUsbScaleKey", key);
      setSavedDeviceInfo(key);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await device?.close();
      setDevice(null);
      setWeight(null);
      setIsOffline(true);
    } catch (err: any) {
      setError(err.message || String(err));
    }
  };

  const clearSavedDevice = () => {
    localStorage.removeItem("lastUsbScaleKey");
    setSavedDeviceInfo(null);
    console.log("Cleared saved scale info from localStorage.");
  };

  // --- Handle reports ---
  const handleReport = (event: HIDInputReportEvent) => {
    const data = event.data;
    const bytes = Array.from(new Uint8Array(data.buffer));
    console.log("Raw HID bytes:", bytes);

    const parsed = parseWeightReport(bytes);
    if (parsed) setWeight(parsed);
  };

  const parseWeightReport = (bytes: number[]): WeightReading | null => {
    if (bytes.length < 5) return null;
    const status = bytes[0];
    const unitCode = bytes[1];
    const sign = bytes[2];
    const rawWeight = bytes[3] + bytes[4] * 256;

    // Only accept "stable" or "active" statuses (2 or 4)
    if (status !== 2 && status !== 4) return null;

    const multiplier = sign === 0 ? 1 : 1; // handle negatives if needed later
    let ounces = 0;
    let grams = 0;

    if (unitCode === 11) {
      ounces = rawWeight / 10;
      grams = ounces * 28.3495;
    } else if (unitCode === 2) {
      grams = rawWeight;
      ounces = grams / 28.3495;
    } else {
      console.warn("Unknown unitCode:", unitCode, "raw:", bytes);
      return null;
    }

    return { ounces: ounces * multiplier, grams: grams * multiplier, raw: bytes };
  };

  // --- Display formatting ---
  let displayValue = "-";
  let secondaryValue = "";

  if (weight) {
    if (displayMode === "imperial") {
      const totalOz = weight.ounces;
      const pounds = Math.floor(totalOz / 16);
      const oz = Math.round(totalOz % 16);
      displayValue = `${pounds} lb ${oz} oz`;
      secondaryValue = `${weight.grams.toFixed(1)} g`;
    } else {
      displayValue = `${weight.grams.toFixed(1)} g`;
      secondaryValue = `${(weight.grams / 1000).toFixed(3)} kg`;
    }
  }

  // --- UI ---
  return (
    <div className="p-4 max-w-md mx-auto border rounded-xl bg-white shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">USB Scale Monitor</h2>
        {supported ? (
          <div className="flex items-center gap-2">
            <button
              onClick={device ? disconnect : () => connect()}
              className={`px-3 py-1 text-sm rounded ${
                device
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              disabled={isConnecting}
            >
              {isConnecting
                ? "Connecting..."
                : device
                ? "Disconnect"
                : "Connect"}
            </button>

            <select
              className="text-sm border rounded px-2 py-1"
              value={displayMode}
              onChange={(e) => setDisplayMode(e.target.value as DisplayMode)}
            >
              <option value="imperial">Imperial</option>
              <option value="metric">Metric</option>
            </select>
          </div>
        ) : (
          <p className="text-red-600 text-sm">
            WebHID not supported. Try Chrome or Edge 89+.
          </p>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      {savedDeviceInfo && (
        <div className="text-xs text-gray-500 mb-2">
          <p>
            <strong>Saved Device:</strong> {savedDeviceInfo}
          </p>
          <button
            onClick={clearSavedDevice}
            className="text-[11px] text-blue-600 underline hover:text-blue-800 mt-1"
          >
            Clear Saved Device
          </button>
        </div>
      )}

      {device && (
        <div className="text-sm text-gray-600 mb-3">
          <p>
            <strong>Connected Device:</strong>{" "}
            {device.productName || "Unknown Device"}
          </p>
          <p>
            <strong>Vendor ID:</strong> {device.vendorId} &nbsp;|&nbsp;
            <strong>Product ID:</strong> {device.productId}
          </p>
        </div>
      )}

      <div className="border rounded-md p-3 mb-4 bg-gray-50 text-xs font-mono h-16 overflow-y-auto">
        {weight?.raw
          ? `Raw HID bytes: [${weight.raw.join(", ")}]`
          : "Waiting for data..."}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500 mb-1">Current Weight</p>
        <p className="text-3xl font-bold">{displayValue}</p>
        {secondaryValue && (
          <p className="text-sm text-gray-500 mt-1">{secondaryValue}</p>
        )}
      </div>

      <div className="text-center mt-3">
        {isOffline ? (
          <p className="inline-block px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
            Device Offline (Turned Off)
          </p>
        ) : device ? (
          <p className="inline-block px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
            Device Connected
          </p>
        ) : (
          <p className="inline-block px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-500">
            No Device
          </p>
        )}
      </div>
    </div>
  );
};

export default UsbScaleMonitor;
