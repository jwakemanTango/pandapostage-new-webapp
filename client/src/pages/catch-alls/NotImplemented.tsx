import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4 shadow-sm border border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center mb-4 gap-2">
            <Construction className="h-8 w-8 text-amber-500" />
            <h1 className="text-2xl font-bold text-gray-900">
              Coming Soon
            </h1>
          </div>

          <p className="text-sm text-gray-600">
            This feature or page is not yet implemented.
            We’re still building it — check back soon!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
