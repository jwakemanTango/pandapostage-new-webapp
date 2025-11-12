import { useState, useEffect } from "react";

/**
 * Wouter-compatible hash-based location hook
 * Works for Electron or environments where browser history isn't ideal
 */
export function useHashLocation(): [string, (path: string) => void] {
  const getHash = () => window.location.hash.replace(/^#/, "") || "/";
  const [loc, setLoc] = useState(getHash);

  useEffect(() => {
    const handler = () => setLoc(getHash());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = (to: string) => {
    window.location.hash = to;
  };

  // ✅ return a mutable tuple
  return [loc, navigate];
}