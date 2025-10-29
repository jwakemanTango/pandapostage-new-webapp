/* ------------------------------------------------------------------
   USB Scale Core (Vanilla, TypeScript-compatible)
   - Framework-agnostic singleton interface
   - Emits updates for React or vanilla listeners
   - Supports 3 filter modes: all | scale | known
-------------------------------------------------------------------*/

export interface HIDDeviceFilter {
  vendorId?: number;
  productId?: number;
  usagePage?: number;
  usage?: number;
}

export interface WeightData {
  ounces: number;
  grams: number;
  raw: number[];
}

export interface ScaleSnapshot {
  supported: boolean;
  device: HIDDevice | null;
  isConnecting: boolean;
  isOffline: boolean;
  weight: WeightData | null;
  error: string | null;
  activeProfile: any;
  profiles: any[];
  connect: (dev?: HIDDevice) => Promise<void>;
  disconnect: () => Promise<void>;
  getCurrentWeight: () => Promise<WeightData | null>;
}

export type ScaleListener = (snapshot: ScaleSnapshot) => void;
export type ScaleFilterMode = "all" | "scale" | "known";

const DEFAULT_KNOWN_SCALES: HIDDeviceFilter[] = [
  { vendorId: 5190, productId: 27379 },  // Stamps.com Model 510
  { vendorId: 2338, productId: 32771 },  // DYMO M10
  { vendorId: 2338, productId: 32772 },  // DYMO M25
  { vendorId: 2338, productId: 32777 },  // DYMO S250
  //{ vendorId: 3768, productId: 8704 },   // Mettler Toledo Ariva
  //{ vendorId: 3768, productId: 61440 },  // Mettler Toledo BC60
  //{ vendorId: 3768, productId: 9223 },   // Ohaus Courier 7000
  //{ vendorId: 2919, productId: 21886 },  // Fairbanks Postal Scale
  //{ vendorId: 7193, productId: 2 },      // Rice Lake BenchPro
];

export class UsbScale {
  knownScales: HIDDeviceFilter[] = [...DEFAULT_KNOWN_SCALES];
  filterMode: ScaleFilterMode = "known";

  supported = false;
  device: HIDDevice | null = null;
  isConnecting = false;
  isOffline = false;
  weight: WeightData | null = null;
  error: string | null = null;
  activeProfile: any = null;
  profiles: any[] = [];

  private hid: HID | null = null;
  private listeners: Set<ScaleListener> = new Set();

  constructor() {
    if (typeof navigator !== "undefined" && (navigator as any).hid) {
      this.supported = true;
      this.hid = (navigator as any).hid as HID;
      this.hid.addEventListener("connect", this.onConnect as EventListener);
      this.hid.addEventListener("disconnect", this.onDisconnect as EventListener);
      void this.autoReconnect();
    } else {
      console.warn("[UsbScale] WebHID not supported in this environment.");
    }
  }

  /* --------------------------
     Filter mode management
  -------------------------- */
  setFilterMode = (mode: ScaleFilterMode): void => {
    this.filterMode = mode;
    console.log("[UsbScale] Filter mode set to:", mode);
  };

  private getCurrentFilters(): HIDDeviceFilter[] {
    switch (this.filterMode) {
      case "all":
        // Show all HID devices (empty filters)
        return [];
      case "scale":
        // Show all devices under the POS Scale usage page (0x8D)
        // Source: USB-IF HID Usage Tables v1.21, Section 15 "Scale Page"
        return [{ usagePage: 0x8D }];
      case "known":
      default:
        return this.knownScales;
    }
  }

  /* --------------------------
     Event helpers
  -------------------------- */
  private emit = (): void => {
    const snap = this.snapshot;
    for (const cb of this.listeners) cb({ ...snap });
  };

  private onReport = (event: HIDInputReportEvent): void => {
    const bytes = Array.from(new Uint8Array(event.data.buffer));
    const parsed = this.parseWeight(bytes);
    if (parsed) {
      this.weight = parsed;
      this.isOffline = false;
      this.emit();
    }
  };

  private onConnect = async (event: Event): Promise<void> => {
    const e = event as any as HIDConnectionEvent;
    if (this.device && e.device === this.device) return;
    try {
      if (!e.device.opened) await e.device.open();
      e.device.addEventListener("inputreport", this.onReport);
      this.device = e.device;
      this.isOffline = false;
      localStorage.setItem("lastUsbScaleKey", `${e.device.vendorId}:${e.device.productId}`);
      console.log("[UsbScale] Connected:", e.device.productName);
      this.emit();
    } catch (err: any) {
      console.error("[UsbScale] Connect handler error:", err);
    }
  };

