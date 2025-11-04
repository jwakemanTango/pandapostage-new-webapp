import React, { createContext, useContext, useEffect, useState } from "react";
import { scale, type ScaleSnapshot } from "./scale";

// Extend the snapshot with API methods
interface ScaleContextValue extends ScaleSnapshot {
  setKnownScales?: (list: any[]) => void;
  setFilterMode?: (mode: "all" | "scale" | "known") => void;
}

// Create context
const ScaleContext = createContext<ScaleContextValue | undefined>(undefined);

// Provider
export const ScaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snapshot, setSnapshot] = useState<ScaleSnapshot>({ ...scale.snapshot });

  useEffect(() => {
    // Subscribe to singleton updates
    const unsubscribe = scale.subscribe((newSnap) => {
      // Always use a fresh object reference to trigger re-render
      setSnapshot({ ...newSnap });
    });

    // Capture initial snapshot
    setSnapshot({ ...scale.snapshot });

    return () => unsubscribe();
  }, []);

  const contextValue: ScaleContextValue = {
    ...snapshot,
    setKnownScales: scale.setKnownScales.bind(scale),
    setFilterMode: scale.setFilterMode.bind(scale),
  };

  return <ScaleContext.Provider value={contextValue}>{children}</ScaleContext.Provider>;
};

// Hook
export const useScale = () => {
  const ctx = useContext(ScaleContext);
  if (!ctx) throw new Error("useScale must be used within a <ScaleProvider>");
  return ctx;
};
