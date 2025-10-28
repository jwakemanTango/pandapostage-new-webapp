import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Save, RotateCcw, ChevronDown, Activity, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface ApiConfig {
  baseUrl: string;
  ratesEndpoint: string;
  buyEndpoint: string;
  apiKey?: string;
}

const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: "/",
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
  const [isOpen, setIsOpen] = useState(false);
  const [isTestingHealth, setIsTestingHealth] = useState(false);
  const [healthStatus, setHealthStatus] = useState<"success" | "error" | null>(null);
  const { toast } = useToast();

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
    toast({
      title: "Configuration Saved",
      description: "API configuration has been updated successfully.",
    });
  };

  const handleTestHealth = async () => {
    const trimmedBaseUrl = baseUrl.trim();
    
    // Validate base URL before making request
    if (!trimmedBaseUrl) {
      toast({
        title: "Invalid Configuration",
        description: "Please enter a Base URL before testing the connection.",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(trimmedBaseUrl);
    } catch {
      toast({
        title: "Invalid Base URL",
        description: "Please enter a valid URL (e.g., https://api.example.com)",
        variant: "destructive",
      });
      return;
    }

    setIsTestingHealth(true);

    try {
      const headers: Record<string, string> = {};
      if (apiKey.trim()) {
        headers["Authorization"] = `Bearer ${apiKey.trim()}`;
      }

      const response = await fetch(`${trimmedBaseUrl}/api/health`, {
        method: "GET",
        headers,
      });

      if (response.ok) {
        setHealthStatus("success");
        toast({
          title: "Connection Successful",
          description: `Health check passed with status ${response.status}`,
        });
      } else {
        setHealthStatus("error");
        toast({
          title: "Connection Failed",
          description: `Health check failed with status ${response.status}`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setHealthStatus("error");
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect to API",
        variant: "destructive",
      });
    } finally {
      setIsTestingHealth(false);
    }
  };

  const hasChanges =
    baseUrl !== config.baseUrl ||
    ratesEndpoint !== config.ratesEndpoint ||
    buyEndpoint !== config.buyEndpoint ||
    apiKey !== (config.apiKey || "");

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} data-testid="api-config-panel">
      <Card className="border-primary/20">
        <CollapsibleTrigger className="w-full" asChild>
          <CardHeader className="pb-3 cursor-pointer hover-elevate">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div>
                  <CardTitle className="text-sm font-semibold">API Configuration</CardTitle>
                  <CardDescription className="text-xs">
                    Configure the external shipping API endpoints for direct frontend calls
                  </CardDescription>
                </div>
                {healthStatus === "success" && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" data-testid="health-status-success" />
                )}
                {healthStatus === "error" && (
                  <XCircle className="h-4 w-4 text-red-500" data-testid="health-status-error" />
                )}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
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
                placeholder="/v1/Rates/quote"
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
                Save
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
              <Button
                onClick={handleTestHealth}
                disabled={isTestingHealth}
                variant="secondary"
                size="sm"
                className="gap-1.5 text-xs"
                data-testid="button-test-health"
              >
                {isTestingHealth ? (
                  <Activity className="h-3 w-3 animate-spin" />
                ) : healthStatus === "success" ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : healthStatus === "error" ? (
                  <XCircle className="h-3 w-3 text-red-500" />
                ) : (
                  <Activity className="h-3 w-3" />
                )}
                Test
              </Button>
            </div>

            <div className="text-xs text-muted-foreground pt-2 border-t">
              <p className="font-mono">
                Full URLs will be:{" "}
              </p>
              <p className="font-mono text-[10px] mt-1 break-all">
                Health: {baseUrl}/api/health
              </p>
              <p className="font-mono text-[10px] break-all">
                Rates: {baseUrl}{ratesEndpoint}
              </p>
              <p className="font-mono text-[10px] break-all">
                Buy: {baseUrl}{buyEndpoint}
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
