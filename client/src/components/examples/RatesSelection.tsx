import RatesSelection from "../RatesSelection";
import { Rate } from "@shared/schema";

const mockRates: Rate[] = [
  {
    id: '1',
    carrier: 'USPS',
    service: 'Priority Mail',
    rate: '$8.50',
    retailRate: '$10.20',
    deliveryDays: 3,
    carrierId: 1
  },
  {
    id: '2',
    carrier: 'USPS',
    service: 'First Class',
    rate: '$5.20',
    retailRate: '$6.50',
    deliveryDays: 5,
    carrierId: 1
  },
  {
    id: '3',
    carrier: 'UPS',
    service: 'Ground',
    rate: '$12.75',
    retailRate: '$15.30',
    deliveryDays: 4,
    carrierId: 2
  },
  {
    id: '4',
    carrier: 'FedEx',
    service: '2Day',
    rate: '$18.99',
    retailRate: '$24.50',
    deliveryDays: 2,
    carrierId: 3
  },
];

export default function RatesSelectionExample() {
  return (
    <div className="p-6 max-w-5xl">
      <RatesSelection 
        rates={mockRates}
        onPurchase={(rate) => console.log('Purchase:', rate)}
      />
    </div>
  );
}
