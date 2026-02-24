"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ActionResult, ActionType, Position } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { ACTION_TYPE_LABELS, POSITION_SHORT_LABELS } from "@/lib/volleyball";
import { POSITION_BADGE_COLOR } from "./player-slot";

// ── Types ──────────────────────────────────────────────────────────────────────

export type AnalyticsAction = {
  type: ActionType;
  result: ActionResult;
  set: number;
  isOpponentPoint: boolean;
  player: { name: string; number: number; position?: Position } | null;
};

type Props = {
  actions: AnalyticsAction[];
  setsHistory: { home: number; away: number }[];
  currentSet: number;
  teamName: string;
  opponent: string;
  lineupPlayers: { name: string; number: number; position: Position }[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const FUNDAMENTALS: ActionType[] = [
  "SERVE",
  "ATTACK",
  "BLOCK",
  "RECEIVE",
  "DIG",
  "SET",
];

type TypeStats = { total: number; good: number; bad: number };

function computeByType(
  myActions: AnalyticsAction[],
): Record<ActionType, TypeStats> {
  const empty = (): TypeStats => ({ total: 0, good: 0, bad: 0 });
  const map: Record<ActionType, TypeStats> = {
    SERVE: empty(),
    ATTACK: empty(),
    BLOCK: empty(),
    RECEIVE: empty(),
    DIG: empty(),
    SET: empty(),
  };
  for (const a of myActions) {
    const s = map[a.type];
    s.total++;
    if (a.result === "POINT" || a.result === "POSITIVE") s.good++;
    if (a.result === "ERROR" || a.result === "NEGATIVE") s.bad++;
  }
  return map;
}

function computeAttackEff(myActions: AnalyticsAction[]): number | null {
  const attacks = myActions.filter((a) => a.type === "ATTACK");
  if (attacks.length === 0) return null;
  const kills = attacks.filter((a) => a.result === "POINT").length;
  const errors = attacks.filter((a) => a.result === "ERROR").length;
  return (kills - errors) / attacks.length;
}

function computePointsBreakdown(myActions: AnalyticsAction[]) {
  const pts = myActions.filter((a) => a.result === "POINT");
  const totals: Partial<Record<ActionType, number>> = {};
  for (const a of pts) totals[a.type] = (totals[a.type] ?? 0) + 1;
  return (Object.entries(totals) as [ActionType, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ type, count, label: ACTION_TYPE_LABELS[type] }));
}

function computeProgression(myActions: AnalyticsAction[], set: number) {
  // actions are newest-first → reverse for chronological order
  const setActions = [...myActions].filter((a) => a.set === set).reverse();
  const pts: { rally: number; home: number; away: number }[] = [
    { rally: 0, home: 0, away: 0 },
  ];
  let home = 0,
    away = 0,
    rally = 0;
  for (const a of setActions) {
    if (a.result === "POINT" && !a.isOpponentPoint) {
      home++;
      rally++;
      pts.push({ rally, home, away });
    } else if (a.result === "ERROR" && !a.isOpponentPoint) {
      away++;
      rally++;
      pts.push({ rally, home, away });
    }
  }
  return pts;
}

function computePlayerSummaries(
  myActions: AnalyticsAction[],
  lineupPlayers: Props["lineupPlayers"],
) {
  // Parte do lineup — garante que todos os 6 apareçam, mesmo sem ações
  return lineupPlayers
    .map((p) => {
      const playerActions = myActions.filter((a) => a.player?.number === p.number);
      return {
        name: p.name,
        number: p.number,
        position: p.position as Position | undefined,
        total: playerActions.length,
        points: playerActions.filter((a) => a.result === "POINT").length,
        errors: playerActions.filter((a) => a.result === "ERROR").length,
      };
    })
    .sort((a, b) => b.total - a.total);
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function TugOfWarRow({ label, stats }: { label: string; stats: TypeStats }) {
  const { good, bad, total } = stats;
  if (total === 0) {
    return (
      <div className='flex items-center gap-3'>
        <span className='w-28 text-xs text-muted-foreground/50 truncate shrink-0'>
          {label}
        </span>
        <div className='flex-1 h-3 rounded-full bg-muted/30' />
        <span className='w-16 text-[10px] text-muted-foreground/40 text-center shrink-0'>
          sem dados
        </span>
      </div>
    );
  }
  const denom = good + bad || 1;
  const goodPct = (good / denom) * 100;
  const badPct = (bad / denom) * 100;
  return (
    <div className='flex items-center gap-3'>
      <span className='w-28 text-xs font-medium truncate shrink-0'>
        {label}
      </span>
      <div className='flex-1 flex h-3.5 rounded-full overflow-hidden bg-muted/40'>
        <div
          className='bg-red-500/70 transition-all duration-500'
          style={{ width: `${badPct}%` }}
        />
        <div
          className='bg-green-500/70 transition-all duration-500'
          style={{ width: `${goodPct}%` }}
        />
      </div>
      <div className='w-16 flex justify-between shrink-0'>
        <span className='text-[11px] font-mono text-red-400'>{bad}</span>
        <span className='text-[11px] text-muted-foreground/40'>·</span>
        <span className='text-[11px] font-mono text-green-400'>{good}</span>
      </div>
    </div>
  );
}

const scoreChartConfig: ChartConfig = {
  home: { label: "Meu Time", color: "#22c55e" },   // green-500
  away: { label: "Adversário", color: "#ef4444" },  // red-500
};

// ── Main Component ─────────────────────────────────────────────────────────────

export function AnalyticsSection({
  actions,
  setsHistory,
  currentSet,
  teamName,
  opponent,
  lineupPlayers,
}: Props) {
  const myActions = actions.filter((a) => !a.isOpponentPoint);
  const [progressionSet, setProgressionSet] = useState(currentSet);

  const byType = computeByType(myActions);
  const attackEff = computeAttackEff(myActions);
  const pointsBreakdown = computePointsBreakdown(myActions);
  const progression = computeProgression(actions, progressionSet);
  const playerSummaries = computePlayerSummaries(myActions, lineupPlayers);

  const totalPoints = myActions.filter((a) => a.result === "POINT").length;
  const totalErrors = myActions.filter((a) => a.result === "ERROR").length;
  const totalActions = myActions.length;

  const setsCount = Math.max(currentSet, setsHistory.length);

  return (
    <div className='space-y-4 pb-8'>
      {/* ── Header ── */}
      <div className='flex items-center gap-3'>
        <h2 className='text-base font-bold'>Análise da Partida</h2>
        <div className='flex-1 border-t border-dashed border-border/50' />
      </div>

      {/* ── Row 1: KPIs ── */}
      <div className='grid grid-cols-3 gap-3'>
        {/* Eficiência de Ataque */}
        <Card className='col-span-1'>
          <CardHeader className='pb-1 pt-4 px-4'>
            <CardTitle className='text-xs text-muted-foreground font-medium uppercase tracking-wider'>
              Efic. Ataque
            </CardTitle>
          </CardHeader>
          <CardContent className='px-4 pb-4'>
            {attackEff === null ? (
              <p className='text-2xl font-black text-muted-foreground/40'>—</p>
            ) : (
              <p
                className={cn(
                  "text-3xl font-black tabular-nums",
                  attackEff > 0.2
                    ? "text-green-400"
                    : attackEff > 0
                      ? "text-yellow-400"
                      : "text-red-400",
                )}
              >
                {(attackEff * 100).toFixed(0)}
                <span className='text-base font-bold'>%</span>
              </p>
            )}
            <p className='text-[10px] text-muted-foreground mt-0.5'>
              (K − E) / T
            </p>
          </CardContent>
        </Card>

        {/* Pontos */}
        <Card className='col-span-1'>
          <CardHeader className='pb-1 pt-4 px-4'>
            <CardTitle className='text-xs text-muted-foreground font-medium uppercase tracking-wider'>
              Pontos
            </CardTitle>
          </CardHeader>
          <CardContent className='px-4 pb-4'>
            <p className='text-3xl font-black tabular-nums text-green-400'>
              {totalPoints}
            </p>
            <p className='text-[10px] text-muted-foreground mt-0.5'>
              diretos (ace, kill, block)
            </p>
          </CardContent>
        </Card>

        {/* Erros */}
        <Card className='col-span-1'>
          <CardHeader className='pb-1 pt-4 px-4'>
            <CardTitle className='text-xs text-muted-foreground font-medium uppercase tracking-wider'>
              Erros
            </CardTitle>
          </CardHeader>
          <CardContent className='px-4 pb-4'>
            <p className='text-3xl font-black tabular-nums text-red-400'>
              {totalErrors}
            </p>
            <p className='text-[10px] text-muted-foreground mt-0.5'>
              {totalActions > 0
                ? `${((totalErrors / totalActions) * 100).toFixed(0)}% do total`
                : "sem dados"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: Balanço por Fundamento ── */}
      <Card>
        <CardHeader className='pb-3 pt-4 px-4'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-sm font-semibold'>
              Balanço por Fundamento
            </CardTitle>
            <div className='flex items-center gap-3 text-[10px] text-muted-foreground'>
              <span className='flex items-center gap-1'>
                <span className='size-2 rounded-full bg-red-500/70 inline-block' />
                Erro/Neg
              </span>
              <span className='flex items-center gap-1'>
                <span className='size-2 rounded-full bg-green-500/70 inline-block' />
                Pos/Ponto
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className='px-4 pb-4 space-y-3'>
          {FUNDAMENTALS.map((type) => (
            <TugOfWarRow
              key={type}
              label={ACTION_TYPE_LABELS[type]}
              stats={byType[type]}
            />
          ))}
        </CardContent>
      </Card>

      {/* ── Row 3: Score Progression ── */}
      <Card>
        <CardHeader className='pb-2 pt-4 px-4'>
          <div className='flex items-center justify-between flex-wrap gap-2'>
            <CardTitle className='text-sm font-semibold'>
              Progressão do Placar
            </CardTitle>
            <div className='flex gap-1'>
              {Array.from({ length: setsCount }, (_, i) => i + 1).map((s) => (
                <button
                  key={s}
                  type='button'
                  onClick={() => setProgressionSet(s)}
                  className={cn(
                    "text-[11px] font-semibold rounded px-2 py-0.5 transition-colors",
                    progressionSet === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  S{s}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className='px-2 pb-2'>
          {/* Legend */}
          <div className='flex items-center gap-4 px-2 mb-2'>
            <span className='flex items-center gap-1.5 text-[11px] text-muted-foreground'>
              <span className='inline-block w-5 h-0.5 bg-green-500 rounded-full' />
              {teamName}
            </span>
            <span className='flex items-center gap-1.5 text-[11px] text-muted-foreground'>
              <span className='inline-block w-5 border-t-2 border-dashed border-red-500' />
              {opponent}
            </span>
          </div>
          {progression.length <= 1 ? (
            <p className='text-xs text-muted-foreground/50 text-center py-6'>
              Nenhuma ação registrada neste set
            </p>
          ) : (
            <ChartContainer config={scoreChartConfig} className='h-44 w-full'>
              <LineChart
                data={progression}
                margin={{ top: 4, right: 16, left: -16, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='hsl(var(--border))'
                  strokeOpacity={0.4}
                />
                <XAxis
                  dataKey='rally'
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: "Rallies",
                    position: "insideBottom",
                    offset: -2,
                    fontSize: 10,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [
                        <span key={name} className='font-mono font-bold'>
                          {value}
                        </span>,
                        name === "home" ? teamName : opponent,
                      ]}
                    />
                  }
                />
                <Line
                  type='monotone'
                  dataKey='home'
                  stroke='var(--color-home)'
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
                <Line
                  type='monotone'
                  dataKey='away'
                  stroke='var(--color-away)'
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray='4 2'
                  activeDot={{ r: 3 }}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Row 4: Distribuição de Pontos ── */}
      {pointsBreakdown.length > 0 && (
        <Card>
          <CardHeader className='pb-3 pt-4 px-4'>
            <CardTitle className='text-sm font-semibold'>
              Distribuição de Pontos
            </CardTitle>
          </CardHeader>
          <CardContent className='px-4 pb-4 space-y-2'>
            {pointsBreakdown.map(({ type, count, label }) => {
              const pct = totalPoints > 0 ? (count / totalPoints) * 100 : 0;
              return (
                <div key={type} className='flex items-center gap-3'>
                  <span className='w-28 text-xs font-medium shrink-0'>
                    {label}
                  </span>
                  <div className='flex-1 h-3 rounded-full bg-muted/40 overflow-hidden'>
                    <div
                      className='h-full bg-primary/70 transition-all duration-500'
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className='w-12 text-right text-xs font-mono text-muted-foreground shrink-0'>
                    {count}{" "}
                    <span className='text-muted-foreground/50'>
                      ({pct.toFixed(0)}%)
                    </span>
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* ── Análise por Jogador ── */}
      <div className='flex items-center gap-3 pt-2'>
        <h2 className='text-base font-bold'>Análise por Jogador</h2>
        <div className='flex-1 border-t border-dashed border-border/50' />
      </div>

      {playerSummaries.length === 0 ? (
        <Card>
          <CardContent className='py-10 text-center text-sm text-muted-foreground/50'>
            Nenhuma ação registrada ainda
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-2 gap-3'>
          {playerSummaries.map((p) => {
            const eff = p.total > 0 ? ((p.points / p.total) * 100).toFixed(0) : "0";
            return (
              <Card key={p.number}>
                <CardContent className='p-3 flex items-center gap-3'>
                  {/* Avatar + badge de posição */}
                  <div className='relative shrink-0'>
                    <div className='size-11 rounded-full bg-muted flex items-center justify-center text-base font-black tabular-nums'>
                      {p.number}
                    </div>
                    {p.position && (
                      <span className={`absolute -bottom-1 -right-1 rounded-full px-1 text-white text-[9px] font-semibold leading-4 min-w-4 text-center ${POSITION_BADGE_COLOR[p.position]}`}>
                        {POSITION_SHORT_LABELS[p.position]}
                      </span>
                    )}
                  </div>

                  {/* Nome + total */}
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold truncate leading-none mb-0.5'>
                      {p.name}
                    </p>
                    <p className='text-[10px] text-muted-foreground'>
                      {p.total} ações
                    </p>
                  </div>

                  {/* Stats */}
                  <div className='flex items-center gap-3 shrink-0'>
                    <div className='text-center'>
                      <p className='text-lg font-black tabular-nums text-green-400 leading-none'>
                        {p.points}
                      </p>
                      <p className='text-[9px] text-muted-foreground uppercase tracking-wide mt-0.5'>
                        Pts
                      </p>
                    </div>
                    <div className='text-center'>
                      <p className='text-lg font-black tabular-nums text-red-400 leading-none'>
                        {p.errors}
                      </p>
                      <p className='text-[9px] text-muted-foreground uppercase tracking-wide mt-0.5'>
                        Err
                      </p>
                    </div>
                    <div className='text-center'>
                      <p className='text-lg font-black tabular-nums text-muted-foreground leading-none'>
                        {eff}%
                      </p>
                      <p className='text-[9px] text-muted-foreground uppercase tracking-wide mt-0.5'>
                        Efic
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
