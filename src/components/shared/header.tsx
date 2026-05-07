"use client";

import { Radio } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { HeaderProfile, type User } from "@/components/shared/profile";
import { Menu } from "./menu";
import { MobileNav } from "./mobile-nav";

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
    <header className='flex h-14 shrink-0 items-center gap-2 bg-background px-3 sm:gap-4 sm:px-6'>
      <MobileNav />
      <Link
        href='/dashboard'
        className='flex shrink-0 items-center gap-2 font-semibold text-foreground'
      >
        <Image
          src='/logo_dark.svg'
          alt='Rally'
          width={120}
          height={28}
          className='h-6 w-auto sm:h-7'
          priority
        />
      </Link>
      <div className='hidden md:block'>
        <Menu />
      </div>
      <div className='ml-auto flex items-center gap-2 sm:gap-3'>
        {liveMatch && (
          <Link
            href={`/scout/${liveMatch.id}`}
            className='flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-red-700 sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs'
          >
            <Radio className='size-3 animate-pulse sm:size-3.5' />
            <span className='hidden sm:inline'>LIVE — {liveMatch.opponent}</span>
            <span className='sm:hidden'>LIVE</span>
          </Link>
        )}
        <HeaderProfile user={user} />
      </div>
    </header>
  );
}
