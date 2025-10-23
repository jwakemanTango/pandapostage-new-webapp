import { useEffect, useState, useRef, useCallback } from "react";

export interface WeightReading {
  ounces: number;
  grams: number;
  raw: number[];
}

export interface ScaleProfile {
  id: string;
  name: string;
  parse: (bytes: number[]) => WeightReading | null;
}

export interface KnownScale {
  vendorId: number;
  productId: number;
  name: string;
}

export interface UsbScaleState {
  supported: boolean;
  connectedDevice: HIDDevice | null;
  isConnecting: boolean;
  isOffline: boolean;
  error: string | null;
  weight: WeightReading | null;
  savedDeviceKey: string | null;
  connect: (device?: HIDDevice) => Promise<void>;
  disconnect: () => Promise<void>;
  clearSavedDevice: () => void;
  getCurrentWeight: () => Promise<WeightReading | null>;
  setProfileById: (id: string) => void;
  activeProfile: ScaleProfile | null;
  profiles: ScaleProfile[];
}

/* -----------------------------------------------
   KNOWN DEVICE MAP (for friendly display)
----------------------------------------------- */
const KNOWN_SCALE_IDS: KnownScale[] = [
  { vendorId: 5190, productId: 27379, name: "Stamps.com Model 510 USB Scale" },
  { vendorId: 2338, productId: 32771, name: "DYMO M10" },
  { vendorId: 2338, productId: 32772, name: "DYMO M25" },
  { vendorId: 2338, productId: 32777, name: "DYMO S250" },
  { vendorId: 3768, productId: 8704, name: "Mettler Toledo Ariva" },
  { vendorId: 3768, productId: 61440, name: "Mettler Toledo BC60" },
  { vendorId: 3768, productId: 9223, name: "Ohaus Courier 7000" },
  { vendorId: 2919, productId: 21886, name: "Fairbanks Postal Scale" },
  { vendorId: 7193, productId: 2, name: "Rice Lake (BenchPro / Postal scale)" },
];

/* -----------------------------------------------
   DEFAULT PARSER (covers 99% of USB HID scales)
----------------------------------------------- */
const DEFAULT_PROFILE: ScaleProfile = {
  id: "Default",
  name: "Default USB Scale",
  parse: (bytes) => {
    if (bytes.length < 5) return null;
    const status = bytes[0];
    const unitCode = bytes[1];
    const signByte = bytes[2];
    const rawWeight = bytes[3] + bytes[4] * 256;
    if (status !== 2 && status !== 4) return null;

    const isNegative = signByte === 0x00;
    const multiplier = isNegative ? -1 : 1;

    let ounces = 0;
    let grams = 0;

    if (unitCode === 11) {
      ounces = (rawWeight / 10) * multiplier;
      grams = ounces * 28.3495;
    } else if (unitCode === 2) {
      grams = rawWeight * multiplier;
      ounces = grams / 28.3495;
    } else {
      console.warn("[Scale] Unknown unit code:", unitCode, bytes);
      return null;
    }

    return { ounces, grams, raw: bytes };
  },
};

