import type {
  ActionResult,
  ActionType,
  MatchStatus,
  Position,
  TeamType,
} from "@/generated/prisma/enums";

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

export const POSITION_SHORT_LABELS: Record<Position, string> = {
  SETTER: "L",
  OUTSIDE: "P",
  OPPOSITE: "O",
  MIDDLE: "C",
  LIBERO: "Li",
};

export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  SERVE: "Saque",
  RECEIVE: "Recepção",
  ATTACK: "Ataque",
  BLOCK: "Bloqueio",
  DIG: "Defesa",
  SET: "Levantamento",
};

export const ACTION_RESULT_LABELS: Record<ActionResult, string> = {
  ERROR: "Erro",
  NEGATIVE: "Negativo",
  NEUTRAL: "Neutro",
  POSITIVE: "Positivo",
  POINT: "Ponto",
};

export const VALID_RESULTS_BY_ACTION: Record<ActionType, ActionResult[]> = {
  SERVE: ["ERROR", "NEGATIVE", "NEUTRAL", "POSITIVE", "POINT"],
  RECEIVE: ["ERROR", "NEGATIVE", "NEUTRAL", "POSITIVE"],
  ATTACK: ["ERROR", "NEGATIVE", "POSITIVE", "POINT"],
  BLOCK: ["ERROR", "NEUTRAL", "POSITIVE", "POINT"],
  DIG: ["ERROR", "NEGATIVE", "NEUTRAL", "POSITIVE"],
  SET: ["ERROR", "NEGATIVE", "NEUTRAL", "POSITIVE"],
};
