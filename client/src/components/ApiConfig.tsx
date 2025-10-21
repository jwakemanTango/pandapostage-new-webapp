import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw } from "lucide-react";

export interface ApiConfig {
  baseUrl: string;
  ratesEndpoint: string;
  buyEndpoint: string;
  apiKey?: string;
}

const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: "https://api.example.com",
  ratesEndpoint: "/v1/Rates/quote",
  buyEndpoint: "/v1/Shipments/buy",
  apiKey: "",
};

const STORAGE_KEY = "pandapostage_api_config";

export const useApiConfig = () => {
  const [config, setConfig] = useState<ApiConfig>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
  });

  const saveConfig = (newConfig: ApiConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONFIG));
  };

  return { config, saveConfig, resetConfig };
};

interface ApiConfigProps {
  config: ApiConfig;
  onSave: (config: ApiConfig) => void;
  onReset: () => void;
}

export const ApiConfigPanel = ({ config, onSave, onReset }: ApiConfigProps) => {
  const [baseUrl, setBaseUrl] = useState(config.baseUrl);
  const [ratesEndpoint, setRatesEndpoint] = useState(config.ratesEndpoint);
  const [buyEndpoint, setBuyEndpoint] = useState(config.buyEndpoint);
  const [apiKey, setApiKey] = useState(config.apiKey || "");

  useEffect(() => {
    setBaseUrl(config.baseUrl);
    setRatesEndpoint(config.ratesEndpoint);
    setBuyEndpoint(config.buyEndpoint);
    setApiKey(config.apiKey || "");
  }, [config]);

  const handleSave = () => {
    onSave({
      baseUrl: baseUrl.trim(),
      ratesEndpoint: ratesEndpoint.trim(),
      buyEndpoint: buyEndpoint.trim(),
      apiKey: apiKey.trim() || undefined,
    });
  };

  const hasChanges =
    baseUrl !== config.baseUrl ||
    ratesEndpoint !== config.ratesEndpoint ||
    buyEndpoint !== config.buyEndpoint ||
    apiKey !== (config.apiKey || "");

  return (
    <Card className="border-primary/20" data-testid="api-config-panel">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">API Configuration</CardTitle>
        <CardDescription className="text-xs">
          Configure the external shipping API endpoints for direct frontend calls
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="api-base-url" className="text-xs">
            Base URL
          </Label>
          <Input
            id="api-base-url"
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.example.com"
            className="text-xs h-8"
            data-testid="input-api-base-url"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rates-endpoint" className="text-xs">
            Rates Endpoint
          </Label>
          <Input
            id="rates-endpoint"
            type="text"
            value={ratesEndpoint}
            onChange={(e) => setRatesEndpoint(e.target.value)}
            placeholder="/v1/rates"
            className="text-xs h-8"
            data-testid="input-rates-endpoint"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="buy-endpoint" className="text-xs">
            Buy/Purchase Endpoint
          </Label>
          <Input
            id="buy-endpoint"
            type="text"
            value={buyEndpoint}
            onChange={(e) => setBuyEndpoint(e.target.value)}
            placeholder="/v1/Shipments/buy"
            className="text-xs h-8"
            data-testid="input-buy-endpoint"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="api-key" className="text-xs">
            API Key (Optional)
          </Label>
          <Input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter API key if required"
            className="text-xs h-8"
            data-testid="input-api-key"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            size="sm"
            className="gap-1.5 text-xs flex-1"
            data-testid="button-save-api-config"
          >
            <Save className="h-3 w-3" />
            Save Configuration
          </Button>
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            data-testid="button-reset-api-config"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p className="font-mono">
            Full URLs will be:{" "}
          </p>
          <p className="font-mono text-[10px] mt-1 break-all">
            Rates: {baseUrl}{ratesEndpoint}
          </p>
          <p className="font-mono text-[10px] break-all">
            Buy: {baseUrl}{buyEndpoint}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
