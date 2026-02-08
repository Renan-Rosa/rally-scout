import { z } from "zod";

const teamTypeEnum = z.enum(["MANS", "WOMANS", "MIXED"], {
  message: "Categoria inválida",
});

// ══════════════════════════════════════════════════════════════
// CREATE
// ══════════════════════════════════════════════════════════════
export const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  type: teamTypeEnum,
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

// ══════════════════════════════════════════════════════════════
// UPDATE
// ══════════════════════════════════════════════════════════════
export const updateTeamSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  type: teamTypeEnum,
});

export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;

// ══════════════════════════════════════════════════════════════
// DELETE
// ══════════════════════════════════════════════════════════════
export const deleteTeamSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});

export type DeleteTeamInput = z.infer<typeof deleteTeamSchema>;
