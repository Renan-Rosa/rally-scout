"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  createActionSchema,
  rotateLineupSchema,
  saveLineupSchema,
  substitutePlayerSchema,
  type CreateActionInput,
  type RotateLineupInput,
  type SaveLineupInput,
  type SubstitutePlayerInput,
} from "./schemas/scout";

export type ActionResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ══════════════════════════════════════════════════════════════
// SAVE LINEUP
// ══════════════════════════════════════════════════════════════
export async function saveLineup(
  input: SaveLineupInput,
): Promise<ActionResponse> {
  try {
    const user = await requireAuth();

    const parsed = saveLineupSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const match = await prisma.match.findFirst({
      where: { id: parsed.data.matchId, team: { userId: user.id } },
    });

    if (!match) {
      return { success: false, error: "Partida não encontrada" };
    }

    await prisma.$transaction(
      parsed.data.slots.map(({ slot, playerId }) =>
        prisma.matchLineup.upsert({
          where: { matchId_slot: { matchId: parsed.data.matchId, slot } },
          create: { matchId: parsed.data.matchId, slot, playerId },
          update: { playerId },
        }),
      ),
    );

    revalidatePath(`/scout/${parsed.data.matchId}`);

    return { success: true };
  } catch (error) {
    console.error("[SAVE_LINEUP]", error);
    return { success: false, error: "Erro ao salvar escalação" };
  }
}

// ══════════════════════════════════════════════════════════════
// CREATE ACTION (atualiza placar automaticamente)
// ══════════════════════════════════════════════════════════════
export async function createAction(
  input: CreateActionInput,
): Promise<ActionResponse<{ actionId: string }>> {
  try {
    const user = await requireAuth();

    const parsed = createActionSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const match = await prisma.match.findFirst({
      where: { id: parsed.data.matchId, team: { userId: user.id } },
    });

    if (!match) {
      return { success: false, error: "Partida não encontrada" };
    }

    const actionId = await prisma.$transaction(async (tx) => {
      const action = await tx.action.create({
        data: {
          matchId: parsed.data.matchId,
          playerId: parsed.data.playerId ?? null,
          type: parsed.data.type,
          result: parsed.data.result,
          set: parsed.data.set,
          isOpponentPoint: parsed.data.isOpponentPoint,
        },
      });

      // POINT = ponto do meu time | ERROR = ponto do adversário
      if (parsed.data.result === "POINT" && !parsed.data.isOpponentPoint) {
        await tx.match.update({
          where: { id: parsed.data.matchId },
          data: { scoreHome: { increment: 1 } },
        });
      } else if (parsed.data.result === "ERROR" && !parsed.data.isOpponentPoint) {
        await tx.match.update({
          where: { id: parsed.data.matchId },
          data: { scoreAway: { increment: 1 } },
        });
      }

      return action.id;
    });

    revalidatePath(`/scout/${parsed.data.matchId}`);

    return { success: true, data: { actionId } };
  } catch (error) {
    console.error("[CREATE_ACTION]", error);
    return { success: false, error: "Erro ao registrar ação" };
  }
}

// ══════════════════════════════════════════════════════════════
// UNDO LAST ACTION (reverte ação + placar)
// ══════════════════════════════════════════════════════════════
export async function undoLastAction(
  matchId: string,
  actionId: string,
): Promise<ActionResponse<{ revertedResult: string }>> {
  try {
    const user = await requireAuth();

    const action = await prisma.action.findFirst({
      where: {
        id: actionId,
        matchId,
        match: { team: { userId: user.id } },
      },
      select: { id: true, result: true, isOpponentPoint: true },
    });

    if (!action) {
      return { success: false, error: "Ação não encontrada" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.action.delete({ where: { id: action.id } });

      if (action.result === "POINT" && !action.isOpponentPoint) {
        await tx.match.update({
          where: { id: matchId },
          data: { scoreHome: { decrement: 1 } },
        });
      } else if (action.result === "ERROR" && !action.isOpponentPoint) {
        await tx.match.update({
          where: { id: matchId },
          data: { scoreAway: { decrement: 1 } },
        });
      }
    });

    revalidatePath(`/scout/${matchId}`);

    return { success: true, data: { revertedResult: action.result } };
  } catch (error) {
    console.error("[UNDO_LAST_ACTION]", error);
    return { success: false, error: "Erro ao desfazer ação" };
  }
}

