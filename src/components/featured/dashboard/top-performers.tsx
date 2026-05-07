import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { POSITION_SHORT_LABELS } from "@/lib/volleyball";
import type { Position } from "@/generated/prisma/enums";

type Performer = {
  id: string;
  name: string;
  number: number;
  position: Position;
  teamName: string;
  totalActions: number;
  points: number;
  efficiency: number;
};

type Props = {
  performers: Performer[];
};

const POSITION_COLORS: Record<Position, string> = {
  SETTER: "bg-purple-500/15 text-purple-400",
  OUTSIDE: "bg-blue-500/15 text-blue-400",
  OPPOSITE: "bg-orange-500/15 text-orange-400",
  MIDDLE: "bg-teal-500/15 text-teal-400",
  LIBERO: "bg-yellow-500/15 text-yellow-400",
};

export function TopPerformers({ performers }: Props) {
  return (
    <Card className='gap-0 overflow-hidden py-0'>
      <div className='flex items-center justify-between border-b px-5 py-3'>
        <div className='flex items-center gap-2'>
          <span className='flex size-7 items-center justify-center rounded-md bg-yellow-500/15 text-yellow-500'>
            <Sparkles className='size-4' />
          </span>
          <h3 className='text-sm font-semibold'>Top atletas</h3>
        </div>
        <Button asChild variant='ghost' size='sm' className='h-7 text-xs'>
          <Link href='/players'>
            Ver tudo
            <ArrowRight className='ml-1 size-3' />
          </Link>
        </Button>
      </div>
      <CardContent className='p-0'>
        {performers.length === 0 ? (
          <div className='py-10 text-center'>
            <p className='text-sm text-muted-foreground'>
              Sem dados suficientes ainda
            </p>
            <p className='text-xs text-muted-foreground/70'>
              Registre ações em partidas para ver o ranking
            </p>
          </div>
        ) : (
          <ul className='divide-y'>
            {performers.map((p, i) => {
              const effColor =
                p.efficiency >= 65
                  ? "text-green-400"
                  : p.efficiency >= 45
                    ? "text-yellow-400"
                    : "text-red-400";

              return (
                <li key={p.id}>
                  <Link
                    href={`/players/${p.id}`}
                    className='group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/40'
                  >
                    <span className='w-4 shrink-0 text-xs font-bold tabular-nums text-muted-foreground/50'>
                      {i + 1}
                    </span>
                    <div className='flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-black tabular-nums'>
                      {p.number}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-semibold leading-none'>
                        {p.name}
                      </p>
                      <p className='mt-1 truncate text-[11px] text-muted-foreground'>
                        {p.teamName}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold",
                        POSITION_COLORS[p.position],
                      )}
                    >
                      {POSITION_SHORT_LABELS[p.position]}
                    </span>
                    <div className='shrink-0 text-center'>
                      <p className='text-sm font-bold tabular-nums text-green-400'>
                        {p.points}
                      </p>
                      <p className='text-[9px] uppercase text-muted-foreground'>
                        Pts
                      </p>
                    </div>
                    <div className='min-w-[40px] shrink-0 text-center'>
                      <p
                        className={cn(
                          "text-sm font-bold tabular-nums",
                          effColor,
                        )}
                      >
                        {p.efficiency}%
                      </p>
                      <p className='text-[9px] uppercase text-muted-foreground'>
                        Efic
                      </p>
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
