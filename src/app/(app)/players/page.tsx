import { Plus } from "lucide-react";
import Link from "next/link";
import { getPlayers } from "@/actions/players";
import { PlayersView } from "@/components/featured/players/players-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { POSITION_LABELS, POSITION_SHORT_LABELS } from "@/lib/volleyball";
import type { Position } from "@/generated/prisma/enums";

const POSITION_COLORS: Record<Position, string> = {
  SETTER: "bg-purple-500/15 text-purple-400",
  OUTSIDE: "bg-blue-500/15 text-blue-400",
  OPPOSITE: "bg-orange-500/15 text-orange-400",
  MIDDLE: "bg-teal-500/15 text-teal-400",
  LIBERO: "bg-yellow-500/15 text-yellow-400",
};

export default async function PlayersPage() {
  const result = await getPlayers();

  if (!result.success || !result.data) {
    return (
      <div className='p-4'>
        <p className='text-destructive'>Erro ao carregar atletas.</p>
      </div>
    );
  }

  const players = result.data;
  const total = players.length;
  const active = players.filter((p) => p.isActive).length;
  const inactive = total - active;

  const byPosition = (Object.keys(POSITION_LABELS) as Position[]).map((pos) => ({
    position: pos,
    count: players.filter((p) => p.position === pos && p.isActive).length,
  }));

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Atletas</h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Gerencie os atletas dos seus times.
          </p>
        </div>
        <Button asChild>
          <Link href='/players/new'>
            <Plus className='mr-2 size-4' />
            Adicionar atleta
          </Link>
        </Button>
      </div>

      {total > 0 && (
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-7'>
          <Card className='col-span-2 gap-0 py-0 sm:col-span-3 lg:col-span-2 xl:col-span-2'>
            <CardContent className='flex items-center justify-between p-4'>
              <div>
                <p className='text-xs text-muted-foreground'>Total</p>
                <p className='text-2xl font-bold tabular-nums'>{total}</p>
              </div>
              <div className='text-right'>
                <p className='text-[10px] uppercase tracking-wider text-muted-foreground'>
                  ativos / inativos
                </p>
                <p className='text-sm font-medium tabular-nums'>
                  <span className='text-green-500'>{active}</span>
                  <span className='mx-1 text-muted-foreground'>/</span>
                  <span className='text-muted-foreground'>{inactive}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {byPosition.map(({ position, count }) => (
            <Card key={position} className='gap-0 py-0'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <span
                    className={cn(
                      "inline-flex size-7 items-center justify-center rounded-md text-xs font-bold",
                      POSITION_COLORS[position],
                    )}
                  >
                    {POSITION_SHORT_LABELS[position]}
                  </span>
                  <span className='text-2xl font-bold tabular-nums'>
                    {count}
                  </span>
                </div>
                <p className='mt-2 text-xs text-muted-foreground'>
                  {POSITION_LABELS[position]}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PlayersView players={players} />
    </div>
  );
}
