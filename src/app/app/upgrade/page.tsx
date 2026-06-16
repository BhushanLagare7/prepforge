import { AlertTriangle } from "lucide-react";

import { BackLink } from "@/components/back-link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PricingTable } from "@/services/clerk/components/pricing-table";

const UpgradePage = () => {
  return (
    <div className="container py-4 max-w-6xl">
      <div className="mb-4">
        <BackLink href="/app">Dashboard</BackLink>
      </div>

      <div className="space-y-16">
        <Alert variant="warning">
          <AlertTriangle />
          <AlertTitle>Plan Limit Reached</AlertTitle>
          <AlertDescription>
            You have reached the limit of your current plan. Please upgrade to
            continue using all features.
          </AlertDescription>
        </Alert>

        <PricingTable />
      </div>
    </div>
  );
};

export default UpgradePage;
