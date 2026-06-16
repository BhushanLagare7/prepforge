import { BrainCircuitIcon } from "lucide-react";

import { UserAvatar } from "@/features/users/components/user-avatar";
import { cn } from "@/lib/utils";

interface CondensedMessagesProps {
  messages: { isUser: boolean; content: string[] }[];
  user: { name: string; imageUrl: string };
  className?: string;
  maxFft?: number;
}

export const CondensedMessages = ({
  messages,
  user,
  className,
  maxFft = 0,
}: CondensedMessagesProps) => {
  return (
    <div className={cn("flex flex-col gap-4 w-full", className)}>
      {messages.map((message, index) => {
        const shouldAnimate = index === messages.length - 1 && maxFft > 0;

        return (
          <div
            key={index}
            className={cn(
              "flex items-center gap-5 border pl-4 pr-6 py-4 rounded max-w-3/4",
              message.isUser ? "self-end" : "self-start",
            )}
          >
            {message.isUser ? (
              <UserAvatar className="shrink-0 size-6" user={user} />
            ) : (
              <div className="relative">
                <div
                  className={cn(
                    "absolute inset-0 rounded-full border-4 border-muted",
                    shouldAnimate ? "animate-ping" : "hidden",
                  )}
                />
                <BrainCircuitIcon
                  className="relative shrink-0 size-6"
                  style={shouldAnimate ? { scale: maxFft / 8 + 1 } : undefined}
                />
              </div>
            )}
            <div className="flex flex-col gap-1">
              {message.content.map((text, i) => (
                <span key={i}>{text}</span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
