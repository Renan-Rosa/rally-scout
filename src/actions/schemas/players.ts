import { z } from "zod";

const positionEnum = z.enum(
  ["SETTER", "OUTSIDE", "OPPOSITE", "MIDDLE", "LIBERO"],
  { message: "Posição inválida" },
);

// ══════════════════════════════════════════════════════════════
// CREATE
// ══════════════════════════════════════════════════════════════
export const createPlayerSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  number: z
    .number({ message: "Número da camisa é obrigatório" })
    .int("Número deve ser inteiro")
    .min(1, "Número deve ser no mínimo 1")
    .max(99, "Número deve ser no máximo 99"),
  position: positionEnum,
  teamId: z.string().min(1, "Time é obrigatório"),
});

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;

// ══════════════════════════════════════════════════════════════
// UPDATE
// ══════════════════════════════════════════════════════════════
export const updatePlayerSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  number: z
    .number({ message: "Número da camisa é obrigatório" })
    .int("Número deve ser inteiro")
    .min(1, "Número deve ser no mínimo 1")
    .max(99, "Número deve ser no máximo 99"),
  position: positionEnum,
  isActive: z.boolean(),
});

export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;

// ══════════════════════════════════════════════════════════════
// DELETE
// ══════════════════════════════════════════════════════════════
export const deletePlayerSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});

export type DeletePlayerInput = z.infer<typeof deletePlayerSchema>;
