import type { MatchStatus, Position, TeamType } from "@/generated/prisma/enums";

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

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  SCHEDULED: "Agendada",
  LIVE: "Ao Vivo",
  FINISHED: "Finalizada",
  CANCELED: "Cancelada",
};
