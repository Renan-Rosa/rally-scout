"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { ActionResult, ActionType } from "@/generated/prisma/enums";
import { ACTION_TYPE_LABELS } from "@/lib/volleyball";
import {
  type CreateTeamInput,
  createTeamSchema,
  type DeleteTeamInput,
  deleteTeamSchema,
  type UpdateTeamInput,
  updateTeamSchema,
} from "./schemas/teams";

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════
export type ActionResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type TeamStatsByType = {
  type: ActionType;
  label: string;
  total: number;
  score: number;
  results: Partial<Record<ActionResult, number>>;
};

export type TopPerformer = {
  id: string;
  name: string;
  number: number;
  position: string;
  totalActions: number;
  overallScore: number;
};

export type TeamStats = {
  totalMatches: number;
  wins: number;
  losses: number;
  totalActions: number;
  byType: TeamStatsByType[];
  topPerformers: TopPerformer[];
};

const RESULT_WEIGHTS: Record<ActionResult, number> = {
  ERROR: 0,
  NEGATIVE: 25,
  NEUTRAL: 50,
  POSITIVE: 75,
  POINT: 100,
};

// ══════════════════════════════════════════════════════════════
// READ (Lista)
// ══════════════════════════════════════════════════════════════
export async function getTeams() {
  try {
    const user = await requireAuth();

    const teams = await prisma.team.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        type: true,
        logoUrl: true,
        _count: {
          select: { players: true, matches: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return { success: true, data: teams };
  } catch (error) {
    console.error("[GET_TEAMS]", error);
    return { success: false, error: "Erro ao buscar times" };
  }
}

// ══════════════════════════════════════════════════════════════
// CREATE
// ══════════════════════════════════════════════════════════════
export async function createTeam(
  input: CreateTeamInput,
): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await requireAuth();

    const parsed = createTeamSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const team = await prisma.team.create({
      data: {
        name: parsed.data.name,
        type: parsed.data.type,
        logoUrl: parsed.data.logoUrl,
        userId: user.id,
      },
    });

    revalidatePath("/teams");

    return { success: true, data: { id: team.id } };
  } catch (error) {
    console.error("[CREATE_TEAM]", error);
    return { success: false, error: "Erro ao criar time" };
  }
}

// ══════════════════════════════════════════════════════════════
// UPDATE
// ══════════════════════════════════════════════════════════════
export async function updateTeam(
  input: UpdateTeamInput,
): Promise<ActionResponse> {
  try {
    const user = await requireAuth();

    const parsed = updateTeamSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const existing = await prisma.team.findFirst({
      where: { id: parsed.data.id, userId: user.id },
    });

    if (!existing) {
      return { success: false, error: "Time não encontrado" };
    }

    await prisma.team.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        type: parsed.data.type,
        logoUrl: parsed.data.logoUrl,
      },
    });

    revalidatePath("/teams");

    return { success: true };
  } catch (error) {
    console.error("[UPDATE_TEAM]", error);
    return { success: false, error: "Erro ao atualizar time" };
  }
}

// ══════════════════════════════════════════════════════════════
// DELETE
// ══════════════════════════════════════════════════════════════
export async function deleteTeam(
  input: DeleteTeamInput,
): Promise<ActionResponse> {
  try {
    const user = await requireAuth();

    const parsed = deleteTeamSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const existing = await prisma.team.findFirst({
      where: { id: parsed.data.id, userId: user.id },
    });

    if (!existing) {
      return { success: false, error: "Time não encontrado" };
    }

    await prisma.team.delete({
      where: { id: parsed.data.id },
    });

    revalidatePath("/teams");

    return { success: true };
  } catch (error) {
    console.error("[DELETE_TEAM]", error);
    return { success: false, error: "Erro ao deletar time" };
  }
}

// ══════════════════════════════════════════════════════════════
// READ (Único)
// ══════════════════════════════════════════════════════════════
export async function getTeam(id: string) {
  try {
    const user = await requireAuth();

    const team = await prisma.team.findFirst({
      where: { id, userId: user.id },
      include: {
        players: {
          orderBy: [{ isActive: "desc" }, { number: "asc" }],
        },
        _count: {
          select: { matches: true },
        },
      },
    });

    if (!team) return { success: false, error: "Time não encontrado" };

    return { success: true, data: team };
  } catch (error) {
    console.error("[GET_TEAM]", error);
    return { success: false, error: "Erro ao buscar time" };
  }
}

