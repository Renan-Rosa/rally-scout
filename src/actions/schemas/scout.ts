import { z } from "zod";

export const createActionSchema = z.object({
  matchId: z.string().cuid(),
  playerId: z.string().cuid().optional().nullable(),
  type: z.enum(["SERVE", "RECEIVE", "ATTACK", "BLOCK", "DIG", "SET"]),
  result: z.enum(["ERROR", "NEGATIVE", "NEUTRAL", "POSITIVE", "POINT"]),
  set: z.number().min(1).max(5),
  isOpponentPoint: z.boolean().default(false),
});

export type CreateActionInput = z.infer<typeof createActionSchema>;