// ══════════════════════════════════════════════════════════════
// SUBSTITUTE PLAYER (troca jogador no slot sem apagar histórico)
// ══════════════════════════════════════════════════════════════
export async function substitutePlayer(
  input: SubstitutePlayerInput,
): Promise<ActionResponse> {
  try {
    const user = await requireAuth();

    const parsed = substitutePlayerSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const match = await prisma.match.findFirst({
      where: { id: parsed.data.matchId, team: { userId: user.id } },
    });

    if (!match) {
      return { success: false, error: "Partida não encontrada" };
    }

    await prisma.matchLineup.update({
      where: {
        matchId_slot: { matchId: parsed.data.matchId, slot: parsed.data.slot },
      },
      data: { playerId: parsed.data.inPlayerId },
    });

    revalidatePath(`/scout/${parsed.data.matchId}`);

    return { success: true };
  } catch (error) {
    console.error("[SUBSTITUTE_PLAYER]", error);
    return { success: false, error: "Erro ao realizar substituição" };
  }
}

// ══════════════════════════════════════════════════════════════
// ROTATE LINEUP (P2→P1, P3→P2, P4→P3, P5→P4, P6→P5, P1→P6)
// ══════════════════════════════════════════════════════════════
export async function rotateLineup(
  input: RotateLineupInput,
): Promise<ActionResponse> {
  try {
    const user = await requireAuth();

    const parsed = rotateLineupSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const match = await prisma.match.findFirst({
      where: { id: parsed.data.matchId, team: { userId: user.id } },
      include: {
        lineup: { select: { slot: true, playerId: true } },
      },
    });

    if (!match) {
      return { success: false, error: "Partida não encontrada" };
    }

    if (match.lineup.length === 0) {
      return { success: false, error: "Nenhum jogador em quadra" };
    }

    // Cada slot recebe o jogador do próximo slot no sentido horário
    // novo[P1] = antigo[P2], novo[P2] = antigo[P3], ..., novo[P6] = antigo[P1]
    const ROTATION_SOURCE: Record<number, number> = {
      1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 1,
    };
    const currentMap = new Map(match.lineup.map((e) => [e.slot, e.playerId]));
    const rotated = match.lineup.map((entry) => ({
      slot: entry.slot,
      playerId: currentMap.get(ROTATION_SOURCE[entry.slot]) ?? entry.playerId,
    }));

    await prisma.$transaction([
      prisma.matchLineup.deleteMany({ where: { matchId: parsed.data.matchId } }),
      prisma.matchLineup.createMany({
        data: rotated.map(({ slot, playerId }) => ({
          matchId: parsed.data.matchId,
          slot,
          playerId,
        })),
      }),
    ]);

    revalidatePath(`/scout/${parsed.data.matchId}`);

    return { success: true };
  } catch (error) {
    console.error("[ROTATE_LINEUP]", error);
    return { success: false, error: "Erro ao rodar escalação" };
  }
}

// ══════════════════════════════════════════════════════════════
// START NEW SET (salva placar do set atual e reseta)
// ══════════════════════════════════════════════════════════════
export async function startNewSet(
  matchId: string,
): Promise<ActionResponse<{ newSet: number; savedHome: number; savedAway: number }>> {
  try {
    const user = await requireAuth();

    const match = await prisma.match.findFirst({
      where: { id: matchId, team: { userId: user.id } },
      select: { id: true, currentSet: true, scoreHome: true, scoreAway: true, status: true },
    });

    if (!match) {
      return { success: false, error: "Partida não encontrada" };
    }

    if (match.currentSet >= 5) {
      return { success: false, error: "Número máximo de sets (5) atingido" };
    }

    const newSet = match.currentSet + 1;
    const savedHome = match.scoreHome;
    const savedAway = match.scoreAway;

    await prisma.match.update({
      where: { id: matchId },
      data: {
        currentSet: newSet,
        scoreHome: 0,
        scoreAway: 0,
        setsHome: { push: savedHome },
        setsAway: { push: savedAway },
      },
    });

    revalidatePath(`/scout/${matchId}`);

    return { success: true, data: { newSet, savedHome, savedAway } };
  } catch (error) {
    console.error("[START_NEW_SET]", error);
    return { success: false, error: "Erro ao iniciar novo set" };
  }
}

// ══════════════════════════════════════════════════════════════
// FINISH MATCH (salva set atual e marca como FINISHED)
// ══════════════════════════════════════════════════════════════
export async function finishMatch(
  matchId: string,
): Promise<ActionResponse> {
  try {
    const user = await requireAuth();

    const match = await prisma.match.findFirst({
      where: { id: matchId, team: { userId: user.id } },
      select: { id: true, scoreHome: true, scoreAway: true, status: true },
    });

    if (!match) {
      return { success: false, error: "Partida não encontrada" };
    }

    if (match.status === "FINISHED") {
      return { success: false, error: "Partida já foi finalizada" };
    }

    await prisma.match.update({
      where: { id: matchId },
      data: {
        status: "FINISHED",
        setsHome: { push: match.scoreHome },
        setsAway: { push: match.scoreAway },
      },
    });

    revalidatePath("/matches");
    revalidatePath(`/scout/${matchId}`);

    return { success: true };
  } catch (error) {
    console.error("[FINISH_MATCH]", error);
    return { success: false, error: "Erro ao finalizar partida" };
  }
}
