import { Show, SignInButton, UserButton } from "@clerk/nextjs";

import { ThemeToggle } from "@/components/theme-toggle";
import { PricingTable } from "@/services/clerk/components/pricing-table";

const HomePage = () => {
  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-4 justify-between items-center">
        <Show when="signed-out">
          <SignInButton />
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
        <ThemeToggle />
      </div>
      <PricingTable />
    </div>
  );
};

export default HomePage;
