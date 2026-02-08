import type { Position, TeamType } from "@/generated/prisma";

export const POSITION_LABELS: Record<Position, string> = {
  SETTER: "Levantador",
  OUTSIDE: "Ponteiro",
  OPPOSITE: "Oposto",
  MIDDLE: "Central",
  LIBERO: "Líbero",
};

export const TEAM_TYPE_LABELS: Record<TeamType, string> = {
  MANS: "Masculino",
  WOMANS: "Feminino",
  MIXED: "Misto",
};
