"use client";

import { Activity, TrendingDown, Trophy, Zap } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import type { PlayerStats } from "@/actions/players";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ActionResult } from "@/generated/prisma/enums";

const chartConfig = {
  score: {
    label: "Eficiência",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const RESULT_ORDER: ActionResult[] = [
  "ERROR",
  "NEGATIVE",
  "NEUTRAL",
  "POSITIVE",
  "POINT",
];

const RESULT_STYLE: Record<
  ActionResult,
  { bar: string; text: string; label: string }
> = {
  ERROR:    { bar: "bg-red-500",    text: "text-red-400",    label: "Erro" },
  NEGATIVE: { bar: "bg-orange-400", text: "text-orange-400", label: "Neg" },
  NEUTRAL:  { bar: "bg-zinc-500",   text: "text-zinc-400",   label: "Neu" },
  POSITIVE: { bar: "bg-sky-400",    text: "text-sky-400",    label: "Pos" },
  POINT:    { bar: "bg-green-500",  text: "text-green-400",  label: "Ponto" },
};

interface PlayerStatsChartProps {
  stats: PlayerStats;
}

export function PlayerStatsChart({ stats }: PlayerStatsChartProps) {
  const { totalActions, totalMatches, byType } = stats;

  const radarData = byType.map((s) => ({
    fundamento: s.label,
    score: s.score,
    total: s.total,
  }));

  const best = byType.length
    ? byType.reduce((a, b) => (b.score > a.score ? b : a))
    : null;

  const worst = byType.length
    ? byType.reduce((a, b) => (b.score < a.score ? b : a))
    : null;

  // Weighted overall efficiency (same formula as per-type)
  const overallEff =
    totalActions > 0
      ? Math.round(
          byType.reduce((sum, s) => sum + s.score * s.total, 0) / totalActions,
        )
      : 0;

  const effColor =
    overallEff >= 65
      ? "text-green-400"
      : overallEff >= 45
        ? "text-yellow-400"
        : "text-red-400";

  if (totalActions === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12 text-center'>
          <Activity className='text-muted-foreground mb-3 size-10' />
          <p className='text-muted-foreground text-sm'>
            Nenhuma ação registrada ainda.
          </p>
          <p className='text-muted-foreground text-xs mt-1'>
            As estatísticas aparecerão após o primeiro scout.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Summary cards */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        {/* Eficiência Geral — substituiu "Total de ações" */}
        <Card>
          <CardContent className='pt-4'>
            <div className='flex items-center gap-1 text-xs text-muted-foreground mb-1'>
              <Zap className='size-3' />
              Eficiência Geral
            </div>
            <p className={`text-2xl font-bold tabular-nums ${effColor}`}>
              {overallEff}
              <span className='text-base font-medium'>%</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-4'>
            <p className='text-muted-foreground text-xs mb-1'>Partidas</p>
            <p className='text-2xl font-bold'>{totalMatches}</p>
          </CardContent>
        </Card>

        {best && (
          <Card>
            <CardContent className='pt-4'>
              <div className='flex items-center gap-1 text-xs text-emerald-500 mb-1'>
                <Trophy className='size-3' />
                Melhor fundamento
              </div>
              <p className='text-lg font-bold leading-tight'>{best.label}</p>
              <p className='text-muted-foreground text-xs'>{best.score}% efic.</p>
            </CardContent>
          </Card>
        )}

        {worst && worst.label !== best?.label && (
          <Card>
            <CardContent className='pt-4'>
              <div className='flex items-center gap-1 text-xs text-rose-500 mb-1'>
                <TrendingDown className='size-3' />
                Pior fundamento
              </div>
              <p className='text-lg font-bold leading-tight'>{worst.label}</p>
              <p className='text-muted-foreground text-xs'>{worst.score}% efic.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Radar chart */}
      <Card>
        <CardHeader className='items-center'>
          <CardTitle>Eficiência por fundamento</CardTitle>
          <CardDescription>
            Média ponderada dos resultados (0 = só erros · 100 = só pontos)
          </CardDescription>
        </CardHeader>
        <CardContent className='pb-4'>
          <ChartContainer
            config={chartConfig}
            className='mx-auto aspect-square max-h-[300px]'
          >
            <RadarChart data={radarData}>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value, _name, item) => (
                      <span>
                        {value}%{" "}
                        <span className='text-muted-foreground'>
                          ({item.payload.total} ações)
                        </span>
                      </span>
                    )}
                  />
                }
              />
              <PolarAngleAxis dataKey='fundamento' tick={{ fontSize: 12 }} />
              <PolarGrid />
              <Radar
                dataKey='score'
                fill='var(--color-score)'
                fillOpacity={0.5}
                stroke='var(--color-score)'
                dot={{ r: 4, fillOpacity: 1 }}
              />
            </RadarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Detalhamento por fundamento — redesign */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle>Detalhamento por fundamento</CardTitle>
          {/* Legend */}
          <div className='flex flex-wrap gap-3 pt-1'>
            {RESULT_ORDER.map((r) => (
              <span
                key={r}
                className='flex items-center gap-1.5 text-[11px] text-muted-foreground'
              >
                <span className={`size-2 rounded-full inline-block ${RESULT_STYLE[r].bar}`} />
                {RESULT_STYLE[r].label}
              </span>
            ))}
          </div>
        </CardHeader>
        <CardContent className='space-y-5'>
          {byType.map((stat) => {
            const presentResults = RESULT_ORDER.filter(
              (r) => (stat.results[r] ?? 0) > 0,
            );
            return (
              <div key={stat.type}>
                {/* Header row */}
                <div className='flex items-center justify-between mb-2'>
                  <span className='font-medium text-sm'>{stat.label}</span>
                  <span className='text-xs text-muted-foreground tabular-nums'>
                    {stat.total} ações ·{" "}
                    <span
                      className={
                        stat.score >= 65
                          ? "text-green-400"
                          : stat.score >= 45
                            ? "text-yellow-400"
                            : "text-red-400"
                      }
                    >
                      {stat.score}%
                    </span>{" "}
                    efic.
                  </span>
                </div>

                {/* Stacked bar */}
                <div className='flex h-3 w-full overflow-hidden rounded-full bg-muted/30'>
                  {RESULT_ORDER.map((r) => {
                    const count = stat.results[r] ?? 0;
                    if (count === 0) return null;
                    const pct = (count / stat.total) * 100;
                    return (
                      <div
                        key={r}
                        className={`${RESULT_STYLE[r].bar} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                        title={`${RESULT_STYLE[r].label}: ${count}`}
                      />
                    );
                  })}
                </div>

                {/* Chips */}
                <div className='flex flex-wrap gap-x-4 gap-y-1 mt-2'>
                  {presentResults.map((r) => {
                    const count = stat.results[r] ?? 0;
                    const pct = Math.round((count / stat.total) * 100);
                    return (
                      <span
                        key={r}
                        className={`text-[11px] font-medium ${RESULT_STYLE[r].text}`}
                      >
                        {RESULT_STYLE[r].label}{" "}
                        <span className='font-bold'>{count}</span>
                        <span className='text-muted-foreground/60 font-normal'>
                          {" "}({pct}%)
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
