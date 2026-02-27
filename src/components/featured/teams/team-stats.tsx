"use client";

import {
  Activity,
  Medal,
  Trophy,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import type { TeamStats } from "@/actions/teams";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { ACTION_RESULT_LABELS, POSITION_LABELS } from "@/lib/volleyball";
import type { ActionResult, Position } from "@/generated/prisma/enums";
import { getInitials } from "@/utils/get-initials";

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

interface TeamStatsProps {
  stats: TeamStats;
}

export function TeamStatsView({ stats }: TeamStatsProps) {
  const { totalMatches, wins, losses, totalActions, byType, topPerformers } =
    stats;

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
        <Card>
          <CardContent className='pt-4'>
            <p className='text-muted-foreground text-xs'>Partidas</p>
            <p className='text-2xl font-bold'>{totalMatches}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-4'>
            <div className='flex items-center gap-1 text-xs text-emerald-600'>
              <TrendingUp className='size-3' />
              Vitórias
            </div>
            <p className='text-2xl font-bold'>{wins}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-4'>
            <div className='flex items-center gap-1 text-xs text-rose-600'>
              <TrendingDown className='size-3' />
              Derrotas
            </div>
            <p className='text-2xl font-bold'>{losses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-4'>
            <p className='text-muted-foreground text-xs'>Total de ações</p>
            <p className='text-2xl font-bold'>{totalActions}</p>
          </CardContent>
        </Card>
      </div>

      {/* Best/Worst fundamento */}
      {(best || worst) && (
        <div className='grid grid-cols-2 gap-3'>
          {best && (
            <Card>
              <CardContent className='pt-4'>
                <div className='flex items-center gap-1 text-xs text-emerald-600'>
                  <Trophy className='size-3' />
                  Melhor fundamento
                </div>
                <p className='text-lg font-bold'>{best.label}</p>
                <p className='text-muted-foreground text-xs'>
                  {best.score}% efic.
                </p>
              </CardContent>
            </Card>
          )}
          {worst && worst.label !== best?.label && (
            <Card>
              <CardContent className='pt-4'>
                <div className='flex items-center gap-1 text-xs text-rose-600'>
                  <TrendingDown className='size-3' />
                  Pior fundamento
                </div>
                <p className='text-lg font-bold'>{worst.label}</p>
                <p className='text-muted-foreground text-xs'>
                  {worst.score}% efic.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

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

      {/* Breakdown per fundamento */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por fundamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {byType.map((stat) => {
              const presentResults = RESULT_ORDER.filter(
                (r) => (stat.results[r] ?? 0) > 0,
              );
              return (
                <div key={stat.type}>
                  <div className='mb-1 flex items-center justify-between text-sm'>
                    <span className='font-medium'>{stat.label}</span>
                    <span className='text-muted-foreground'>
                      {stat.total} ações · {stat.score}% efic.
                    </span>
                  </div>
                  <div className='flex gap-1 flex-wrap'>
                    {presentResults.map((result) => {
                      const count = stat.results[result] ?? 0;
                      const pct = Math.round((count / stat.total) * 100);
                      return (
                        <div
                          key={result}
                          className='flex flex-col items-center rounded border px-2 py-1 text-center text-xs min-w-[52px]'
                        >
                          <span className='text-muted-foreground'>
                            {ACTION_RESULT_LABELS[result]}
                          </span>
                          <span className='font-semibold'>
                            {count}{" "}
                            <span className='text-muted-foreground font-normal'>
                              ({pct}%)
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top performers */}
      {topPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Medal className='size-5' />
              Top Performers
            </CardTitle>
            <CardDescription>
              Atletas com maior eficiência geral (mín. 5 ações)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {topPerformers.map((player, index) => (
                <div
                  key={player.id}
                  className='flex items-center gap-3'
                >
                  <span className='text-muted-foreground w-5 text-sm font-medium text-center'>
                    {index + 1}
                  </span>
                  <Avatar size='sm'>
                    <AvatarFallback className='text-xs font-bold'>
                      {getInitials(player.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium text-sm truncate'>{player.name}</p>
                    <p className='text-muted-foreground text-xs'>
                      {POSITION_LABELS[player.position as Position]} ·{" "}
                      {player.totalActions} ações
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-bold text-sm'>{player.overallScore}%</p>
                    <p className='text-muted-foreground text-xs'>efic.</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
