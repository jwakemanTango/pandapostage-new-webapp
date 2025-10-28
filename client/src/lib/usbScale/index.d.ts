import type { ReactNode, FC } from "react";

/** Represents a single weight reading from the scale */
export interface WeightReading {
  ounces: number;
  grams: number;
  raw: number[];
}

/** Minimal device info */
export interface UsbScaleDevice {
  vendorId: number;
  productId: number;
  productName?: string;
}

/** Optional profile entry (for multiple scale models) */
export interface ScaleProfile {
  id: string;
  name: string;
}

/** Full API interface shared between vanilla and React */
export interface ScaleAPI {
  /** Whether WebHID is supported in this browser */
  supported: boolean;
  /** Currently connected device, if any */
  device: UsbScaleDevice | null;
  /** Indicates a manual or automatic connection attempt */
  isConnecting: boolean;
  /** True if device was previously connected but is now offline */
  isOffline: boolean;
  /** The most recent parsed weight */
  weight: WeightReading | null;
  /** Optional profile set */
  profiles?: ScaleProfile[];
  /** The active scale profile */
  activeProfile?: ScaleProfile | null;
  /** Initiate connection */
  connect: (device?: HIDDevice) => Promise<void>;
  /** Disconnect from the current device */
  disconnect: () => Promise<void>;
  /** Get a one-time weight reading */
  getCurrentWeight: () => Promise<WeightReading | null>;
  /** Select an active scale profile (optional) */
  setProfileById?: (id: string) => void;
}

/** Singleton scale instance usable outside React */
export const scale: ScaleAPI;

/** React hook bound to the singleton scale instance */
export function useScale(): ScaleAPI;

/** React provider that syncs the global scale with React state */
export const ScaleProvider: FC<{ children?: ReactNode }>;
