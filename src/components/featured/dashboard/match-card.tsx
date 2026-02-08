import { BarChart3, Calendar, Play } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Match = {
  id: string;
  opponent: string;
  date: Date;
  status: "SCHEDULED" | "LIVE" | "FINISHED";
  scoreHome?: number;
  scoreAway?: number;
  setsHome?: number[];
  setsAway?: number[];
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
                <p className='text-lg font-semibold'>vs {nextMatch.opponent}</p>
                <p className='text-sm text-muted-foreground'>
                  {nextMatch.date.toLocaleDateString("pt-BR")}
                </p>
              </div>
              <Button asChild className='w-full'>
                <Link href={`/dashboard/matches/${nextMatch.id}/scout`}>
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
                href: "/dashboard/matches/new",
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
            <div className='space-y-3'>
              <div>
                <p className='text-lg font-semibold'>vs {lastMatch.opponent}</p>
                <div className='flex items-center gap-2'>
                  <span className='text-2xl font-bold'>
                    {lastMatch.setsHome?.length || 0}x
                    {lastMatch.setsAway?.length || 0}
                  </span>
                  <MatchResultBadge
                    won={
                      (lastMatch.setsHome?.length || 0) >
                      (lastMatch.setsAway?.length || 0)
                    }
                  />
                </div>
              </div>
              <Button variant='outline' asChild className='w-full'>
                <Link href={`/dashboard/matches/${lastMatch.id}`}>
                  Ver Estatísticas
                </Link>
              </Button>
            </div>
          ) : (
            <EmptyState
              message='Nenhuma partida finalizada'
              action={{ label: "Ver Partidas", href: "/dashboard/matches" }}
            />
          )}
        </CardContent>
      </Card>
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
