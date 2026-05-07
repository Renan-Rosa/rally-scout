"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const LINKS = [
  { href: "#sobre", label: "Sobre" },
  { href: "#recursos", label: "Recursos" },
  { href: "#contato", label: "Contato" },
];

export function LandingMobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type='button'
          className='flex flex-col items-end gap-1 p-1 md:hidden'
          aria-label='Abrir menu'
        >
          <span className='block h-[2px] w-6 bg-white' />
          <span className='block h-[2px] w-6 bg-white' />
          <span className='block h-[2px] w-4 bg-white' />
        </button>
      </SheetTrigger>
      <SheetContent
        side='right'
        className='flex w-full flex-col gap-0 border-none bg-black p-0 text-white sm:w-80'
      >
        <SheetHeader className='flex-row items-center justify-between border-b border-white/10 px-6 py-4'>
          <SheetTitle className='text-sm font-black tracking-tighter text-white'>
            R<span className='text-[#ff751f]'>.</span>
          </SheetTitle>
          <button
            type='button'
            onClick={() => setOpen(false)}
            className='text-white/70 hover:text-white'
            aria-label='Fechar menu'
          >
            <X className='size-5' />
          </button>
        </SheetHeader>

        <nav className='flex-1 px-6 py-8'>
          <ul className='flex flex-col gap-6'>
            {LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className='block text-3xl font-black uppercase tracking-tight text-white hover:text-[#ff751f]'
                >
                  [{label}]
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className='border-t border-white/10 px-6 py-6'>
          <Link
            href='/sign-up'
            onClick={() => setOpen(false)}
            className='block bg-white px-5 py-3 text-center text-[11px] font-bold tracking-[0.2em] text-black hover:bg-white/90'
          >
            COMEÇAR PROJETO
          </Link>
          <Link
            href='/sign-in'
            onClick={() => setOpen(false)}
            className='mt-3 block border border-white/30 px-5 py-3 text-center text-[11px] font-bold tracking-[0.2em] text-white hover:bg-white hover:text-black'
          >
            JÁ TENHO CONTA
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

