"use client";

import { PlusIcon, XIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Position } from "@/generated/prisma/enums";
import { POSITION_SHORT_LABELS } from "@/lib/volleyball";

export const POSITION_BADGE_COLOR: Record<Position, string> = {
  SETTER: "bg-purple-600",
  OUTSIDE: "bg-blue-500",
  OPPOSITE: "bg-orange-600",
  MIDDLE: "bg-teal-600",
  LIBERO: "bg-amber-500",
};

export type SlotPlayer = {
  id: string;
  name: string;
  number: number;
  position: Position;
};

type Props = {
  slotLabel: string;
  player: SlotPlayer | null;
  onClick: () => void;
  onRemove?: () => void;
};

export function PlayerSlot({ slotLabel, player, onClick, onRemove }: Props) {
  if (!player) {
    return (
      <button
        type='button'
        onClick={onClick}
        className='flex flex-col items-center justify-center w-full h-full rounded-full border-2 border-dashed border-white/40 text-white/50 hover:border-white/80 hover:text-white/80 transition-colors'
      >
        <PlusIcon className='size-5' />
        <span className='text-xs mt-0.5 font-medium'>{slotLabel}</span>
      </button>
    );
  }

  return (
    <div className='relative flex flex-col items-center justify-center gap-1 w-full h-full'>
      <button
        type='button'
        onClick={onClick}
        className='relative flex flex-col items-center gap-1'
      >
        <div className='relative'>
          <Avatar className='size-12 ring-2 ring-white/70 bg-white/10 text-white'>
            <AvatarFallback className='bg-white/15 text-white font-bold text-base'>
              {player.number}
            </AvatarFallback>
          </Avatar>
          <span
            className={`absolute -bottom-1 -right-1 rounded-full px-1 text-white text-[9px] font-semibold leading-4 min-w-4 text-center ${POSITION_BADGE_COLOR[player.position]}`}
          >
            {POSITION_SHORT_LABELS[player.position]}
          </span>
        </div>
        <p className='text-white text-[11px] font-medium truncate max-w-18 text-center leading-tight'>
          {player.name.split(" ")[0]}
        </p>
      </button>

      {onRemove && (
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className='absolute top-0 right-0 size-4 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center transition-colors'
          aria-label='Remover jogador'
        >
          <XIcon className='size-2.5 text-white' />
        </button>
      )}
    </div>
  );
}
