import React, { createContext, useContext, useState, useEffect } from "react";


const STORAGE_KEY = "debugSchema_v1";

// Default schema
const defaultSchema: DebugSchema = {
  api: {
    fields: {
      apiBaseUrl: "/",
      ratesEndpoint: "/v1/Rates/quote",
      buyEndpoint: "/v1/Shipments/buy",
      apiKey: "",
    },
  },
  devices: {
    toggles: {
      showScaleMonitor: false,
    },
  },
  shipping: {
    toggles: {
      showForm: true,
      showSidebar: true,
      showBanner: true,
      showLabelPreview: true,
      showScaleButton: true,
    },
  },
};

export type DebugSchema = Record<
  string,
  {
    toggles?: Record<string, boolean>;
    fields?: Record<string, string>;
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
  // Load persisted schema or defaults
  const [schema, setSchemaState] = useState<DebugSchema>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (err) {
      console.warn("[DebugProvider] Failed to parse saved schema:", err);
    }
    return defaultSchema;
  });

  const [showPanel, setShowPanel] = useState(false);

  // Persist schema
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schema));
    } catch (err) {
      console.warn("[DebugProvider] Failed to persist schema:", err);
    }
  }, [schema]);

  // Replace schema completely
  const setSchema = (newSchema: DebugSchema) => {
    console.log("[DebugProvider] Schema replaced:", newSchema);
    setSchemaState(newSchema);
  };

  // Merge schema updates without overwriting existing sections
  const mergeSchema = (updates: Partial<DebugSchema>) => {
    setSchemaState((prev) => {
      const merged: DebugSchema = { ...prev };
      for (const [key, section] of Object.entries(updates)) {
        merged[key] = {
          toggles: { ...(prev[key]?.toggles || {}), ...(section?.toggles || {}) },
          fields: { ...(prev[key]?.fields || {}), ...(section?.fields || {}) },
        };
      }
      //console.log("[DebugProvider] Schema merged:", merged);
      return merged;
    });
  };

  // Reset to defaults (clear localStorage)
  const resetSchemaToDefault = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSchemaState(defaultSchema);
    console.log("[DebugProvider] Schema reset to default");
  };

  const togglePanel = () => setShowPanel((p) => !p);

  return (
    <DebugContext.Provider
      value={{
        schema,
        setSchema,
        mergeSchema,
        resetSchemaToDefault,
        showPanel,
        togglePanel,
      }}
    >
      {children}
    </DebugContext.Provider>
  );
};

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
