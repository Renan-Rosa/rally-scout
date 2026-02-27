import { BarChart3, Calendar, Play } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Match = {
  id: string;
  opponent: string;
  date: Date;
  status: "SCHEDULED" | "LIVE" | "FINISHED" | "CANCELED";
  setsHome?: number[];
  setsAway?: number[];
  team: {
    name: string;
  };
};

type MatchCardsProps = {
  nextMatch: Match | null;
  lastMatch: Match | null;
};

export function MatchCards({ nextMatch, lastMatch }: MatchCardsProps) {
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      {/* Próxima Partida */}
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
            <Calendar className='size-4' />
            Próxima Partida
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nextMatch ? (
            <div className='space-y-3'>
              <div>
                <p className='text-lg font-semibold'>
                  {nextMatch.team.name} vs {nextMatch.opponent}
                </p>
                <p className='text-sm text-muted-foreground'>
                  {nextMatch.date.toLocaleDateString("pt-BR")}
                </p>
              </div>
              <Button asChild className='w-full'>
                <Link href={`/scout/${nextMatch.id}`}>
                  <Play className='mr-2 size-4' />
                  Iniciar Scout
                </Link>
              </Button>
            </div>
          ) : (
            <EmptyState
              message='Nenhuma partida agendada'
              action={{
                label: "Agendar Partida",
                href: "/matches/new",
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Última Partida */}
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
            <BarChart3 className='size-4' />
            Última Partida
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lastMatch ? (
            <LastMatchContent match={lastMatch} />
          ) : (
            <EmptyState
              message='Nenhuma partida finalizada'
              action={{ label: "Ver Partidas", href: "/matches" }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LastMatchContent({ match }: { match: Match }) {
  const setsHome = match.setsHome ?? [];
  const setsAway = match.setsAway ?? [];

  // Conta sets vencidos comparando placar de cada set individualmente
  const homeSetWins = setsHome.filter((s, i) => s > (setsAway[i] ?? 0)).length;
  const awaySetWins = setsAway.filter((s, i) => s > (setsHome[i] ?? 0)).length;
  const won = homeSetWins > awaySetWins;

  return (
    <div className='space-y-3'>
      <div>
        <p className='text-lg font-semibold'>vs {match.opponent}</p>
        <div className='flex items-center gap-2'>
          <span className='text-2xl font-bold tabular-nums'>
            {homeSetWins}x{awaySetWins}
          </span>
          <MatchResultBadge won={won} />
        </div>
        {setsHome.length > 0 && (
          <p className='text-xs text-muted-foreground mt-1'>
            {setsHome.map((h, i) => `${h}–${setsAway[i] ?? 0}`).join("  ")}
          </p>
        )}
      </div>
      <Button variant='outline' asChild className='w-full'>
        <Link href={`/scout/${match.id}`}>
          Ver Scout
        </Link>
      </Button>
    </div>
  );
}

function MatchResultBadge({ won }: { won: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        won ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
      }`}
    >
      {won ? "Vitória" : "Derrota"}
    </span>
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
    <div className='py-4 text-center'>
      <p className='text-sm text-muted-foreground'>{message}</p>
      <Button variant='link' asChild className='mt-1'>
        <Link href={action.href}>{action.label}</Link>
      </Button>
    </div>
  );
}
