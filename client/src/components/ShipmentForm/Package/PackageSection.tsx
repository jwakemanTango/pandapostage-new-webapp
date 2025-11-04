import { Card, CardContent } from "@/components/ui/card";
import { Package, DollarSign, FileText } from "lucide-react";
import { PackageBasicInfo } from "./PackageBasicInfo";
import AdditionalServices from "./AdditionalServices";
import { PackageDetails } from "./PackageDetails";

interface PackageSectionProps {
  form: any;
  showScaleButton?: boolean;
}

/**
 * PackageSection
 * - Displays package info, additional services, and label details.
 * - Add-on Services and Label Details appear side-by-side on wide screens.
 */
export const PackageSection = ({
  form,
  showScaleButton = true,
}: PackageSectionProps) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Package Info */}
      <Card className="border border-border">
        <CardContent className="p-5">
          <h4 className="font-medium text-base mb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Packages
          </h4>
          <PackageBasicInfo showScaleButton={showScaleButton} form={form} />
        </CardContent>
      </Card>

      {/* Responsive two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Additional Services */}
        <Card className="border border-border flex-2">
          <CardContent className="p-5">
            <h4 className="font-medium text-base mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Add-on Services
            </h4>
            <AdditionalServices form={form} />
          </CardContent>
        </Card>

        {/* Label Details */}
        <Card className="border border-border flex-1">
          <CardContent className="p-5">
            <h4 className="font-medium text-base mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Label Details
            </h4>
            <PackageDetails form={form} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
