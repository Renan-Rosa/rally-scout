import { z } from "zod";

const matchStatusEnum = z.enum(["SCHEDULED", "LIVE", "FINISHED", "CANCELED"], {
  message: "Status inválido",
});

// ══════════════════════════════════════════════════════════════
// CREATE
// ══════════════════════════════════════════════════════════════
export const createMatchSchema = z.object({
  opponent: z
    .string()
    .min(1, "Adversário é obrigatório")
    .min(2, "Adversário deve ter no mínimo 2 caracteres")
    .max(100, "Adversário deve ter no máximo 100 caracteres"),
  location: z
    .string()
    .max(200, "Local deve ter no máximo 200 caracteres")
    .optional()
    .or(z.literal("")),
  date: z.coerce.date({ message: "Data é obrigatória" }),
  teamId: z.string().min(1, "Time é obrigatório"),
});

export type CreateMatchInput = z.infer<typeof createMatchSchema>;

// ══════════════════════════════════════════════════════════════
// UPDATE
// ══════════════════════════════════════════════════════════════
export const updateMatchSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  opponent: z
    .string()
    .min(1, "Adversário é obrigatório")
    .min(2, "Adversário deve ter no mínimo 2 caracteres")
    .max(100, "Adversário deve ter no máximo 100 caracteres"),
  location: z
    .string()
    .max(200, "Local deve ter no máximo 200 caracteres")
    .optional()
    .or(z.literal("")),
  date: z.coerce.date({ message: "Data é obrigatória" }),
  status: matchStatusEnum,
});

export type UpdateMatchInput = z.infer<typeof updateMatchSchema>;

// ══════════════════════════════════════════════════════════════
// DELETE
// ══════════════════════════════════════════════════════════════
export const deleteMatchSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});

export type DeleteMatchInput = z.infer<typeof deleteMatchSchema>;
