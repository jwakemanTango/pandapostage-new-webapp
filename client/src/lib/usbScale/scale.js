/* ------------------------------------------------------------------
   USB Scale Core (Vanilla)
   - Framework-agnostic singleton interface
   - Emits updates for React or vanilla listeners
   - Safe for destructuring (arrow-bound methods)
-------------------------------------------------------------------*/


const DEFAULT_KNOWN_SCALES = [
  { vendorId: 5190, productId: 27379 },  // Stamps.com Model 510
  { vendorId: 2338, productId: 32771 },  // DYMO M10
  { vendorId: 2338, productId: 32772 },  // DYMO M25
  { vendorId: 2338, productId: 32777 },  // DYMO S250
  { vendorId: 3768, productId: 8704 },   // Mettler Toledo Ariva
  { vendorId: 3768, productId: 61440 },  // Mettler Toledo BC60
  { vendorId: 3768, productId: 9223 },   // Ohaus Courier 7000
  { vendorId: 2919, productId: 21886 },  // Fairbanks Postal Scale
  { vendorId: 7193, productId: 2 },      // Rice Lake BenchPro
];

export class UsbScale {
  knownScales = [...DEFAULT_KNOWN_SCALES];
  allowAllDevices = false;
  supported = false;
  device = null;
  isConnecting = false;
  isOffline = false;
  weight = null;
  error = null;
  activeProfile = null;
  profiles = [];

  #hid = null;
  #listeners = new Set();

  constructor() {
    if (typeof navigator !== "undefined" && navigator.hid) {
      this.supported = true;
      this.#hid = navigator.hid;
      this.#hid.addEventListener("connect", this.#onConnect);
      this.#hid.addEventListener("disconnect", this.#onDisconnect);
      this.#autoReconnect();
    } else {
      console.warn("[UsbScale] WebHID not supported in this environment.");
    }
  }

  /* --------------------------
     Event helpers
  -------------------------- */
  #emit = () => {
    const snap = this.snapshot;
    // ensure new object reference each time
    for (const cb of this.#listeners) cb({ ...snap });
  };

  #onReport = (event) => {
    const bytes = Array.from(new Uint8Array(event.data.buffer));
    const parsed = this.#parseWeight(bytes);
    if (parsed) {
      this.weight = parsed;
      this.isOffline = false;
      this.#emit();
    }
  };

  #onConnect = async (event) => {
    // Prevent double connection
    if (this.device && event.device === this.device) return;
    try {
      if (!event.device.opened) await event.device.open();
      event.device.addEventListener("inputreport", this.#onReport);
      this.device = event.device;
      this.isOffline = false;
      localStorage.setItem("lastUsbScaleKey", `${event.device.vendorId}:${event.device.productId}`);
      console.log("[UsbScale] Connected:", event.device.productName);
      this.#emit();
    } catch (err) {
      console.error("[UsbScale] Connect handler error:", err);
    }
  };

  #onDisconnect = (event) => {
    if (!this.device || event.device !== this.device) return;
    console.warn("[UsbScale] Disconnected:", event.device.productName);
    this.device = null;
    this.weight = null;
    this.isOffline = true;
    this.#emit();
  };

  /* --------------------------
     Safe auto-reconnect
  -------------------------- */
  #autoReconnect = async () => {
    const key = localStorage.getItem("lastUsbScaleKey");
    if (!key || !this.#hid) return;

    try {
      const devices = await this.#hid.getDevices();
      const match = devices.find((d) => `${d.vendorId}:${d.productId}` === key);
      if (match) {
        if (!match.opened) await match.open();
        match.addEventListener("inputreport", this.#onReport);
        this.device = match;
        this.isOffline = false;
        console.log("[UsbScale] Auto-reconnected:", match.productName);
        this.#emit();
      }
    } catch (err) {
      console.warn("[UsbScale] Auto-reconnect failed:", err);
    }
  };

  /* --------------------------
     Weight parsing
  -------------------------- */
  #parseWeight = (bytes) => {
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
     Public API (arrow-bound)
  -------------------------- */

  connect = async (dev) => {
    if (!this.supported || this.isConnecting) return;
    this.isConnecting = true;
    this.error = null;
    this.#emit();

    try {
      let selected = dev;
      if (!selected) {
        const filters = this.allowAllDevices ? [] : this.knownScales;
        const devices = await this.#hid.requestDevice(
          filters.length ? { filters } : {} // empty object means show all
        );
        if (!devices?.length) {
          this.isConnecting = false;
          this.#emit();
          return;
        }
        selected = devices[0];
      }

      if (!selected.opened) await selected.open();
      selected.addEventListener("inputreport", this.#onReport);
      this.device = selected;
      this.isOffline = false;

      const key = `${selected.vendorId}:${selected.productId}`;
      localStorage.setItem("lastUsbScaleKey", key);

      console.log("[UsbScale] Connected:", selected.productName);
    } catch (err) {
      this.error = err.message || String(err);
      console.error("[UsbScale] Connection error:", err);
    } finally {
      this.isConnecting = false;
      this.#emit();
    }
  };

  disconnect = async () => {
    if (!this.device) return;
    try {
      await this.device.close();
    } catch (err) {
      console.warn("[UsbScale] Disconnect error:", err);
    } finally {
      this.device = null;
      this.weight = null;
      this.isOffline = true;
      this.#emit();
    }
  };

  getCurrentWeight = async () => {
    if (!this.device) return null;
    return new Promise((resolve) => {
      const handler = (event) => {
        const bytes = Array.from(new Uint8Array(event.data.buffer));
        const parsed = this.#parseWeight(bytes);
        if (parsed) {
          this.device.removeEventListener("inputreport", handler);
          this.weight = parsed;
          this.#emit();
          resolve(parsed);
        }
      };
      this.device.addEventListener("inputreport", handler);
      setTimeout(() => {
        this.device?.removeEventListener("inputreport", handler);
        resolve(this.weight);
      }, 800);
    });
  };

  subscribe = (callback) => {
    this.#listeners.add(callback);
    // immediately push current snapshot
    callback({ ...this.snapshot });
    return () => this.#listeners.delete(callback);
  };

  setKnownScales = (list = []) => {
    if (Array.isArray(list)) this.knownScales = list;
    else console.warn("[UsbScale] setKnownScales expects an array");
  };

  setAllowAllDevices = (enabled = true) => {
    this.allowAllDevices = enabled;
  };

  /* --------------------------
     Snapshot getter
  -------------------------- */
  get snapshot() {
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

/* Export a singleton instance */
export const scale = new UsbScale();
