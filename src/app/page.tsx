import { Show, SignInButton, UserButton } from "@clerk/nextjs";

import { ThemeToggle } from "@/components/theme-toggle";

const HomePage = () => {
  return (
    <>
      <Show when="signed-out">
        <SignInButton />
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
      <ThemeToggle />
    </>
  );
};

export default HomePage;
