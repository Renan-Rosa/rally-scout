import { z } from "zod";

// ══════════════════════════════════════════════════════════════
// SAVE LINEUP
// ══════════════════════════════════════════════════════════════
export const saveLineupSchema = z.object({
  matchId: z.string().cuid(),
  slots: z
    .array(
      z.object({
        slot: z.number().int().min(1).max(6),
        playerId: z.string().cuid(),
      }),
    )
    .min(1, "Adicione pelo menos um jogador à quadra"),
});

export type SaveLineupInput = z.infer<typeof saveLineupSchema>;

// ══════════════════════════════════════════════════════════════
// CREATE ACTION
// ══════════════════════════════════════════════════════════════
export const createActionSchema = z.object({
  matchId: z.string().cuid(),
  playerId: z.string().cuid().optional().nullable(),
  type: z.enum(["SERVE", "RECEIVE", "ATTACK", "BLOCK", "DIG", "SET"]),
  result: z.enum(["ERROR", "NEGATIVE", "NEUTRAL", "POSITIVE", "POINT"]),
  set: z.number().min(1).max(5),
  isOpponentPoint: z.boolean().default(false),
});

export type CreateActionInput = z.infer<typeof createActionSchema>;

// ══════════════════════════════════════════════════════════════
// SUBSTITUTE PLAYER
// ══════════════════════════════════════════════════════════════
export const substitutePlayerSchema = z.object({
  matchId: z.string().cuid(),
  slot: z.number().int().min(1).max(6),
  outPlayerId: z.string().cuid(),
  inPlayerId: z.string().cuid(),
});

export type SubstitutePlayerInput = z.infer<typeof substitutePlayerSchema>;

// ══════════════════════════════════════════════════════════════
// ROTATE LINEUP
// ══════════════════════════════════════════════════════════════
export const rotateLineupSchema = z.object({
  matchId: z.string().cuid(),
});

export type RotateLineupInput = z.infer<typeof rotateLineupSchema>;
