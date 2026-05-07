import { ArrowRight, History } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getInitials } from "@/utils/get-initials";

type Match = {
  id: string;
  opponent: string;
  date: Date;
  setsHome: number[];
  setsAway: number[];
  team: { id: string; name: string; logoUrl: string | null };
};

type Props = {
  matches: Match[];
};

export function RecentMatches({ matches }: Props) {
  return (
    <Card className='gap-0 overflow-hidden py-0'>
      <div className='flex items-center justify-between border-b px-5 py-3'>
        <div className='flex items-center gap-2'>
          <span className='flex size-7 items-center justify-center rounded-md bg-orange-500/15 text-orange-500'>
            <History className='size-4' />
          </span>
          <h3 className='text-sm font-semibold'>Histórico recente</h3>
        </div>
        <Button asChild variant='ghost' size='sm' className='h-7 text-xs'>
          <Link href='/matches'>
            Ver tudo
            <ArrowRight className='ml-1 size-3' />
          </Link>
        </Button>
      </div>
      <CardContent className='p-0'>
        {matches.length === 0 ? (
          <div className='py-10 text-center'>
            <p className='text-sm text-muted-foreground'>
              Nenhuma partida finalizada
            </p>
          </div>
        ) : (
          <ul className='divide-y'>
            {matches.map((match) => {
              const homeWins = match.setsHome.filter(
                (s, i) => s > (match.setsAway[i] ?? 0),
              ).length;
              const awayWins = match.setsAway.filter(
                (s, i) => s > (match.setsHome[i] ?? 0),
              ).length;
              const won = homeWins > awayWins;

              return (
                <li key={match.id}>
                  <Link
                    href={`/matches/${match.id}`}
                    className='group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/40'
                  >
                    <Avatar size='sm'>
                      {match.team.logoUrl && (
                        <AvatarImage
                          src={match.team.logoUrl}
                          alt={match.team.name}
                        />
                      )}
                      <AvatarFallback className='text-[10px]'>
                        {getInitials(match.team.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium'>
                        {match.team.name}{" "}
                        <span className='text-muted-foreground'>vs</span>{" "}
                        {match.opponent}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {formatRelativeDate(match.date)}
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='font-mono text-sm font-bold tabular-nums'>
                        {homeWins}-{awayWins}
                      </span>
                      <Badge
                        variant='outline'
                        className={cn(
                          "h-5 px-1.5 text-[10px]",
                          won
                            ? "border-green-500/30 bg-green-500/10 text-green-500"
                            : "border-red-500/30 bg-red-500/10 text-red-500",
                        )}
                      >
                        {won ? "V" : "D"}
                      </Badge>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function formatRelativeDate(date: Date) {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}
