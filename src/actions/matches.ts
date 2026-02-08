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
export async function getMatches() {
  try {
    const user = await requireAuth();

    const matches = await prisma.match.findMany({
      where: { team: { userId: user.id } },
      include: {
        team: {
          select: { id: true, name: true },
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

    revalidatePath("/matches");

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

    revalidatePath("/matches");

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

    revalidatePath("/matches");

    return { success: true };
  } catch (error) {
    console.error("[DELETE_MATCH]", error);
    return { success: false, error: "Erro ao deletar partida" };
  }
}