// ══════════════════════════════════════════════════════════════
// READ (Stats)
// ══════════════════════════════════════════════════════════════
export async function getTeamStats(
  teamId: string,
): Promise<ActionResponse<TeamStats>> {
  try {
    const user = await requireAuth();

    const team = await prisma.team.findFirst({
      where: { id: teamId, userId: user.id },
    });

    if (!team) return { success: false, error: "Time não encontrado" };

    const [finishedMatches, groupedByType, groupedByPlayer] = await Promise.all(
      [
        prisma.match.findMany({
          where: { teamId, status: "FINISHED" },
          select: { setsHome: true, setsAway: true },
        }),
        prisma.action.groupBy({
          by: ["type", "result"],
          where: { match: { teamId }, playerId: { not: null } },
          _count: { id: true },
        }),
        prisma.action.groupBy({
          by: ["playerId", "result"],
          where: { match: { teamId }, playerId: { not: null } },
          _count: { id: true },
        }),
      ],
    );

    // Win/loss record
    let wins = 0;
    let losses = 0;
    for (const match of finishedMatches) {
      const setsWonHome = match.setsHome.filter(
        (h, i) => h > (match.setsAway[i] ?? 0),
      ).length;
      const setsWonAway = match.setsAway.filter(
        (a, i) => a > (match.setsHome[i] ?? 0),
      ).length;
      if (setsWonHome > setsWonAway) wins++;
      else losses++;
    }

    // Action stats by type
    const typeMap: Record<string, Record<string, number>> = {};
    for (const row of groupedByType) {
      if (!typeMap[row.type]) typeMap[row.type] = {};
      typeMap[row.type][row.result] = row._count.id;
    }

    const byType: TeamStatsByType[] = Object.entries(typeMap).map(
      ([type, results]) => {
        const total = Object.values(results).reduce((a, b) => a + b, 0);
        let weightedSum = 0;
        for (const [result, count] of Object.entries(results)) {
          weightedSum += (RESULT_WEIGHTS[result as ActionResult] ?? 50) * count;
        }
        const score = total > 0 ? Math.round(weightedSum / total) : 0;
        return {
          type: type as ActionType,
          label: ACTION_TYPE_LABELS[type as ActionType] ?? type,
          total,
          score,
          results: results as Partial<Record<ActionResult, number>>,
        };
      },
    );

    const totalActions = byType.reduce((a, b) => a + b.total, 0);

    // Top performers
    const playerScores: Record<
      string,
      { total: number; weightedSum: number }
    > = {};
    for (const row of groupedByPlayer) {
      if (!row.playerId) continue;
      if (!playerScores[row.playerId])
        playerScores[row.playerId] = { total: 0, weightedSum: 0 };
      const count = row._count.id;
      playerScores[row.playerId].total += count;
      playerScores[row.playerId].weightedSum +=
        (RESULT_WEIGHTS[row.result] ?? 50) * count;
    }

    const playerIds = Object.keys(playerScores);
    const players =
      playerIds.length > 0
        ? await prisma.player.findMany({
            where: { id: { in: playerIds } },
            select: { id: true, name: true, number: true, position: true },
          })
        : [];

    const topPerformers: TopPerformer[] = players
      .map((p) => {
        const scores = playerScores[p.id];
        const overallScore =
          scores.total > 0
            ? Math.round(scores.weightedSum / scores.total)
            : 0;
        return { ...p, totalActions: scores.total, overallScore };
      })
      .filter((p) => p.totalActions >= 5)
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 5);

    return {
      success: true,
      data: { totalMatches: finishedMatches.length, wins, losses, totalActions, byType, topPerformers },
    };
  } catch (error) {
    console.error("[GET_TEAM_STATS]", error);
    return { success: false, error: "Erro ao buscar estatísticas do time" };
  }
}
