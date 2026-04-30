"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  ActionResult,
  ActionType,
  Position,
} from "@/generated/prisma/enums";

type SlotNumber = 1 | 2 | 3 | 4 | 5 | 6;

export type StoredPlayer = {
  id: string;
  name: string;
  number: number;
  position: Position;
};

export type StoredAction = {
  clientId: string;
  set: number;
  player: StoredPlayer | null;
  type: ActionType;
  result: ActionResult;
  isOpponentPoint: boolean;
  createdAtMs: number;
};

export type ScoutMatchState = {
  matchId: string;
  lineup: Record<SlotNumber, StoredPlayer | null>;
  lineupConfirmed: boolean;
  actions: StoredAction[];
  currentSet: number;
  scoreHome: number;
  scoreAway: number;
  setsHome: number[];
  setsAway: number[];
  syncStatus: "idle" | "syncing" | "error";
  syncError: string | null;
};

const emptyLineup = (): Record<SlotNumber, StoredPlayer | null> => ({
  1: null,
  2: null,
  3: null,
  4: null,
  5: null,
  6: null,
});

const ROTATION_SOURCE: Record<SlotNumber, SlotNumber> = {
  1: 2,
  2: 3,
  3: 4,
  4: 5,
  5: 6,
  6: 1,
};

type SeedInput = {
  matchId: string;
  lineup: { slot: number; player: StoredPlayer }[];
  actions: StoredAction[];
  currentSet: number;
  scoreHome: number;
  scoreAway: number;
  setsHome: number[];
  setsAway: number[];
};

type ScoutStore = {
  matches: Record<string, ScoutMatchState>;

  // Hydration
  ensureMatch: (seed: SeedInput) => void;
  getMatch: (matchId: string) => ScoutMatchState | undefined;

  // Setup
  setSlot: (
    matchId: string,
    slot: SlotNumber,
    player: StoredPlayer | null,
  ) => void;
  confirmLineup: (matchId: string) => void;

  // Live ops
  addAction: (
    matchId: string,
    input: {
      player: StoredPlayer | null;
      type: ActionType;
      result: ActionResult;
      isOpponentPoint?: boolean;
    },
  ) => StoredAction;
  undoLastAction: (matchId: string) => StoredAction | null;
  opponentError: (matchId: string) => StoredAction;
  substitute: (
    matchId: string,
    slot: SlotNumber,
    inPlayer: StoredPlayer,
  ) => void;
  rotate: (matchId: string) => void;
  startNewSet: (matchId: string) => void;

  // Sync
  setSyncStatus: (
    matchId: string,
    status: ScoutMatchState["syncStatus"],
    error?: string | null,
  ) => void;
  clearMatch: (matchId: string) => void;
};

