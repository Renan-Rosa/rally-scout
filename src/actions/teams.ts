"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
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
