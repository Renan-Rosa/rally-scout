import { BarChart3 } from "lucide-react";
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
  lastMatch: Match | null;
};

export function MatchCards({ lastMatch }: MatchCardsProps) {
  return (
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
  );
}

function LastMatchContent({ match }: { match: Match }) {
  const setsHome = match.setsHome ?? [];
  const setsAway = match.setsAway ?? [];

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
