import { redirect } from "next/navigation";

import { getCurrentUser } from "@/services/clerk/lib/get-current-user";

import { OnboardingClient } from "./_client";

const OnboardingPage = async () => {
  const { userId, user } = await getCurrentUser({ allData: true });

  if (userId == null) return redirect("/");
  if (user != null) return redirect("/app");

  return (
    <div className="container flex flex-col gap-4 justify-center items-center h-screen">
      <h1 className="text-4xl">Creating your account...</h1>
      <OnboardingClient userId={userId} />
    </div>
  );
};

export default OnboardingPage;
