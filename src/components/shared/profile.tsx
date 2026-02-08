"use client";

import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/utils/get-initials";

export type User = {
  id: string;
  name: string;
  email: string;
};

type HeaderProfileProps = {
  user: User;
};

export function HeaderProfile({ user }: HeaderProfileProps) {
  const { signOut, isPending } = useAuth();
  const initials = getInitials(user.name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='rounded-full'>
          <Avatar className='h-8 w-8'>
            <AvatarFallback className='rounded-full text-xs'>
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <div className='px-2 py-1.5 text-sm'>
          <p className='font-medium'>{user.name}</p>
          <p className='text-xs text-muted-foreground'>{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} disabled={isPending}>
          <LogOut className='mr-2 size-4' />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
