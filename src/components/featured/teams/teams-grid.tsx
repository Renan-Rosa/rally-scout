"use client";

import { Activity, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { TeamType } from "@/generated/prisma/enums";
import { TEAM_TYPE_LABELS } from "@/lib/volleyball";
import { cn } from "@/lib/utils";
import { getInitials } from "@/utils/get-initials";

type Team = {
  id: string;
  name: string;
  type: TeamType;
  logoUrl: string | null;
  _count: { players: number; matches: number };
};

interface Props {
  teams: Team[];
  onSelect: (team: Team) => void;
}

const TYPE_ACCENT: Record<TeamType, string> = {
  MANS: "from-blue-500/15 to-blue-500/0",
  WOMANS: "from-pink-500/15 to-pink-500/0",
  MIXED: "from-purple-500/15 to-purple-500/0",
};

export function TeamsGrid({ teams, onSelect }: Props) {
  if (teams.length === 0) {
    return (
      <div className='rounded-lg border border-dashed py-16 text-center'>
        <p className='text-sm text-muted-foreground'>Nenhum time encontrado.</p>
      </div>
    );
  }

  return (
    <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
      {teams.map((team) => (
        <Card
          key={team.id}
          onClick={() => onSelect(team)}
          className='relative cursor-pointer gap-0 overflow-hidden py-0 transition-all hover:border-foreground/30 hover:shadow-md'
        >
          <div
            className={cn(
              "absolute inset-x-0 top-0 h-24 bg-gradient-to-b",
              TYPE_ACCENT[team.type],
            )}
          />
          <CardContent className='relative p-5'>
            <div className='flex items-start justify-between gap-3'>
              <Avatar className='size-14 border-2 border-background'>
                {team.logoUrl && (
                  <AvatarImage src={team.logoUrl} alt={team.name} />
                )}
                <AvatarFallback className='font-bold'>
                  {getInitials(team.name)}
                </AvatarFallback>
              </Avatar>
              <Badge variant='outline' className='shrink-0'>
                {TEAM_TYPE_LABELS[team.type]}
              </Badge>
            </div>

            <h3 className='mt-3 truncate text-base font-bold'>{team.name}</h3>

            <div className='mt-4 grid grid-cols-2 gap-2'>
              <div className='flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2'>
                <Users className='size-3.5 text-muted-foreground' />
                <div className='min-w-0'>
                  <p className='text-xs text-muted-foreground'>Atletas</p>
                  <p className='text-sm font-bold tabular-nums'>
                    {team._count.players}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2'>
                <Activity className='size-3.5 text-muted-foreground' />
                <div className='min-w-0'>
                  <p className='text-xs text-muted-foreground'>Partidas</p>
                  <p className='text-sm font-bold tabular-nums'>
                    {team._count.matches}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
