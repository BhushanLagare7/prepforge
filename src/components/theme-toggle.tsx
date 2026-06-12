"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const themes = [
  {
    name: "Light",
    Icon: SunIcon,
    value: "light",
  },
  {
    name: "Dark",
    Icon: MoonIcon,
    value: "dark",
  },
  {
    name: "System",
    Icon: MonitorIcon,
    value: "system",
  },
] as const;

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, theme, resolvedTheme } = useTheme();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          {resolvedTheme === "dark" ? <MoonIcon /> : <SunIcon />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map(({ name, Icon, value }) => (
          <DropdownMenuItem
            key={value}
            className={cn(
              "cursor-pointer",
              theme === value && "bg-accent text-accent-foreground",
            )}
            onClick={() => setTheme(value)}
          >
            <Icon className="size-4" />
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
