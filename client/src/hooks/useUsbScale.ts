import { useEffect, useRef, useState, useCallback } from "react";

interface WeightReading {
  value: number;
  unit: string;
}

interface SavedScale {
  productName: string;
  vendorId: number;
  productId: number;
}

export const useUsbScale = () => {
  const [supported, setSupported] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<HIDDevice | null>(null);
  const [weight, setWeight] = useState<WeightReading | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [savedScale, setSavedScale] = useState<SavedScale | null>(null);

  const connectedDeviceRef = useRef<HIDDevice | null>(null);
  useEffect(() => {
    connectedDeviceRef.current = connectedDevice;
  }, [connectedDevice]);

  const filters = [
    { vendorId: 0x0a5f, productId: 0x0009 }, // DYMO M25 / M10
    { vendorId: 0x0922, productId: 0x8003 }, // Stamps.com 25lb
    { vendorId: 0x1446, productId: 0x6a73 }, // Smart Weigh
  ];

  // Setup & hotplug handling
  useEffect(() => {
    if (!("hid" in navigator)) return;
    setSupported(true);

    const hid = (navigator as any).hid;
    const stored = JSON.parse(localStorage.getItem("savedScale") || "null");
    if (stored) setSavedScale(stored);

    const handleConnect = async (event: any) => {
      const device: HIDDevice = event.device;
      if (
        stored &&
        device.vendorId === stored.vendorId &&
        device.productId === stored.productId
      ) {
        await connect(device);
      }
    };

    const handleDisconnect = (event: any) => {
      const device: HIDDevice = event.device;
      if (
        connectedDeviceRef.current &&
        device.vendorId === connectedDeviceRef.current.vendorId &&
        device.productId === connectedDeviceRef.current.productId
      ) {
        setConnectedDevice(null);
        setWeight(null);
      }
    };

    hid.addEventListener("connect", handleConnect);
    hid.addEventListener("disconnect", handleDisconnect);

    // Try to reconnect on mount
    refreshDevices();

    return () => {
      hid.removeEventListener("connect", handleConnect);
      hid.removeEventListener("disconnect", handleDisconnect);
    };
  }, []);

  // Automatically attempt to reconnect when rendered
  useEffect(() => {
    if (!("hid" in navigator)) return;
    (async () => {
      const hid = (navigator as any).hid;
      const devices: HIDDevice[] = await hid.getDevices();

      // reconnect to saved scale if found
      if (savedScale) {
        const match = devices.find(
          (d) =>
            d.vendorId === savedScale.vendorId &&
            d.productId === savedScale.productId
        );
        if (match && !match.opened) {
          console.log("🔁 Auto-connecting saved scale...");
          await connect(match);
        }
      }
    })();
  }, [savedScale]);

  const refreshDevices = useCallback(async () => {
    if (!("hid" in navigator)) return;
    const devices = await (navigator as any).hid.getDevices();
    if (!connectedDevice && savedScale) {
      const match = devices.find(
        (d: HIDDevice) =>
          d.vendorId === savedScale.vendorId &&
          d.productId === savedScale.productId
      );
      if (match) await connect(match);
    }
  }, [connectedDevice, savedScale]);

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
      if (!device.opened) await device.open();

      setConnectedDevice(device);
      device.addEventListener("inputreport", (event: HIDInputReportEvent) => {
        const parsed = parseWeightReport(event.data);
        if (parsed) setWeight(parsed);
      });

      const scale = {
        productName: device.productName,
        vendorId: device.vendorId,
        productId: device.productId,
      };
      localStorage.setItem("savedScale", JSON.stringify(scale));
      setSavedScale(scale);
    } catch (err) {
      console.error("Failed to connect:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const quickConnect = async () => {
    if (!("hid" in navigator)) return;
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
        await connect(match);
        return;
      }

      const newDevices: HIDDevice[] = await hid.requestDevice({ filters });
      if (newDevices.length > 0) await connect(newDevices[0]);
    } catch (err) {
      console.error("Quick connect failed:", err);
    }
  };

  const getCurrentWeight = async (): Promise<{ lbs: number; oz: number } | null> => {
    if (!connectedDevice) await quickConnect();

    // Wait for next reading
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 3000);
      const unsub = setInterval(() => {
        if (weight) {
          clearTimeout(timeout);
          clearInterval(unsub);
          const totalOz = weight.value * 16;
          const lbs = Math.floor(totalOz / 16);
          const oz = totalOz % 16;
          resolve({ lbs, oz });
        }
      }, 200);
    });
  };

  return { supported, connectedDevice, connect: quickConnect, getCurrentWeight, isConnecting };
};
