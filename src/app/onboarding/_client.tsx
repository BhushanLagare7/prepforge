"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Loader2Icon } from "lucide-react";

import { getUser } from "@/features/users/actions";

interface OnboardingClientProps {
  userId: string;
}

export const OnboardingClient = ({ userId }: OnboardingClientProps) => {
  const router = useRouter();

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const user = await getUser(userId);
      if (user == null) return;

      router.replace("/app");
      clearInterval(intervalId);
    }, 250);

    return () => {
      clearInterval(intervalId);
    };
  }, [userId, router]);

  return <Loader2Icon className="animate-spin size-24" />;
};
