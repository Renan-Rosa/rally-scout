"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlayerEditDialog } from "@/components/featured/players/player-edit-dialog";
import type { Position } from "@/generated/prisma/enums";
import { POSITION_LABELS } from "@/lib/volleyball";
import { getInitials } from "@/utils/get-initials";

const positionColors: Record<Position, string> = {
  SETTER: "bg-purple-600 border-purple-700 text-white",
  OUTSIDE: "bg-blue-600 border-blue-700 text-white",
  OPPOSITE: "bg-orange-600 border-orange-700 text-white",
  MIDDLE: "bg-teal-600 border-teal-700 text-white",
  LIBERO: "bg-yellow-600 border-yellow-700 text-white",
};

type Player = {
  id: string;
  name: string;
  number: number;
  position: Position;
  isActive: boolean;
};

interface TeamPlayersListProps {
  players: Player[];
}

export function TeamPlayersList({ players }: TeamPlayersListProps) {
  if (players.length === 0) {
    return (
      <div className='rounded-md border p-8 text-center'>
        <p className='text-muted-foreground text-sm'>
          Nenhum atleta cadastrado neste time.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      {players.map((player) => (
        <div
          key={player.id}
          className='flex items-center justify-between rounded-md border p-3 gap-3'
        >
          <Link
            href={`/players/${player.id}`}
            className='flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity'
          >
            <Avatar size='sm'>
              <AvatarFallback className='text-xs font-bold'>
                {player.number}
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0'>
              <div className='flex items-center gap-2 flex-wrap'>
                <span className='font-medium truncate'>{player.name}</span>
                {!player.isActive && (
                  <Badge variant='secondary' className='text-xs'>
                    Inativo
                  </Badge>
                )}
              </div>
              <Badge className={`mt-0.5 text-xs ${positionColors[player.position]}`}>
                {POSITION_LABELS[player.position]}
              </Badge>
            </div>
          </Link>
          <PlayerEditDialog player={player} />
        </div>
      ))}
    </div>
  );
}
