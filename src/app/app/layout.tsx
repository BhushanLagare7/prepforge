import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/services/clerk/lib/get-current-user";

import { Navbar } from "./_navbar";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = async ({ children }: AppLayoutProps) => {
  const { userId, user } = await getCurrentUser({ allData: true });

  if (userId == null) return redirect("/");
  if (user == null) return redirect("/onboarding");

  return (
    <>
      <Navbar user={user} />
      {children}
    </>
  );
};

export default AppLayout;
