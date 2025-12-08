// src/components/Debug/debugContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import debugConfig from "@/config/debugContextConfig.json"; // ✅ direct import (no ?raw)

const STORAGE_KEY_DEBUG = "debugSchema_v4";

// Uses localStorage to persist debug context across sessions

// --- Types ---
export type DebugSchema = Record<
  string,
  {
    hide?: boolean;
    toggles?: Record<string, boolean>;
    fields?: Record<string, string>;
    selects?: Record<
      string,
      {
        value: string;
        options: string[];
      }
    >;
  }
>;

interface DebugContextType {
  schema: DebugSchema;
  setSchema: (newSchema: DebugSchema) => void;
  mergeSchema: (updates: Partial<DebugSchema>) => void;
  resetSchemaToDefault: () => void;
  showPanel: boolean;
  togglePanel: () => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export const DebugProvider = ({ children }: { children: React.ReactNode }) => {
  const [schema, setSchemaState] = useState<DebugSchema>({});
  const [showPanel, setShowPanel] = useState(false);

  // --- Initial Load ---
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DEBUG);

      if (stored && stored !== "{}") {
        console.log("[DebugProvider] Using stored schema", JSON.parse(stored));
        setSchemaState(JSON.parse(stored));
      } else {
        console.log("[DebugProvider] Using default debugContextConfig.json", debugConfig);
        setSchemaState(debugConfig);
      }
    } catch (err) {
      console.error("[DebugProvider] Failed to parse stored schema:", err);
      setSchemaState(debugConfig);
    }
  }, []);

  // --- Persist Changes ---
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DEBUG, JSON.stringify(schema));
    } catch (err) {
      console.warn("[DebugProvider] Failed to persist schema:", err);
    }
  }, [schema]);

  // --- API ---
  const setSchema = (newSchema: DebugSchema) => {
    console.log("[DebugProvider] Schema replaced:", newSchema);
    setSchemaState(newSchema);
  };

  const mergeSchema = (updates: Partial<DebugSchema>) => {
    setSchemaState((prev) => {
      const merged: DebugSchema = { ...prev };
      for (const [key, section] of Object.entries(updates)) {
        merged[key] = {
          hide: section?.hide ?? prev[key]?.hide ?? false,
          toggles: { ...(prev[key]?.toggles || {}), ...(section?.toggles || {}) },
          fields: { ...(prev[key]?.fields || {}), ...(section?.fields || {}) },
          selects: { ...(prev[key]?.selects || {}), ...(section?.selects || {}) },
        };
      }
      return merged;
    });
  };

  const resetSchemaToDefault = () => {
    localStorage.removeItem(STORAGE_KEY_DEBUG);
    setSchemaState(debugConfig);
    console.log("[DebugProvider] Schema reset to default from file");
  };

  const togglePanel = () => setShowPanel((p) => !p);

  return (
    <DebugContext.Provider
      value={{
        schema,
        setSchema,
        mergeSchema,
        resetSchemaToDefault,
        // TODO: These should just be values in the schema.. not the context itself
        showPanel,
        togglePanel,
      }}
    >
      {children}
    </DebugContext.Provider>
  );
};

// --- Hooks ---
export const useDebug = (): DebugContextType => {
  const ctx = useContext(DebugContext);
  if (!ctx) throw new Error("useDebug must be used within a <DebugProvider>");
  return ctx;
};

export const useDebugToggle = (section: string, key: string): boolean => {
  const { schema } = useDebug();
  return !!schema?.[section]?.toggles?.[key];
};

export const useDebugField = (section: string, key: string): string => {
  const { schema } = useDebug();
  return schema?.[section]?.fields?.[key] || "";
};

export const useDebugSelect = (section: string, key: string): string => {
  const { schema } = useDebug();
  return schema?.[section]?.selects?.[key]?.value || "";
};