  private onDisconnect = (event: Event): void => {
    const e = event as any as HIDConnectionEvent;
    if (!this.device || e.device !== this.device) return;
    console.warn("[UsbScale] Disconnected:", e.device.productName);
    this.device = null;
    this.weight = null;
    this.isOffline = true;
    this.emit();
  };

  /* --------------------------
     Safe auto-reconnect
  -------------------------- */
  private autoReconnect = async (): Promise<void> => {
    const key = localStorage.getItem("lastUsbScaleKey");
    if (!key || !this.hid) return;

    try {
      const devices = await this.hid.getDevices();
      const match = devices.find((d) => `${d.vendorId}:${d.productId}` === key);
      if (match) {
        if (!match.opened) await match.open();
        match.addEventListener("inputreport", this.onReport);
        this.device = match;
        this.isOffline = false;
        console.log("[UsbScale] Auto-reconnected:", match.productName);
        this.emit();
      }
    } catch (err) {
      console.warn("[UsbScale] Auto-reconnect failed:", err);
    }
  };

  /* --------------------------
     Weight parsing
  -------------------------- */
  private parseWeight = (bytes: number[]): WeightData | null => {
    if (bytes.length < 5) return null;
    const status = bytes[0];
    const unitCode = bytes[1];
    const signByte = bytes[2];
    const rawWeight = bytes[3] + bytes[4] * 256;
    if (status !== 2 && status !== 4) return null;

    const multiplier = signByte === 0x00 ? -1 : 1;
    let ounces = 0;
    let grams = 0;

    if (unitCode === 11) {
      ounces = (rawWeight / 10) * multiplier;
      grams = ounces * 28.3495;
    } else if (unitCode === 2) {
      grams = rawWeight * multiplier;
      ounces = grams / 28.3495;
    } else {
      console.warn("[UsbScale] Unknown unit code:", unitCode, bytes);
      return null;
    }

    return { ounces, grams, raw: bytes };
  };

  /* --------------------------
     Public API
  -------------------------- */

  connect = async (dev?: HIDDevice): Promise<void> => {
    if (!this.supported || this.isConnecting) return;
    this.isConnecting = true;
    this.error = null;
    this.emit();

    try {
      let selected = dev;
      if (!selected) {
        const filters = this.getCurrentFilters();
        const devices = await this.hid?.requestDevice({ filters });
        if (!devices || !devices.length) {
          this.isConnecting = false;
          this.emit();
          return;
        }
        selected = devices[0];
      }

      if (!selected.opened) await selected.open();
      selected.addEventListener("inputreport", this.onReport);
      this.device = selected;
      this.isOffline = false;

      const key = `${selected.vendorId}:${selected.productId}`;
      localStorage.setItem("lastUsbScaleKey", key);
      console.log("[UsbScale] Connected:", selected.productName);
    } catch (err: any) {
      this.error = err.message || String(err);
      console.error("[UsbScale] Connection error:", err);
    } finally {
      this.isConnecting = false;
      this.emit();
    }
  };

  disconnect = async (): Promise<void> => {
    if (!this.device) return;
    try {
      await this.device.close();
    } catch (err) {
      console.warn("[UsbScale] Disconnect error:", err);
    } finally {
      this.device = null;
      this.weight = null;
      this.isOffline = true;
      this.emit();
    }
  };

  getCurrentWeight = async (): Promise<WeightData | null> => {
    if (!this.device) return null;
    return new Promise<WeightData | null>((resolve) => {
      const handler = (event: HIDInputReportEvent) => {
        const bytes = Array.from(new Uint8Array(event.data.buffer));
        const parsed = this.parseWeight(bytes);
        if (parsed) {
          this.device?.removeEventListener("inputreport", handler);
          this.weight = parsed;
          this.emit();
          resolve(parsed);
        }
      };
      this.device?.addEventListener("inputreport", handler);
      setTimeout(() => {
        this.device?.removeEventListener("inputreport", handler);
        resolve(this.weight);
      }, 800);
    });
  };

  subscribe = (callback: ScaleListener): (() => void) => {
    this.listeners.add(callback);
    callback({ ...this.snapshot });
    return () => this.listeners.delete(callback);
  };

  setKnownScales = (list: HIDDeviceFilter[] = []): void => {
    if (Array.isArray(list)) this.knownScales = list;
    else console.warn("[UsbScale] setKnownScales expects an array");
  };

  /* --------------------------
     Snapshot getter
  -------------------------- */
  get snapshot(): ScaleSnapshot {
    return {
      supported: this.supported,
      device: this.device,
      isConnecting: this.isConnecting,
      isOffline: this.isOffline,
      weight: this.weight,
      error: this.error,
      activeProfile: this.activeProfile,
      profiles: this.profiles,
      connect: this.connect,
      disconnect: this.disconnect,
      getCurrentWeight: this.getCurrentWeight,
    };
  }
}

/* Export singleton instance */
export const scale = new UsbScale();
