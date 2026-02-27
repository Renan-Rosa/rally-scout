"use server";

import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function getDashboardData() {
  const user = await requireAuth();

  // Stats básicos
  const [teamsCount, playersCount, finishedMatches] = await Promise.all([
    prisma.team.count({ where: { userId: user.id } }),
    prisma.player.count({
      where: { team: { userId: user.id }, isActive: true },
    }),
    prisma.match.findMany({
      where: {
        team: { userId: user.id },
        status: "FINISHED",
      },
      select: {
        setsHome: true,
        setsAway: true,
      },
    }),
  ]);

  // Calcula vitórias e derrotas
  let wins = 0;
  let losses = 0;

  for (const match of finishedMatches) {
    const homeWins = match.setsHome.filter(
      (score, i) => score > (match.setsAway[i] || 0),
    ).length;
    const awayWins = match.setsAway.filter(
      (score, i) => score > (match.setsHome[i] || 0),
    ).length;

    if (homeWins > awayWins) {
      wins++;
    } else if (awayWins > homeWins) {
      losses++;
    }
    // Empate não conta (raro no vôlei, mas...)
  }

  // Aproveitamento (%)
  const totalFinished = wins + losses;
  const winRate =
    totalFinished > 0 ? Math.round((wins / totalFinished) * 100) : 0;

  // Total de partidas (incluindo agendadas)
  const matchesCount = await prisma.match.count({
    where: { team: { userId: user.id } },
  });

  // Próxima partida
  const nextMatch = await prisma.match.findFirst({
    where: {
      team: { userId: user.id },
      status: "SCHEDULED",
      date: { gte: new Date() },
    },
    include: {
      team: true,
    },
    orderBy: { date: "asc" },
  });

  // Última partida
  const lastMatch = await prisma.match.findFirst({
    where: {
      team: { userId: user.id },
      status: "FINISHED",
    },
    include: {
      team: true,
    },
    orderBy: { date: "desc" },
  });

  // Top jogadores por eficiência (partidas finalizadas)
  const RESULT_WEIGHTS: Record<string, number> = {
    ERROR: 0, NEGATIVE: 25, NEUTRAL: 50, POSITIVE: 75, POINT: 100,
  };

  const playersWithActions = await prisma.player.findMany({
    where: { team: { userId: user.id }, isActive: true },
    select: {
      id: true,
      name: true,
      number: true,
      position: true,
      team: { select: { name: true } },
      actions: {
        where: { match: { status: "FINISHED", team: { userId: user.id } } },
        select: { result: true },
      },
    },
  });

  const topPerformers = playersWithActions
    .filter((p) => p.actions.length >= 3)
    .map((p) => {
      const total = p.actions.length;
      const weightedSum = p.actions.reduce(
        (sum, a) => sum + (RESULT_WEIGHTS[a.result] ?? 50),
        0,
      );
      const efficiency = Math.round(weightedSum / total);
      const points = p.actions.filter((a) => a.result === "POINT").length;
      return {
        id: p.id,
        name: p.name,
        number: p.number,
        position: p.position,
        teamName: p.team.name,
        totalActions: total,
        points,
        efficiency,
      };
    })
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 5);

  return {
    stats: {
      teams: teamsCount,
      players: playersCount,
      matches: matchesCount,
      wins,
      losses,
      winRate,
    },
    nextMatch,
    lastMatch,
    topPerformers,
  };
}
