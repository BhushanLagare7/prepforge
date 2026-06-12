import { SignInButton, UserButton } from "@clerk/nextjs";

const HomePage = () => {
  return (
    <>
      <SignInButton />
      <UserButton />
    </>
  );
};

export default HomePage;
