import { ComponentProps } from "react";
import Markdown from "react-markdown";

import { cn } from "@/lib/utils";

export const MarkdownRenderer = ({
  className,
  ...props
}: { className?: string } & ComponentProps<typeof Markdown>) => {
  return (
    <div
      className={cn(
        "max-w-none font-sans prose prose-neutral dark:prose-invert",
        className,
      )}
    >
      <Markdown {...props} />
    </div>
  );
};
