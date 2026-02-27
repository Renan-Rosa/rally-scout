import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  if (performers.length === 0) return null;

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>
          Top Atletas — Eficiência
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-2'>
        {performers.map((p, i) => {
          const effColor =
            p.efficiency >= 65
              ? "text-green-400"
              : p.efficiency >= 45
                ? "text-yellow-400"
                : "text-red-400";

          return (
            <Link
              key={p.id}
              href={`/players/${p.id}`}
              className='flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors group'
            >
              {/* Rank */}
              <span className='text-xs font-bold text-muted-foreground/50 w-4 shrink-0 tabular-nums'>
                {i + 1}
              </span>

              {/* Number badge */}
              <div className='size-8 rounded-full bg-muted flex items-center justify-center text-sm font-black tabular-nums shrink-0'>
                {p.number}
              </div>

              {/* Name + team */}
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold truncate leading-none group-hover:text-foreground transition-colors'>
                  {p.name}
                </p>
                <p className='text-[11px] text-muted-foreground truncate mt-0.5'>
                  {p.teamName}
                </p>
              </div>

              {/* Position */}
              <span
                className={cn(
                  "text-[10px] font-semibold rounded px-1.5 py-0.5 shrink-0",
                  POSITION_COLORS[p.position],
                )}
              >
                {POSITION_SHORT_LABELS[p.position]}
              </span>

              {/* Points */}
              <div className='text-center shrink-0'>
                <p className='text-sm font-bold tabular-nums text-green-400'>
                  {p.points}
                </p>
                <p className='text-[9px] text-muted-foreground uppercase'>Pts</p>
              </div>

              {/* Efficiency */}
              <div className='text-center shrink-0 min-w-[40px]'>
                <p className={cn("text-sm font-bold tabular-nums", effColor)}>
                  {p.efficiency}%
                </p>
                <p className='text-[9px] text-muted-foreground uppercase'>Efic</p>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
