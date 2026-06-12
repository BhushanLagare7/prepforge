import { Show, SignInButton, UserButton } from "@clerk/nextjs";

const HomePage = () => {
  return (
    <>
      <Show when="signed-out">
        <SignInButton />
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </>
  );
};

export default HomePage;
