"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { SignOutButton, useClerk } from "@clerk/nextjs";
import {
  BookOpenIcon,
  BrainCircuitIcon,
  FileSlidersIcon,
  LogOutIcon,
  SpeechIcon,
  UserIcon,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/features/users/components/user-avatar";

const navLinks = [
  { name: "Interviews", href: "interviews", Icon: SpeechIcon },
  { name: "Questions", href: "questions", Icon: BookOpenIcon },
  { name: "Resume", href: "resume", Icon: FileSlidersIcon },
];

interface NavbarProps {
  user: {
    name: string;
    imageUrl: string;
  };
}

export const Navbar = ({ user }: NavbarProps) => {
  const { openUserProfile } = useClerk();
  const { jobInfoId } = useParams();
  const pathName = usePathname();

  return (
    <nav className="border-b h-header">
      <div className="container flex justify-between items-center h-full">
        <Link className="flex gap-2 items-center" href="/app">
          <BrainCircuitIcon className="size-8 text-primary" />
          <span className="text-xl font-bold">Prepforge</span>
        </Link>

        <div className="flex gap-4 items-center">
          {typeof jobInfoId === "string" &&
            navLinks.map(({ name, href, Icon }) => {
              const hrefPath = `/app/job-infos/${jobInfoId}/${href}`;

              return (
                <Button
                  key={name}
                  asChild
                  className="cursor-pointer max-sm:hidden"
                  variant={pathName === hrefPath ? "secondary" : "ghost"}
                >
                  <Link href={hrefPath}>
                    <Icon />
                    {name}
                  </Link>
                </Button>
              );
            })}

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger>
              <UserAvatar user={user} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => openUserProfile()}>
                <UserIcon className="mr-2" />
                Profile
              </DropdownMenuItem>
              <SignOutButton>
                <DropdownMenuItem>
                  <LogOutIcon className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </SignOutButton>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};
