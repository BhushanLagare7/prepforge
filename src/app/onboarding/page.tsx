import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { clerkClient } from "@clerk/nextjs/server";

import { upsertUser } from "@/features/users/db";
import { getCurrentUser } from "@/services/clerk/lib/get-current-user";

export const metadata: Metadata = {
  title: "Setting Up Your Account",
  robots: { index: false, follow: false },
};

const OnboardingPage = async () => {
  const { userId, user } = await getCurrentUser({ allData: true });

  if (userId == null) return redirect("/");
  // User already exists in DB — send straight to app
  if (user != null) return redirect("/app");

  // User is authenticated with Clerk but not yet in our DB.
  // Create the record directly (don't rely on the webhook).
  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(userId);

  const email = clerkUser.emailAddresses.find(
    (e) => e.id === clerkUser.primaryEmailAddressId,
  )?.emailAddress;

  if (email != null) {
    const name =
      `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
      "Unknown";

    await upsertUser({
      id: clerkUser.id,
      email,
      name,
      imageUrl: clerkUser.imageUrl,
      createdAt: new Date(clerkUser.createdAt),
      updatedAt: new Date(clerkUser.updatedAt),
    });
  }

  return redirect("/app");
};

export default OnboardingPage;
