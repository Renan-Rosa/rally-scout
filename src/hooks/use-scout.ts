"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { finishMatch as finishMatchAction } from "@/actions/matches";
import type { CreateActionInput } from "@/actions/schemas/scout";
import {
  createAction,
  finishSet as finishSetAction,
  opponentError as opponentErrorAction,
  undoLastAction,
} from "@/actions/scout";
import type {
  Action,
  Match,
  Player,
  Position,
} from "@/generated/prisma/client";

type MatchWithRelations = Match & {
  team: { players: Player[] };
  actions: (Action & {
    player: {
      id: string;
      name: string;
      number: number;
      position: Position;
    } | null;
  })[];
};

type PlayerStat = {
  points: number;
  errors: number;
  total: number;
};

export function useScout(initialMatch: MatchWithRelations) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Estado local (otimista)
  const [scoreHome, setScoreHome] = useState(initialMatch.scoreHome);
  const [scoreAway, setScoreAway] = useState(initialMatch.scoreAway);
  const [currentSet, setCurrentSet] = useState(initialMatch.currentSet);
  const [setsHome, setSetsHome] = useState(initialMatch.setsHome);
  const [setsAway, setSetsAway] = useState(initialMatch.setsAway);
  const [actions, setActions] = useState(initialMatch.actions);

  // Calcula stats por jogador
  const playerStats = useMemo(() => {
    const stats: Record<string, PlayerStat> = {};

    for (const player of initialMatch.team.players) {
      stats[player.id] = { points: 0, errors: 0, total: 0 };
    }

    for (const action of actions) {
      if (!action.playerId) continue;

      if (!stats[action.playerId]) {
        stats[action.playerId] = { points: 0, errors: 0, total: 0 };
      }

      stats[action.playerId].total++;

      if (action.result === "POINT") {
        stats[action.playerId].points++;
      } else if (action.result === "ERROR") {
        stats[action.playerId].errors++;
      }
    }

    return stats;
  }, [actions, initialMatch.team.players]);

  // Registrar ação
  const handleRegisterAction = async (input: CreateActionInput) => {
    // Atualização otimista
    const tempAction = {
      id: `temp-${Date.now()}`,
      ...input,
      createdAt: new Date(),
      player:
        initialMatch.team.players.find((p) => p.id === input.playerId) || null,
      rotation: null,
      startZone: null,
      endZone: null,
    };

    setActions((prev) => [tempAction as (typeof prev)[number], ...prev]);

    // Atualiza placar otimisticamente
    const isHomePoint =
      (input.result === "POINT" && !input.isOpponentPoint) ||
      (input.result === "ERROR" && input.isOpponentPoint);
    const isAwayPoint =
      (input.result === "ERROR" && !input.isOpponentPoint) ||
      (input.result === "POINT" && input.isOpponentPoint);

    if (isHomePoint) setScoreHome((prev) => prev + 1);
    if (isAwayPoint) setScoreAway((prev) => prev + 1);

    // Envia pro servidor
    startTransition(async () => {
      const result = await createAction(input);
      if (!result.success) {
        // Reverte se falhou
        setActions((prev) => prev.filter((a) => a.id !== tempAction.id));
        if (isHomePoint) setScoreHome((prev) => prev - 1);
        if (isAwayPoint) setScoreAway((prev) => prev - 1);
      }
    });
  };

  // Desfazer última ação
  const handleUndoLast = async () => {
    if (actions.length === 0) return;

    const lastAction = actions[0];

    // Otimista
    setActions((prev) => prev.slice(1));

    const wasHomePoint =
      (lastAction.result === "POINT" && !lastAction.isOpponentPoint) ||
      (lastAction.result === "ERROR" && lastAction.isOpponentPoint);
    const wasAwayPoint =
      (lastAction.result === "ERROR" && !lastAction.isOpponentPoint) ||
      (lastAction.result === "POINT" && lastAction.isOpponentPoint);

    if (wasHomePoint) setScoreHome((prev) => Math.max(0, prev - 1));
    if (wasAwayPoint) setScoreAway((prev) => Math.max(0, prev - 1));

    startTransition(async () => {
      const result = await undoLastAction(initialMatch.id);
      if (!result.success) {
        // Reverte
        setActions((prev) => [lastAction, ...prev]);
        if (wasHomePoint) setScoreHome((prev) => prev + 1);
        if (wasAwayPoint) setScoreAway((prev) => prev + 1);
      }
    });
  };

  // Erro do adversário (ponto pro meu time)
  const handleOpponentError = async () => {
    // Adiciona action otimista
    const tempAction = {
      id: `temp-${Date.now()}`,
      matchId: initialMatch.id,
      playerId: null,
      player: null,
      type: "ATTACK" as const,
      result: "ERROR" as const,
      set: currentSet,
      isOpponentPoint: true,
      rotation: null,
      startZone: null,
      endZone: null,
      createdAt: new Date(),
    };

    setActions((prev) => [tempAction as (typeof prev)[number], ...prev]);
    setScoreHome((prev) => prev + 1);

    startTransition(async () => {
      const result = await opponentErrorAction(initialMatch.id);
      if (!result.success) {
        setActions((prev) => prev.filter((a) => a.id !== tempAction.id));
        setScoreHome((prev) => Math.max(0, prev - 1));
      }
    });
  };

  // Finalizar set
  const handleFinishSet = async () => {
    const newSetsHome = [...setsHome, scoreHome];
    const newSetsAway = [...setsAway, scoreAway];

    setSetsHome(newSetsHome);
    setSetsAway(newSetsAway);
    setCurrentSet((prev) => prev + 1);
    setScoreHome(0);
    setScoreAway(0);

    startTransition(async () => {
      const result = await finishSetAction(initialMatch.id);
      if (!result.success) {
        // Reverte
        setSetsHome(setsHome);
        setSetsAway(setsAway);
        setCurrentSet(currentSet);
        setScoreHome(scoreHome);
        setScoreAway(scoreAway);
      }
    });
  };

  // Finalizar partida
  const handleFinishMatch = async () => {
    startTransition(async () => {
      const result = await finishMatchAction(initialMatch.id);
      if (result.success) {
        router.push(`/dashboard/matches/${initialMatch.id}`);
      }
    });
  };

  return {
    scoreHome,
    scoreAway,
    currentSet,
    setsHome,
    setsAway,
    actions,
    playerStats,
    registerAction: handleRegisterAction,
    undoLast: handleUndoLast,
    opponentError: handleOpponentError,
    finishSet: handleFinishSet,
    finishMatch: handleFinishMatch,
    isPending,
  };
}
