"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { TEAM_LOGOS } from "@/lib/volleyball";

interface TeamLogoPickerProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  disabled?: boolean;
}

export function TeamLogoPicker({ value, onChange, disabled }: TeamLogoPickerProps) {
  return (
    <div className='flex flex-wrap gap-2'>
      {TEAM_LOGOS.map((logo) => (
        <button
          key={logo.url}
          type='button'
          disabled={disabled}
          onClick={() => onChange(value === logo.url ? undefined : logo.url)}
          className={cn(
            "rounded-md border-2 p-1 transition-colors",
            value === logo.url
              ? "border-primary"
              : "border-transparent hover:border-muted-foreground/30",
          )}
        >
          <Image
            src={logo.url}
            alt={logo.name}
            width={48}
            height={48}
            className='size-12 object-contain'
            unoptimized
          />
        </button>
      ))}
    </div>
  );
}
