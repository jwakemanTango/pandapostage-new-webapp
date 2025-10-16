import { ShipmentForm } from "../ShipmentForm-Steps";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

export default function ShipmentFormExample() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-6 max-w-4xl mx-auto bg-background min-h-screen">
        <ShipmentForm 
          onGetRates={(data) => console.log('Get rates:', data)}
          onPurchaseLabel={(data) => console.log('Purchase:', data)}
        />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
