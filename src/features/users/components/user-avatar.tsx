import { ComponentProps } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  user: {
    name: string;
    imageUrl: string;
  };
}

export const UserAvatar = ({
  user,
  ...props
}: UserAvatarProps & ComponentProps<typeof Avatar>) => {
  return (
    <Avatar {...props}>
      <AvatarImage alt={user.name} src={user.imageUrl} />
      <AvatarFallback className="uppercase">
        {user.name
          .split(" ")
          .slice(0, 2)
          .map((n) => n[0])
          .join("")}
      </AvatarFallback>
    </Avatar>
  );
};
