"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  type CreateMatchInput,
  createMatchSchema,
  type DeleteMatchInput,
  deleteMatchSchema,
  type UpdateMatchInput,
  updateMatchSchema,
} from "./schemas/matches";

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════
export type ActionResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ══════════════════════════════════════════════════════════════
// READ (Lista)
// ══════════════════════════════════════════════════════════════
export async function getMatches(teamId?: string) {
  try {
    const user = await requireAuth();

    const matches = await prisma.match.findMany({
      where: {
        team: { userId: user.id },
        ...(teamId && { teamId }),
      },
      include: {
        team: {
          select: { id: true, name: true },
        },
        _count: {
          select: { actions: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return { success: true, data: matches };
  } catch (error) {
    console.error("[GET_MATCHES]", error);
    return { success: false, error: "Erro ao buscar partidas" };
  }
}

// ══════════════════════════════════════════════════════════════
// READ (Único - com jogadores para o scout)
// ══════════════════════════════════════════════════════════════
export async function getMatch(id: string) {
  try {
    const user = await requireAuth();

    const match = await prisma.match.findFirst({
      where: {
        id,
        team: { userId: user.id },
      },
      include: {
        team: {
          include: {
            players: {
              where: { isActive: true },
              orderBy: { number: "asc" },
            },
          },
        },
        lineup: {
          include: {
            player: {
              select: { id: true, name: true, number: true, position: true },
            },
          },
          orderBy: { slot: "asc" },
        },
        actions: {
          orderBy: { createdAt: "desc" },
          include: {
            player: {
              select: { id: true, name: true, number: true, position: true },
            },
          },
        },
      },
    });

    if (!match) {
      return { success: false, error: "Partida não encontrada" };
    }

    return { success: true, data: match };
  } catch (error) {
    console.error("[GET_MATCH]", error);
    return { success: false, error: "Erro ao buscar partida" };
  }
}

// ══════════════════════════════════════════════════════════════
// CREATE
// ══════════════════════════════════════════════════════════════
export async function createMatch(
  input: CreateMatchInput,
): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await requireAuth();

    const parsed = createMatchSchema.safeParse(input);
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

    const match = await prisma.match.create({
      data: {
        opponent: parsed.data.opponent,
        location: parsed.data.location || null,
        date: parsed.data.date,
        teamId: parsed.data.teamId,
      },
    });

    revalidatePath("/dashboard/matches");
    revalidatePath("/dashboard");

    return { success: true, data: { id: match.id } };
  } catch (error) {
    console.error("[CREATE_MATCH]", error);
    return { success: false, error: "Erro ao criar partida" };
  }
}

// ══════════════════════════════════════════════════════════════
// UPDATE
// ══════════════════════════════════════════════════════════════
export async function updateMatch(
  input: UpdateMatchInput,
): Promise<ActionResponse> {
  try {
    const user = await requireAuth();

    const parsed = updateMatchSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    // Verifica ownership
    const existing = await prisma.match.findFirst({
      where: { id: parsed.data.id, team: { userId: user.id } },
    });

    if (!existing) {
      return { success: false, error: "Partida não encontrada" };
    }

    await prisma.match.update({
      where: { id: parsed.data.id },
      data: {
        opponent: parsed.data.opponent,
        location: parsed.data.location || null,
        date: parsed.data.date,
        status: parsed.data.status,
      },
    });

    revalidatePath("/dashboard/matches");
    revalidatePath(`/dashboard/matches/${parsed.data.id}`);

    return { success: true };
  } catch (error) {
    console.error("[UPDATE_MATCH]", error);
    return { success: false, error: "Erro ao atualizar partida" };
  }
}

// ══════════════════════════════════════════════════════════════
// DELETE
// ══════════════════════════════════════════════════════════════
export async function deleteMatch(
  input: DeleteMatchInput,
): Promise<ActionResponse> {
  try {
    const user = await requireAuth();

    const parsed = deleteMatchSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    // Verifica ownership
    const existing = await prisma.match.findFirst({
      where: { id: parsed.data.id, team: { userId: user.id } },
    });

    if (!existing) {
      return { success: false, error: "Partida não encontrada" };
    }

    await prisma.match.delete({
      where: { id: parsed.data.id },
    });

    revalidatePath("/dashboard/matches");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("[DELETE_MATCH]", error);
    return { success: false, error: "Erro ao deletar partida" };
  }
}

// ══════════════════════════════════════════════════════════════
// READ (Partida ao vivo)
// ══════════════════════════════════════════════════════════════
export async function getLiveMatch() {
  try {
    const user = await requireAuth();

    const match = await prisma.match.findFirst({
      where: {
        team: { userId: user.id },
        status: "LIVE",
      },
      select: { id: true, opponent: true },
    });

    return { success: true, data: match };
  } catch (error) {
    console.error("[GET_LIVE_MATCH]", error);
    return { success: false, error: "Erro ao buscar partida ao vivo" };
  }
}

// ══════════════════════════════════════════════════════════════
// INICIAR SCOUT (SCHEDULED → LIVE)
// ══════════════════════════════════════════════════════════════
export async function startMatch(id: string): Promise<ActionResponse> {
  try {
    const user = await requireAuth();

    // Valida se já existe uma partida LIVE
    const liveMatch = await prisma.match.findFirst({
      where: { team: { userId: user.id }, status: "LIVE" },
      select: { id: true },
    });

    if (liveMatch) {
      return { success: false, error: "Já existe uma partida em andamento" };
    }

    const match = await prisma.match.findFirst({
      where: { id, team: { userId: user.id } },
    });

    if (!match) {
      return { success: false, error: "Partida não encontrada" };
    }

    if (match.status !== "SCHEDULED") {
      return { success: false, error: "Partida já foi iniciada ou finalizada" };
    }

    await prisma.match.update({
      where: { id },
      data: { status: "LIVE" },
    });

    revalidatePath(`/dashboard/matches/${id}`);
    revalidatePath("/dashboard/matches");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("[START_MATCH]", error);
    return { success: false, error: "Erro ao iniciar partida" };
  }
}

// ══════════════════════════════════════════════════════════════
// FINALIZAR PARTIDA (LIVE → FINISHED)
// ══════════════════════════════════════════════════════════════
export async function finishMatch(id: string): Promise<ActionResponse> {
  try {
    const user = await requireAuth();

    const match = await prisma.match.findFirst({
      where: { id, team: { userId: user.id } },
    });

    if (!match) {
      return { success: false, error: "Partida não encontrada" };
    }

    if (match.status !== "LIVE") {
      return { success: false, error: "Partida não está em andamento" };
    }

    // Salva o set atual no histórico antes de finalizar
    const updatedSetsHome = [...match.setsHome, match.scoreHome];
    const updatedSetsAway = [...match.setsAway, match.scoreAway];

    await prisma.match.update({
      where: { id },
      data: {
        status: "FINISHED",
        setsHome: updatedSetsHome,
        setsAway: updatedSetsAway,
      },
    });

    revalidatePath(`/dashboard/matches/${id}`);
    revalidatePath("/dashboard/matches");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("[FINISH_MATCH]", error);
    return { success: false, error: "Erro ao finalizar partida" };
  }
}

// ══════════════════════════════════════════════════════════════
// CANCELAR PARTIDA
// ══════════════════════════════════════════════════════════════
export async function cancelMatch(id: string): Promise<ActionResponse> {
  try {
    const user = await requireAuth();

    const match = await prisma.match.findFirst({
      where: { id, team: { userId: user.id } },
    });

    if (!match) {
      return { success: false, error: "Partida não encontrada" };
    }

    if (match.status === "FINISHED") {
      return {
        success: false,
        error: "Partida já finalizada não pode ser cancelada",
      };
    }

    await prisma.match.update({
      where: { id },
      data: { status: "CANCELED" },
    });

    revalidatePath(`/dashboard/matches/${id}`);
    revalidatePath("/dashboard/matches");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("[CANCEL_MATCH]", error);
    return { success: false, error: "Erro ao cancelar partida" };
  }
}
