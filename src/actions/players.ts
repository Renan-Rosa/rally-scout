"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { ActionResult, ActionType } from "@/generated/prisma/enums";
import {
  type CreatePlayerInput,
  createPlayerSchema,
  type DeletePlayerInput,
  deletePlayerSchema,
  type UpdatePlayerInput,
  updatePlayerSchema,
} from "./schemas/players";

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════
export type ActionResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════
export type PlayerStatsByType = {
  type: ActionType;
  label: string;
  total: number;
  score: number; // 0-100 (weighted average)
  results: Partial<Record<ActionResult, number>>;
};

export type PlayerStats = {
  totalActions: number;
  totalMatches: number;
  byType: PlayerStatsByType[];
};

// ══════════════════════════════════════════════════════════════
// READ (Lista)
// ══════════════════════════════════════════════════════════════
export async function getPlayers() {
  try {
    const user = await requireAuth();

    const players = await prisma.player.findMany({
      where: { team: { userId: user.id } },
      include: {
        team: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ team: { name: "asc" } }, { number: "asc" }],
    });

    return { success: true, data: players };
  } catch (error) {
    console.error("[GET_PLAYERS]", error);
    return { success: false, error: "Erro ao buscar atletas" };
  }
}

// ══════════════════════════════════════════════════════════════
// CREATE
// ══════════════════════════════════════════════════════════════
export async function createPlayer(
  input: CreatePlayerInput,
): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await requireAuth();

    const parsed = createPlayerSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    // Verifica ownership do time
    const team = await prisma.team.findFirst({
      where: { id: parsed.data.teamId, userId: user.id },
    });

    if (!team) {
      return { success: false, error: "Time não encontrado" };
    }

    const player = await prisma.player.create({
      data: {
        name: parsed.data.name,
        number: parsed.data.number,
        position: parsed.data.position,
        teamId: parsed.data.teamId,
      },
    });

    revalidatePath("/players");

    return { success: true, data: { id: player.id } };
  } catch (error) {
    console.error("[CREATE_PLAYER]", error);
    return { success: false, error: "Erro ao criar atleta" };
  }
}

// ══════════════════════════════════════════════════════════════
// UPDATE
// ══════════════════════════════════════════════════════════════
export async function updatePlayer(
  input: UpdatePlayerInput,
): Promise<ActionResponse> {
  try {
    const user = await requireAuth();

    const parsed = updatePlayerSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    // Verifica ownership
    const existing = await prisma.player.findFirst({
      where: { id: parsed.data.id, team: { userId: user.id } },
    });

    if (!existing) {
      return { success: false, error: "Atleta não encontrado" };
    }

    await prisma.player.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        number: parsed.data.number,
        position: parsed.data.position,
        isActive: parsed.data.isActive,
      },
    });

    revalidatePath("/players");

    return { success: true };
  } catch (error) {
    console.error("[UPDATE_PLAYER]", error);
    return { success: false, error: "Erro ao atualizar atleta" };
  }
}

// ══════════════════════════════════════════════════════════════
// READ (Único)
// ══════════════════════════════════════════════════════════════
export async function getPlayer(id: string) {
  try {
    const user = await requireAuth();

    const player = await prisma.player.findFirst({
      where: { id, team: { userId: user.id } },
      include: {
        team: { select: { id: true, name: true } },
      },
    });

    if (!player) return { success: false, error: "Atleta não encontrado" };

    return { success: true, data: player };
  } catch (error) {
    console.error("[GET_PLAYER]", error);
    return { success: false, error: "Erro ao buscar atleta" };
  }
}

// ══════════════════════════════════════════════════════════════
// READ (Stats)
// ══════════════════════════════════════════════════════════════
const RESULT_WEIGHTS: Record<ActionResult, number> = {
  ERROR: 0,
  NEGATIVE: 25,
  NEUTRAL: 50,
  POSITIVE: 75,
  POINT: 100,
};

const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  SERVE: "Saque",
  RECEIVE: "Recepção",
  ATTACK: "Ataque",
  BLOCK: "Bloqueio",
  DIG: "Defesa",
  SET: "Levantamento",
};

export async function getPlayerStats(
  playerId: string,
): Promise<ActionResponse<PlayerStats>> {
  try {
    const user = await requireAuth();

    const player = await prisma.player.findFirst({
      where: { id: playerId, team: { userId: user.id } },
    });

    if (!player) return { success: false, error: "Atleta não encontrado" };

    const [grouped, distinctMatches] = await Promise.all([
      prisma.action.groupBy({
        by: ["type", "result"],
        where: { playerId },
        _count: { id: true },
      }),
      prisma.action.findMany({
        where: { playerId },
        select: { matchId: true },
        distinct: ["matchId"],
      }),
    ]);

    const typeMap: Record<string, Record<string, number>> = {};
    for (const row of grouped) {
      if (!typeMap[row.type]) typeMap[row.type] = {};
      typeMap[row.type][row.result] = row._count.id;
    }

    const byType: PlayerStatsByType[] = Object.entries(typeMap).map(
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

    return {
      success: true,
      data: {
        totalActions,
        totalMatches: distinctMatches.length,
        byType,
      },
    };
  } catch (error) {
    console.error("[GET_PLAYER_STATS]", error);
    return { success: false, error: "Erro ao buscar estatísticas" };
  }
}

// ══════════════════════════════════════════════════════════════
// DELETE
// ══════════════════════════════════════════════════════════════
export async function deletePlayer(
  input: DeletePlayerInput,
): Promise<ActionResponse> {
  try {
    const user = await requireAuth();

    const parsed = deletePlayerSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    // Verifica ownership
    const existing = await prisma.player.findFirst({
      where: { id: parsed.data.id, team: { userId: user.id } },
    });

    if (!existing) {
      return { success: false, error: "Atleta não encontrado" };
    }

    await prisma.player.delete({
      where: { id: parsed.data.id },
    });

    revalidatePath("/players");

    return { success: true };
  } catch (error) {
    console.error("[DELETE_PLAYER]", error);
    return { success: false, error: "Erro ao deletar atleta" };
  }
}
