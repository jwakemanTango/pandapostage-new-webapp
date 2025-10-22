import React, { useEffect, useState } from "react";

interface WeightReading {
  value: number;
  unit: string;
}

export const UsbScaleReader: React.FC = () => {
  const [supported, setSupported] = useState(false);
  const [device, setDevice] = useState<HIDDevice | null>(null);
  const [weight, setWeight] = useState<WeightReading | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filters = [
    { vendorId: 0x0a5f, productId: 0x0009 },
    { vendorId: 0x0922, productId: 0x8003 },
    { vendorId: 0x1446, productId: 0x6a73 },
  ];

  useEffect(() => {
    setSupported("hid" in navigator);
  }, []);

  const connectScale = async () => {
    setError(null);
    try {
      const devices = await (navigator as any).hid.requestDevice({ filters });
      if (devices.length === 0) return;

      const selectedDevice = devices[0];
      await selectedDevice.open();
      setDevice(selectedDevice);
      setConnected(true);

      selectedDevice.addEventListener("inputreport", (event: HIDInputReportEvent) => {
        const parsed = parseWeightReport(event.data);
        if (parsed) setWeight(parsed);
      });
    } catch (err: any) {
      setError(err.message || String(err));
    }
  };

  const parseWeightReport = (data: DataView): WeightReading | null => {
    if (data.byteLength < 5) return null;

    const status = data.getUint8(0);
    const unitCode = data.getUint8(1);
    const rawWeight = data.getUint16(3, true);

    if (status !== 2 && status !== 4) return null;

    // Normalize to ounces
    let ounces = 0;

    if (unitCode === 11) {
      ounces = rawWeight / 10; // already in 0.1 oz increments
    } else if (unitCode === 2) {
      ounces = rawWeight / 28.3495; // grams → ounces
    } else {
      ounces = rawWeight;
    }

    // Convert ounces to lb + oz
    const pounds = Math.floor(ounces / 16);
    const remainingOz = ounces % 16;

    return {
      value: pounds + remainingOz / 16,
      unit: "lb",
    };
  };

  const formatWeight = (reading: WeightReading) => {
    if (!reading) return "--";
    const totalOz = reading.value * 16;
    const pounds = Math.floor(totalOz / 16);
    const ounces = totalOz % 16;
    return `${pounds} lb ${ounces.toFixed(1)} oz`;
  };

  const disconnectScale = async () => {
    try {
      await device?.close();
      setConnected(false);
      setDevice(null);
    } catch (err: any) {
      setError(err.message || String(err));
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg max-w-sm mx-auto border border-gray-100 text-center">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">USB Scale Reader</h2>

      {!supported && (
        <p className="text-red-600">
          Your browser does not support WebHID. Try Chrome or Edge 89+.
        </p>
      )}

      {supported && (
        <>
          <div className="mb-4">
            {!connected ? (
              <button
                onClick={connectScale}
                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Connect Scale
              </button>
            ) : (
              <button
                onClick={disconnectScale}
                className="px-5 py-2.5 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>

          {error && <p className="text-red-500 text-sm mb-3">Error: {error}</p>}

          {connected && (
            <div className="border-t border-gray-200 pt-4">
              {weight ? (
                <>
                  <p className="text-sm text-gray-500">Current Weight</p>
                  <p className="text-5xl font-extrabold mt-1 text-gray-900 tracking-tight">
                    {formatWeight(weight)}
                  </p>
                </>
              ) : (
                <p className="text-gray-400 text-sm mt-2">Waiting for weight data…</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UsbScaleReader;
