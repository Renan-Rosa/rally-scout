import { ArrowRight, CalendarClock, Radio, Trophy } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Match = {
  id: string;
  opponent: string;
  date: Date;
  status: "SCHEDULED" | "LIVE" | "FINISHED" | "CANCELED";
  setsHome?: number[];
  setsAway?: number[];
  team: { id: string; name: string };
};

type MatchCardsProps = {
  lastMatch: Match | null;
  upcomingMatch: Match | null;
};

export function MatchCards({ lastMatch, upcomingMatch }: MatchCardsProps) {
  return (
    <div className='grid gap-4 lg:grid-cols-2'>
      <UpcomingMatchCard match={upcomingMatch} />
      <LastMatchCard match={lastMatch} />
    </div>
  );
}

function CardShell({
  title,
  icon,
  accent,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <Card className='gap-0 overflow-hidden py-0'>
      <div className='flex items-center justify-between border-b px-5 py-3'>
        <div className='flex items-center gap-2'>
          <span className={cn("flex size-7 items-center justify-center rounded-md", accent)}>
            {icon}
          </span>
          <h3 className='text-sm font-semibold'>{title}</h3>
        </div>
      </div>
      <CardContent className='p-5'>{children}</CardContent>
    </Card>
  );
}

function UpcomingMatchCard({ match }: { match: Match | null }) {
  const isLive = match?.status === "LIVE";
  return (
    <CardShell
      title={isLive ? "Partida ao vivo" : "Próxima partida"}
      accent={
        isLive
          ? "bg-red-500/15 text-red-500"
          : "bg-blue-500/15 text-blue-500"
      }
      icon={
        isLive ? <Radio className='size-4' /> : <CalendarClock className='size-4' />
      }
    >
      {match ? (
        <div className='space-y-4'>
          <div>
            <div className='flex items-center gap-2'>
              <p className='text-xs uppercase tracking-wider text-muted-foreground'>
                {match.team.name}
              </p>
              {isLive && (
                <Badge className='bg-red-500/10 text-red-500 border-red-500/30 animate-pulse'>
                  Ao vivo
                </Badge>
              )}
            </div>
            <p className='mt-1 text-xl font-bold'>vs {match.opponent}</p>
            <p className='mt-1 text-sm text-muted-foreground'>
              {formatDate(match.date)}
            </p>
          </div>
          <Button asChild size='sm' variant={isLive ? "default" : "outline"} className='w-full'>
            <Link href={isLive ? `/matches/${match.id}/scout` : `/matches/${match.id}`}>
              {isLive ? "Continuar scout" : "Ver detalhes"}
              <ArrowRight className='ml-2 size-3.5' />
            </Link>
          </Button>
        </div>
      ) : (
        <EmptyState
          message='Nenhuma partida agendada'
          action={{ label: "Agendar partida", href: "/matches/new" }}
        />
      )}
    </CardShell>
  );
}

function LastMatchCard({ match }: { match: Match | null }) {
  const setsHome = match?.setsHome ?? [];
  const setsAway = match?.setsAway ?? [];
  const homeSetWins = setsHome.filter((s, i) => s > (setsAway[i] ?? 0)).length;
  const awaySetWins = setsAway.filter((s, i) => s > (setsHome[i] ?? 0)).length;
  const won = homeSetWins > awaySetWins;

  return (
    <CardShell
      title='Última partida'
      accent={
        match
          ? won
            ? "bg-green-500/15 text-green-500"
            : "bg-red-500/15 text-red-500"
          : "bg-muted text-muted-foreground"
      }
      icon={<Trophy className='size-4' />}
    >
      {match ? (
        <div className='space-y-4'>
          <div className='flex items-start justify-between gap-3'>
            <div className='min-w-0 flex-1'>
              <p className='text-xs uppercase tracking-wider text-muted-foreground'>
                {match.team.name}
              </p>
              <p className='mt-1 truncate text-xl font-bold'>vs {match.opponent}</p>
              <p className='mt-1 text-sm text-muted-foreground'>
                {formatDate(match.date)}
              </p>
            </div>
            <Badge
              className={cn(
                "shrink-0",
                won
                  ? "border-green-500/30 bg-green-500/10 text-green-500"
                  : "border-red-500/30 bg-red-500/10 text-red-500",
              )}
            >
              {won ? "Vitória" : "Derrota"}
            </Badge>
          </div>

          <div className='flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3'>
            <div className='flex-1 text-center'>
              <p className='text-xs text-muted-foreground'>Sets</p>
              <p className='text-2xl font-bold tabular-nums'>
                <span className={won ? "text-green-500" : ""}>{homeSetWins}</span>
                <span className='mx-1 text-muted-foreground'>×</span>
                <span className={!won ? "text-red-500" : ""}>{awaySetWins}</span>
              </p>
            </div>
            {setsHome.length > 0 && (
              <>
                <div className='h-8 w-px bg-border' />
                <div className='flex flex-wrap gap-1'>
                  {setsHome.map((h, i) => {
                    const a = setsAway[i] ?? 0;
                    const setWon = h > a;
                    return (
                      <span
                        key={i}
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[11px] font-mono tabular-nums",
                          setWon
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500",
                        )}
                      >
                        {h}-{a}
                      </span>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <EmptyState
          message='Nenhuma partida finalizada'
          action={{ label: "Ver partidas", href: "/matches" }}
        />
      )}
    </CardShell>
  );
}

function EmptyState({
  message,
  action,
}: {
  message: string;
  action: { label: string; href: string };
}) {
  return (
    <div className='py-2 text-center'>
      <p className='text-sm text-muted-foreground'>{message}</p>
      <Button variant='link' asChild className='mt-1 h-auto p-0'>
        <Link href={action.href}>
          {action.label}
          <ArrowRight className='ml-1 size-3.5' />
        </Link>
      </Button>
    </div>
  );
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
