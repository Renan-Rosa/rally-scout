"use client";

import {
  HelpCircleIcon,
  LayoutDashboard,
  Menu as MenuIcon,
  SettingsIcon,
  Shield,
  User2,
  Volleyball,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Geral",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/teams", label: "Times", icon: Shield },
      { href: "/players", label: "Atletas", icon: User2 },
      { href: "/matches", label: "Partidas", icon: Volleyball },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/settings", label: "Configurações", icon: SettingsIcon },
      { href: "/help", label: "Ajuda", icon: HelpCircleIcon },
    ],
  },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='size-9 md:hidden'
          aria-label='Abrir menu'
        >
          <MenuIcon className='size-5' />
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='flex w-72 flex-col gap-0 p-0'>
        <SheetHeader className='flex-row items-center justify-between border-b px-5 py-4'>
          <SheetTitle className='text-base'>Menu</SheetTitle>
        </SheetHeader>
        <nav className='flex-1 overflow-y-auto px-3 py-4'>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className='mb-5 last:mb-0'>
              <p className='px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'>
                {group.label}
              </p>
              <ul className='space-y-0.5'>
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active =
                    pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted",
                        )}
                      >
                        <Icon className='size-4' />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
