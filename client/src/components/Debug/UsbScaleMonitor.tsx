import { ScaleProvider, useScale } from "@/lib/usbScale/scale-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Scale,
  PlugZap,
  Unplug,
  RefreshCcw,
  Zap,
  Usb,
  Bug,
  FileDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export const UsbScaleMonitor = () => {
  try {
    useScale(); // If global provider exists, reuse it
    return <UsbScaleMonitorInner />;
  } catch {
    // Otherwise, create self-contained provider
    return (
      <ScaleProvider>
        <UsbScaleMonitorInner />
      </ScaleProvider>
    );
  }
};

const UsbScaleMonitorInner = () => {
  const {
    supported,
    device,
    isConnecting,
    isOffline,
    weight,
    connect,
    disconnect,
    getCurrentWeight,
  } = useScale();

  const [displayWeight, setDisplayWeight] = useState(weight);
  const [showDebug, setShowDebug] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [manualReading, setManualReading] = useState("");
  const [manualUnit, setManualUnit] = useState("oz");

  // Update displayed weight when live updates are active
  useEffect(() => {
    if (autoRefresh) setDisplayWeight(weight);
  }, [autoRefresh, weight]);

  const handleFetchWeight = async () => {
    const w = await getCurrentWeight?.();
    if (w) setDisplayWeight(w);
  };

  // Poll weight periodically if auto-refresh is enabled
  useEffect(() => {
    if (!autoRefresh || !device) return;
    const interval = setInterval(handleFetchWeight, 1500);
    return () => clearInterval(interval);
  }, [autoRefresh, device]);

  const handleConnect = async () => {
    if (device) await disconnect();
    else await connect();
  };

  const ounces = displayWeight?.ounces ?? 0;
  const grams = displayWeight?.grams ?? 0;
  const pounds = ounces / 16;
  const kilograms = grams / 1000;

  const vendorId = device?.vendorId;
  const productId = device?.productId;
  const showVendorProduct = vendorId && productId;

  // Extract HID collection info
  const collections = device?.collections || [];
  const usageDetails =
    collections.length > 0
      ? collections
          .map(
            (c, i) =>
              `${i + 1}: usagePage=${c.usagePage ?? "?"}, usage=${c.usage ?? "?"}`
          )
          .join("; ")
      : "N/A";

  const handleDownloadReport = () => {
    const info = `
USB SCALE DIAGNOSTIC REPORT
===========================

Device: ${device?.productName || "N/A"}
Vendor/Product: ${vendorId || "?"}:${productId || "?"}
Connected: ${device ? "Yes" : "No"}
Auto-refresh: ${autoRefresh ? "Enabled" : "Disabled"}

Usage Info:
${usageDetails}

Manual Reading:
Value: ${manualReading || "N/A"} ${manualUnit}

Raw Weight Data:
${JSON.stringify(displayWeight, null, 2)}
`;
    const blob = new Blob([info], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "usb-scale-report.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-6">
      <Card className="max-w-md w-full mx-auto border border-gray-200 shadow-sm rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold">
                USB Scale Monitor
              </CardTitle>
            </div>
            {isOffline && (
              <span className="text-xs text-red-500 font-medium">Offline</span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          {!supported ? (
            <p className="text-muted-foreground text-sm">
              This browser does not support USB HID access.
            </p>
          ) : (
            <>
              {/* Device Info */}
              <div className="grid grid-cols-2 gap-y-1">
                <span className="text-gray-500">Device</span>
                <span className="text-right font-medium text-gray-800 truncate">
                  {device?.productName || "No device connected"}
                </span>

                {showVendorProduct && (
                  <>
                    <span className="text-gray-500">Vendor / Product</span>
                    <span className="text-right text-gray-800">
                      {vendorId}:{productId}
                    </span>
                  </>
                )}

                {device && (
                  <>
                    <span className="text-gray-500">Usage Page(s)</span>
                    <span className="text-right text-gray-800 text-xs break-words">
                      {usageDetails}
                    </span>
                  </>
                )}
              </div>

              {/* Connect / Disconnect */}
              <div className="flex gap-2">
                <Button
                  variant={device ? "outline" : "default"}
                  className="flex-1 text-sm"
                  disabled={isConnecting}
                  onClick={handleConnect}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Connecting...
                    </>
                  ) : device ? (
                    <>
                      <Unplug className="h-4 w-4 mr-2" /> Disconnect
                    </>
                  ) : (
                    <>
                      <PlugZap className="h-4 w-4 mr-2" /> Connect
                    </>
                  )}
                </Button>
              </div>

              {/* Weight Display Section */}
              {device ? (
                <div className="rounded-md border bg-gray-50 p-3 text-center space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-700">
                      Current Weight
                    </p>
                    <label className="flex items-center gap-1.5 text-xs text-gray-600 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        className="accent-primary h-3.5 w-3.5"
                      />
                      Auto-refresh
                    </label>
                  </div>

                  {/* Main readings */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase">
                        Pounds
                      </p>
                      <p className="text-xl font-semibold text-gray-900">
                        {pounds.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase">
                        Ounces
                      </p>
                      <p className="text-xl font-semibold text-gray-900">
                        {ounces.toFixed(1)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-1.5 grid grid-cols-2 gap-3 text-xs text-gray-600">
                    <div>
                      <span className="text-gray-400">Grams</span>
                      <p className="font-medium">{grams.toFixed(0)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Kilograms</span>
                      <p className="font-medium">{kilograms.toFixed(3)}</p>
                    </div>
                  </div>

                  {!autoRefresh && (
                    <div className="pt-2.5">
                      <Button
                        onClick={handleFetchWeight}
                        disabled={!device || isConnecting}
                        className="w-full text-sm font-medium flex items-center justify-center gap-1.5 bg-primary text-white hover:bg-primary/90 transition-all"
                      >
                        <RefreshCcw className="h-4 w-4" />
                        Refresh Weight
                      </Button>
                    </div>
                  )}

                  <p className="text-[11px] text-gray-500 mt-1.5 flex items-center justify-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    {autoRefresh ? "Streaming..." : "Manual mode"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-500 text-sm pt-2">
                  <Usb className="h-5 w-5 mb-1 text-gray-400" />
                  <p>No active USB scale connection.</p>
                </div>
              )}

              {/* Manual Reading */}
              {device && (
                <div className="border-t pt-3 space-y-2">
                  <p className="font-medium text-gray-700 text-sm">
                    Manual Reading (from scale display)
                  </p>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Enter value..."
                      value={manualReading}
                      onChange={(e) => setManualReading(e.target.value)}
                      className="flex-1 border rounded-md px-2 py-1 text-sm"
                    />
                    <select
                      title="Select units"
                      value={manualUnit}
                      onChange={(e) => setManualUnit(e.target.value)}
                      className="border rounded-md px-2 py-1 text-sm"
                    >
                      <option value="oz">oz</option>
                      <option value="lb">lb</option>
                      <option value="lb+oz">lb+oz</option>
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="kg+g">kg+g</option>
                    </select>
                  </div>

                  <Button
                    onClick={handleDownloadReport}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 text-sm"
                  >
                    <FileDown className="h-4 w-4" />
                    Download Diagnostic Report
                  </Button>
                </div>
              )}

              {/* Debug Section */}
              {displayWeight && (
                <div className="mt-3 border-t pt-2">
                  <button
                    onClick={() => setShowDebug(!showDebug)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:underline w-full"
                  >
                    <Bug className="h-4 w-4 text-gray-500" />
                    Debug
                    <span className="ml-auto text-gray-400">
                      {showDebug ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </span>
                  </button>

                  {showDebug && (
                    <pre className="mt-2 bg-white border border-gray-200 rounded-md p-2 text-xs overflow-x-auto text-gray-800">
                      {JSON.stringify(displayWeight, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
