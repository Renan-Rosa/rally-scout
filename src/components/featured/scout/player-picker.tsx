"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Position } from "@/generated/prisma/enums";
import { POSITION_LABELS } from "@/lib/volleyball";
import { getInitials } from "@/utils/get-initials";

export type PickerPlayer = {
  id: string;
  name: string;
  number: number;
  position: Position;
};

type Props = {
  open: boolean;
  slotLabel: string;
  players: PickerPlayer[];
  onSelect: (player: PickerPlayer) => void;
  onClose: () => void;
};

export function PlayerPicker({
  open,
  slotLabel,
  players,
  onSelect,
  onClose,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side='bottom' className='max-h-[60vh] flex flex-col'>
        <SheetHeader>
          <SheetTitle>Selecionar jogador — {slotLabel}</SheetTitle>
        </SheetHeader>

        <div className='overflow-y-auto flex-1 px-4 pb-4'>
          {players.length === 0 ? (
            <p className='text-muted-foreground text-sm text-center py-8'>
              Todos os jogadores já estão na quadra
            </p>
          ) : (
            <ul className='space-y-1'>
              {players.map((player) => (
                <li key={player.id}>
                  <Button
                    onClick={() => onSelect(player)}
                    className='w-full flex items-center gap-3 rounded-lg p-3 hover:bg-muted transition-colors text-left'
                  >
                    <Avatar size='lg'>
                      <AvatarFallback className='font-bold text-base'>
                        {getInitials(player.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium text-sm'>{player.name}</p>
                      <p className='text-muted-foreground text-xs'>
                        #{player.number} · {POSITION_LABELS[player.position]}
                      </p>
                    </div>
                    <span className='text-muted-foreground text-sm font-bold tabular-nums'>
                      #{player.number}
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
