import React, { createContext, useContext, useEffect, useState } from "react";
import { scale } from "./scale.js";

// Create a context with the initial snapshot
const ScaleContext = createContext(scale.snapshot);

export const ScaleProvider = ({ children }) => {
  const [snapshot, setSnapshot] = useState({ ...scale.snapshot });

  useEffect(() => {
    console.log("[ScaleProvider] Mounting…");
    
    // Subscribe to singleton updates
    const unsubscribe = scale.subscribe((newSnap) => {
      //console.log("[ScaleProvider] Update received:", newSnap.device?.productName || "(no device)");
      // Always use a fresh object reference to trigger re-render
      setSnapshot({ ...newSnap });
    });

    // Capture initial state after possible auto-connect
    console.log(
      "[ScaleProvider] Initial snapshot:",
      scale.snapshot.device?.productName || "(no device)"
    );
    setSnapshot({ ...scale.snapshot });

    return () => {
      console.log("[ScaleProvider] Unmounting…");
      unsubscribe?.();
    };
  }, []);

  return (
    <ScaleContext.Provider value={{ ...snapshot }}>
      {children}
    </ScaleContext.Provider>
  );
};

// Hook for consuming scale state safely
export const useScale = () => {
  const ctx = useContext(ScaleContext);
  if (!ctx) {
    throw new Error("useScale must be used within a <ScaleProvider>");
  }
  return ctx;
};