const useScoutStore = create<ScoutStore>()(
  persist(
    (set, get) => ({
      matches: {},

      ensureMatch: (seed) => {
        const existing = get().matches[seed.matchId];
        if (existing) return;
        const lineup = emptyLineup();
        for (const entry of seed.lineup) {
          lineup[entry.slot as SlotNumber] = entry.player;
        }
        const initial: ScoutMatchState = {
          matchId: seed.matchId,
          lineup,
          lineupConfirmed: seed.lineup.length > 0,
          actions: seed.actions,
          currentSet: seed.currentSet,
          scoreHome: seed.scoreHome,
          scoreAway: seed.scoreAway,
          setsHome: seed.setsHome,
          setsAway: seed.setsAway,
          syncStatus: "idle",
          syncError: null,
        };
        set((s) => ({ matches: { ...s.matches, [seed.matchId]: initial } }));
      },

      getMatch: (matchId) => get().matches[matchId],

      setSlot: (matchId, slot, player) => {
        set((s) => {
          const m = s.matches[matchId];
          if (!m) return s;
          return {
            matches: {
              ...s.matches,
              [matchId]: { ...m, lineup: { ...m.lineup, [slot]: player } },
            },
          };
        });
      },

      confirmLineup: (matchId) => {
        set((s) => {
          const m = s.matches[matchId];
          if (!m) return s;
          return {
            matches: {
              ...s.matches,
              [matchId]: { ...m, lineupConfirmed: true },
            },
          };
        });
      },

      addAction: (matchId, input) => {
        const action: StoredAction = {
          clientId:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          set: get().matches[matchId]?.currentSet ?? 1,
          player: input.player,
          type: input.type,
          result: input.result,
          isOpponentPoint: input.isOpponentPoint ?? false,
          createdAtMs: Date.now(),
        };
        set((s) => {
          const m = s.matches[matchId];
          if (!m) return s;
          let scoreHome = m.scoreHome;
          let scoreAway = m.scoreAway;
          if (action.result === "POINT" && !action.isOpponentPoint) scoreHome++;
          else if (action.result === "ERROR" && !action.isOpponentPoint)
            scoreAway++;
          return {
            matches: {
              ...s.matches,
              [matchId]: {
                ...m,
                actions: [...m.actions, action],
                scoreHome,
                scoreAway,
              },
            },
          };
        });
        return action;
      },

      undoLastAction: (matchId) => {
        const m = get().matches[matchId];
        if (!m || m.actions.length === 0) return null;
        const last = m.actions[m.actions.length - 1];
        let scoreHome = m.scoreHome;
        let scoreAway = m.scoreAway;
        if (last.result === "POINT" && !last.isOpponentPoint)
          scoreHome = Math.max(0, scoreHome - 1);
        else if (last.result === "ERROR" && !last.isOpponentPoint)
          scoreAway = Math.max(0, scoreAway - 1);
        else if (last.isOpponentPoint && last.result === "ERROR")
          // opponent error gave a point to home
          scoreHome = Math.max(0, scoreHome - 1);
        set((s) => ({
          matches: {
            ...s.matches,
            [matchId]: {
              ...m,
              actions: m.actions.slice(0, -1),
              scoreHome,
              scoreAway,
            },
          },
        }));
        return last;
      },

      opponentError: (matchId) => {
        const m = get().matches[matchId];
        const action: StoredAction = {
          clientId:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          set: m?.currentSet ?? 1,
          player: null,
          type: "ATTACK",
          result: "ERROR",
          isOpponentPoint: true,
          createdAtMs: Date.now(),
        };
        set((s) => {
          const cur = s.matches[matchId];
          if (!cur) return s;
          return {
            matches: {
              ...s.matches,
              [matchId]: {
                ...cur,
                actions: [...cur.actions, action],
                scoreHome: cur.scoreHome + 1,
              },
            },
          };
        });
        return action;
      },

      substitute: (matchId, slot, inPlayer) => {
        set((s) => {
          const m = s.matches[matchId];
          if (!m) return s;
          return {
            matches: {
              ...s.matches,
              [matchId]: {
                ...m,
                lineup: { ...m.lineup, [slot]: inPlayer },
              },
            },
          };
        });
      },

      rotate: (matchId) => {
        set((s) => {
          const m = s.matches[matchId];
          if (!m) return s;
          const next = { ...m.lineup };
          for (const slot of [1, 2, 3, 4, 5, 6] as SlotNumber[]) {
            next[slot] = m.lineup[ROTATION_SOURCE[slot]];
          }
          return {
            matches: {
              ...s.matches,
              [matchId]: { ...m, lineup: next },
            },
          };
        });
      },

      startNewSet: (matchId) => {
        set((s) => {
          const m = s.matches[matchId];
          if (!m) return s;
          if (m.currentSet >= 5) return s;
          return {
            matches: {
              ...s.matches,
              [matchId]: {
                ...m,
                setsHome: [...m.setsHome, m.scoreHome],
                setsAway: [...m.setsAway, m.scoreAway],
                currentSet: m.currentSet + 1,
                scoreHome: 0,
                scoreAway: 0,
              },
            },
          };
        });
      },

      setSyncStatus: (matchId, status, error = null) => {
        set((s) => {
          const m = s.matches[matchId];
          if (!m) return s;
          return {
            matches: {
              ...s.matches,
              [matchId]: { ...m, syncStatus: status, syncError: error },
            },
          };
        });
      },

      clearMatch: (matchId) => {
        set((s) => {
          const next = { ...s.matches };
          delete next[matchId];
          return { matches: next };
        });
      },
    }),
    {
      name: "rally-scout-offline",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export { useScoutStore };

// ── Sync payload helpers ────────────────────────────────────────
export type SyncPayload = {
  matchId: string;
  lineup: { slot: number; playerId: string }[];
  actions: {
    clientId: string;
    playerId: string | null;
    type: ActionType;
    result: ActionResult;
    set: number;
    isOpponentPoint: boolean;
    createdAtMs: number;
  }[];
  currentSet: number;
  scoreHome: number;
  scoreAway: number;
  setsHome: number[];
  setsAway: number[];
};

export function buildSyncPayload(state: ScoutMatchState): SyncPayload {
  const lineup: { slot: number; playerId: string }[] = [];
  for (const slot of [1, 2, 3, 4, 5, 6] as SlotNumber[]) {
    const p = state.lineup[slot];
    if (p) lineup.push({ slot, playerId: p.id });
  }
  return {
    matchId: state.matchId,
    lineup,
    actions: state.actions.map((a) => ({
      clientId: a.clientId,
      playerId: a.player?.id ?? null,
      type: a.type,
      result: a.result,
      set: a.set,
      isOpponentPoint: a.isOpponentPoint,
      createdAtMs: a.createdAtMs,
    })),
    currentSet: state.currentSet,
    scoreHome: state.scoreHome,
    scoreAway: state.scoreAway,
    setsHome: state.setsHome,
    setsAway: state.setsAway,
  };
}
