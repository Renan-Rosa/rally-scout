"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
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
