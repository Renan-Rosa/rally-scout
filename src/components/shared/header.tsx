"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { HeaderProfile, type User } from "@/components/shared/profile";
import { Menu } from "./menu";
import { ModeToggle } from "./mode-toggle";

type HeaderProps = {
  user: User;
};

export function Header({ user }: HeaderProps) {
  const { resolvedTheme } = useTheme();
  const logoSrc = resolvedTheme === "dark" ? "/logo_dark.svg" : "/logo.svg";

  return (
    <header className='flex h-14 shrink-0 items-center justify-between gap-4 bg-background px-6'>
      <Link
        href='/dashboard'
        className='flex items-center gap-2 font-semibold text-foreground'
      >
        <Image src={logoSrc} alt='Rally' width={150} height={150} />
      </Link>
      <Menu />
      <div className='flex items-center gap-4'>
        <span className='text-sm text-muted-foreground'>Plano</span>
        <ModeToggle />
        <HeaderProfile user={user} />
      </div>
    </header>
  );
}
