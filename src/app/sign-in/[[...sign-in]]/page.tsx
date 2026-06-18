import type { Metadata } from "next";

import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center w-screen h-screen">
      <SignIn />
    </div>
  );
}
