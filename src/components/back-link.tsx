import Link from "next/link";

import { ArrowLeftIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "./ui/button";

interface BackLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const BackLink = ({ href, children, className }: BackLinkProps) => {
  return (
    <Button
      asChild
      className={cn("-ml-3", className)}
      size="sm"
      variant="ghost"
    >
      <Link
        className="flex gap-2 items-center text-sm text-muted-foreground"
        href={href}
      >
        <ArrowLeftIcon />
        {children}
      </Link>
    </Button>
  );
};
