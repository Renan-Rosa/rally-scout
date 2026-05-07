"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Position } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { POSITION_LABELS } from "@/lib/volleyball";
import { getInitials } from "@/utils/get-initials";
import { positionColors } from "./columns";

type Player = {
  id: string;
  name: string;
  number: number;
  position: Position;
  isActive: boolean;
  team: { id: string; name: string };
};

interface Props {
  players: Player[];
  onSelect: (player: Player) => void;
}

const POSITION_ACCENT: Record<Position, string> = {
  SETTER: "from-purple-500/20 to-purple-500/0",
  OUTSIDE: "from-blue-500/20 to-blue-500/0",
  OPPOSITE: "from-orange-500/20 to-orange-500/0",
  MIDDLE: "from-teal-500/20 to-teal-500/0",
  LIBERO: "from-yellow-500/20 to-yellow-500/0",
};

export function PlayersGrid({ players, onSelect }: Props) {
  if (players.length === 0) {
    return (
      <div className='rounded-lg border border-dashed py-16 text-center'>
        <p className='text-sm text-muted-foreground'>
          Nenhum atleta encontrado.
        </p>
      </div>
    );
  }

  return (
    <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {players.map((player) => (
        <Card
          key={player.id}
          onClick={() => onSelect(player)}
          className={cn(
            "relative cursor-pointer gap-0 overflow-hidden py-0 transition-all",
            "hover:border-foreground/30 hover:shadow-md",
            !player.isActive && "opacity-60",
          )}
        >
          <div
            className={cn(
              "absolute inset-x-0 top-0 h-20 bg-gradient-to-b",
              POSITION_ACCENT[player.position],
            )}
          />
          <div className='relative flex flex-col p-4'>
            <div className='flex items-start justify-between'>
              <Avatar className='size-12 border-2 border-background'>
                <AvatarFallback className='font-bold'>
                  {getInitials(player.name)}
                </AvatarFallback>
              </Avatar>
              <span className='text-2xl font-black tabular-nums text-foreground/80'>
                #{player.number}
              </span>
            </div>

            <div className='mt-3 min-w-0'>
              <p className='truncate text-sm font-semibold leading-tight'>
                {player.name}
              </p>
              <p className='mt-0.5 truncate text-xs text-muted-foreground'>
                {player.team.name}
              </p>
            </div>

            <div className='mt-3 flex items-center gap-1.5'>
              <Badge
                className={cn(
                  "h-5 px-1.5 text-[10px]",
                  positionColors[player.position],
                )}
              >
                {POSITION_LABELS[player.position]}
              </Badge>
              {!player.isActive && (
                <Badge variant='secondary' className='h-5 px-1.5 text-[10px]'>
                  Inativo
                </Badge>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
