import { ClerkProvider as OriginalClerkProvider } from "@clerk/nextjs";

interface ClerkProviderProps {
  children: React.ReactNode;
}

export const ClerkProvider = ({ children }: ClerkProviderProps) => {
  return <OriginalClerkProvider>{children}</OriginalClerkProvider>;
};
