"use client";

import { Radio } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { HeaderProfile, type User } from "@/components/shared/profile";
import { Menu } from "./menu";

type LiveMatch = {
  id: string;
  opponent: string;
};

type HeaderProps = {
  user: User;
  liveMatch?: LiveMatch | null;
};

export function Header({ user, liveMatch }: HeaderProps) {
  return (
    <header className='flex h-14 shrink-0 items-center justify-between gap-4 bg-background px-6'>
      <Link
        href='/dashboard'
        className='flex items-center gap-2 font-semibold text-foreground'
      >
        <Image src='/logo_dark.svg' alt='Rally' width={150} height={150} />
      </Link>
      <Menu />
      <div className='flex items-center gap-3'>
        {liveMatch && (
          <Link
            href={`/scout/${liveMatch.id}`}
            className='flex items-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700 transition-colors'
          >
            <Radio className='size-3.5 animate-pulse' />
            <span className='hidden sm:inline'>LIVE — {liveMatch.opponent}</span>
            <span className='sm:hidden'>LIVE</span>
          </Link>
        )}
        <span className='text-sm text-muted-foreground'>Plano</span>
        <HeaderProfile user={user} />
      </div>
    </header>
  );
}