/* -----------------------------------------------
   MAIN HOOK
----------------------------------------------- */
export function useUsbScale(): UsbScaleState {
  const [supported, setSupported] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<HIDDevice | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weight, setWeight] = useState<WeightReading | null>(null);
  const [savedDeviceKey, setSavedDeviceKey] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<ScaleProfile>(DEFAULT_PROFILE);

  const deviceRef = useRef<HIDDevice | null>(null);
  const connectingRef = useRef(false);
  const manualModeRef = useRef(false);
  const profileRef = useRef<ScaleProfile>(DEFAULT_PROFILE);

  deviceRef.current = connectedDevice;
  profileRef.current = activeProfile;

  const SCALE_PROFILES: ScaleProfile[] = [DEFAULT_PROFILE];

  /* -------------------------------
     Initialization + Auto-Connect
  ------------------------------- */
  useEffect(() => {
    const hasHid = typeof navigator !== "undefined" && "hid" in navigator;
    if (!hasHid) {
      setSupported(false);
      console.warn("[USB Scale] WebHID not supported in this browser.");
      return;
    }

    setSupported(true);
    const hid = (navigator as any).hid;
    const lastKey = localStorage.getItem("lastUsbScaleKey");
    setSavedDeviceKey(lastKey);

    (async () => {
      try {
        const devices: HIDDevice[] = await hid.getDevices();
        if (lastKey && devices.length > 0) {
          const match = devices.find((d) => `${d.vendorId}:${d.productId}` === lastKey);
          if (match) {
            console.log("[Scale] Auto-connecting:", match.productName);
            await connect(match);
          }
        }
      } catch (err: any) {
        // Check if this is a permissions policy error
        if (err instanceof DOMException && err.message.includes("permissions policy")) {
          console.warn("[USB Scale] HID access blocked by permissions policy.");
          setSupported(false);
        } else {
          console.error("[USB Scale] Error checking devices:", err);
        }
      }
    })();

    const handleDisconnect = (event: HIDConnectionEvent) => {
      if (deviceRef.current && event.device === deviceRef.current) {
        console.warn("[Scale] Device disconnected:", event.device.productName);
        setConnectedDevice(null);
        setWeight(null);
        setIsOffline(true);
      }
    };

    const handleConnect = async (event: HIDConnectionEvent) => {
      try {
        const dev = event.device;
        // If we already have this device recorded, ignore
        if (deviceRef.current && dev.vendorId === deviceRef.current.vendorId && dev.productId === deviceRef.current.productId) {
          setIsOffline(false);
          return;
        }

        // Try to open and attach a report listener so this hook instance reflects the connection
        if (!dev.opened) {
          try {
            await dev.open();
          } catch (err) {
            // Opening may fail if another context already has the device open; still try to attach listener below
          }
        }
        dev.addEventListener("inputreport", handleReport);
        setConnectedDevice(dev);
        setIsOffline(false);

        const key = `${dev.vendorId}:${dev.productId}`;
        localStorage.setItem("lastUsbScaleKey", key);
        setSavedDeviceKey(key);

        const known = KNOWN_SCALE_IDS.find(
          (s) => s.vendorId === dev.vendorId && s.productId === dev.productId
        );
        console.log("[Scale] Connected (event):", known?.name ?? dev.productName);
      } catch (err) {
        // ignore connect handler errors
      }
    };

    hid.addEventListener("disconnect", handleDisconnect);
    hid.addEventListener("connect", handleConnect);
    return () => {
      hid.removeEventListener("disconnect", handleDisconnect);
      hid.removeEventListener("connect", handleConnect);
    };
  }, []);

  /* -------------------------------
     Auto-Reconnect
  ------------------------------- */
  useEffect(() => {
    if (!("hid" in navigator) || !supported) return;
    const hid = (navigator as any).hid;

    const interval = setInterval(async () => {
      if (manualModeRef.current || connectingRef.current) return;

      try {
        const devices: HIDDevice[] = await hid.getDevices();
        const current = deviceRef.current;
        const lastKey = localStorage.getItem("lastUsbScaleKey");

        const stillPresent =
          current &&
          devices.some((d) => d.vendorId === current.vendorId && d.productId === current.productId);

        if (current && !stillPresent) {
          console.warn("[Scale] Scale powered off or disconnected.");
          setConnectedDevice(null);
          setWeight(null);
          setIsOffline(true);
        }

        if (!current && lastKey && devices.length > 0) {
          const match = devices.find((d) => `${d.vendorId}:${d.productId}` === lastKey);
          if (match) {
            console.log("[Scale] Reconnecting:", match.productName);
            connectingRef.current = true;
            await connect(match);
            connectingRef.current = false;
            setIsOffline(false);
          }
        }
      } catch (err: any) {
        // Check if this is a permissions policy error
        if (err instanceof DOMException && err.message.includes("permissions policy")) {
          console.warn("[USB Scale] HID access blocked by permissions policy.");
          setSupported(false);
        }
        // Silently ignore other errors in the auto-reconnect loop
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [supported]);

  /* -------------------------------
     Connect / Disconnect
  ------------------------------- */
  const connect = useCallback(async (dev?: HIDDevice) => {
    if (connectingRef.current) return;
    connectingRef.current = true;
    setError(null);
    setIsConnecting(true);
    manualModeRef.current = true;

    try {
      let selected = dev;
      if (!selected) {
        const filters = KNOWN_SCALE_IDS.map((d) => ({
          vendorId: d.vendorId,
          productId: d.productId,
        }));
        const devices: HIDDevice[] = await (navigator as any).hid.requestDevice({ filters });
        if (!devices || devices.length === 0) {
          console.warn("[Scale] User canceled or no device selected.");
          manualModeRef.current = false;
          return;
        }
        selected = devices[0];
      }

      // Try to open the device, but if open() fails (for example because another
      // context already has it open), still attach the inputreport listener and
      // mark this hook instance as connected so the UI can reflect the device.
      try {
        if (!selected.opened) {
          await selected.open();
        }
      } catch (err) {
        // Opening may fail if another context already has the device open.
        // We deliberately continue so this hook can still attach a listener
        // and reflect the connected device state when possible.
        console.warn("[Scale] Warning: unable to open device, continuing to attach listener if possible.", err);
      }

      try {
        selected.addEventListener("inputreport", handleReport);
      } catch (err) {
        // Some environments may throw when adding listeners; ignore to avoid breaking UI.
        console.warn("[Scale] Warning: unable to add inputreport listener:", err);
      }

      setConnectedDevice(selected);
      setIsOffline(false);

      const key = `${selected.vendorId}:${selected.productId}`;
      localStorage.setItem("lastUsbScaleKey", key);
      setSavedDeviceKey(key);

      const known = KNOWN_SCALE_IDS.find(
        (s) => s.vendorId === selected.vendorId && s.productId === selected.productId
      );
      console.log("[Scale] Connected:", known?.name ?? selected.productName);

      setActiveProfile(profileRef.current);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setIsConnecting(false);
      connectingRef.current = false;
    }
  }, []);

  const disconnect = useCallback(async () => {
    manualModeRef.current = true;
    try {
      await connectedDevice?.close();
      setConnectedDevice(null);
      setWeight(null);
      setIsOffline(true);
    } catch (err: any) {
      setError(err.message || String(err));
    }
  }, [connectedDevice]);

  const clearSavedDevice = useCallback(() => {
    localStorage.removeItem("lastUsbScaleKey");
    setSavedDeviceKey(null);
  }, []);

  /* -------------------------------
     Parse HID Reports
  ------------------------------- */
  const handleReport = useCallback((event: HIDInputReportEvent) => {
    const bytes = Array.from(new Uint8Array(event.data.buffer));
    const parsed = profileRef.current.parse(bytes);
    if (parsed) setWeight(parsed);
  }, []);

  /* -------------------------------
     Manual Weight Fetch
  ------------------------------- */
  const getCurrentWeight = useCallback(async (): Promise<WeightReading | null> => {
    const dev = connectedDevice;
    if (!dev) return null;

    const result = await new Promise<WeightReading | null>((resolve) => {
      const handler = (event: HIDInputReportEvent) => {
        const bytes = Array.from(new Uint8Array(event.data.buffer));
        const parsed = profileRef.current.parse(bytes);
        if (parsed) {
          dev.removeEventListener("inputreport", handler);
          setWeight(parsed);
          resolve(parsed);
        }
      };
      dev.addEventListener("inputreport", handler);
      setTimeout(() => {
        dev.removeEventListener("inputreport", handler);
        resolve(weight);
      }, 800);
    });

    return result;
  }, [connectedDevice, weight]);

  /* -------------------------------
     Manual Profile Selection
  ------------------------------- */
  const setProfileById = useCallback((id: string) => {
    const found = SCALE_PROFILES.find((p) => p.id === id);
    if (found) {
      setActiveProfile(found);
      profileRef.current = found;
      console.log("[Scale] Profile manually set:", found.name);
    }
  }, []);

  /* -------------------------------
     Export Hook API
  ------------------------------- */
  return {
    supported,
    connectedDevice,
    isConnecting,
    isOffline,
    error,
    weight,
    savedDeviceKey,
    connect,
    disconnect,
    clearSavedDevice,
    getCurrentWeight,
    setProfileById,
    activeProfile,
    profiles: SCALE_PROFILES,
  };
}
