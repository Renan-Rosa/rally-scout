"use client";

import { ArrowRightLeft, Loader2, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createAction,
  finishMatch,
  rotateLineup,
  saveLineup,
  startNewSet,
  substitutePlayer,
  undoLastAction,
} from "@/actions/scout";
import { Button } from "@/components/ui/button";
import type { ActionResult, ActionType } from "@/generated/prisma/enums";
import { ActionRecorder, type RecorderPlayer } from "./action-recorder";
import { ActionTimeline, type TimelineAction } from "./action-timeline";
import { PlayerPicker } from "./player-picker";
import { PlayerSlot, type SlotPlayer } from "./player-slot";
import { Scoreboard, type SetHistory } from "./scoreboard";
import { type CourtEntry, SubstitutionDialog } from "./substitution-dialog";

type SlotNumber = 1 | 2 | 3 | 4 | 5 | 6;

export type LineupSlotData = {
  slot: number;
  player: SlotPlayer;
};

type Props = {
  matchId: string;
  teamName: string;
  opponent: string;
  players: SlotPlayer[];
  initialLineup: LineupSlotData[];
  initialCurrentSet: number;
  initialScoreHome: number;
  initialScoreAway: number;
  initialSetsHome: number[];
  initialSetsAway: number[];
  initialActions: TimelineAction[];
};

// col[0] = frente (perto da rede) | col[1] = fundo
const COURT_GRID: [SlotNumber, SlotNumber][] = [
  [2, 1],
  [3, 6],
  [4, 5],
];

function buildLineup(
  items: LineupSlotData[],
): Record<SlotNumber, SlotPlayer | null> {
  const map: Record<SlotNumber, SlotPlayer | null> = {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
  };
  for (const entry of items) {
    map[entry.slot as SlotNumber] = entry.player;
  }
  return map;
}

function buildSetsHistory(home: number[], away: number[]): SetHistory[] {
  return home.map((h, i) => ({ home: h, away: away[i] ?? 0 }));
}

export function VolleyballCourt({
  matchId,
  teamName,
  opponent,
  players,
  initialLineup,
  initialCurrentSet,
  initialScoreHome,
  initialScoreAway,
  initialSetsHome,
  initialSetsAway,
  initialActions,
}: Props) {
  // ── Lineup ──────────────────────────────────────────────────
  const [lineup, setLineup] = useState<Record<SlotNumber, SlotPlayer | null>>(
    () => buildLineup(initialLineup),
  );
  const [mode, setMode] = useState<"setup" | "live">(
    initialLineup.length > 0 ? "live" : "setup",
  );
  const [activePickerSlot, setActivePickerSlot] = useState<SlotNumber | null>(
    null,
  );
  const [activePlayerSlot, setActivePlayerSlot] = useState<SlotNumber | null>(
    null,
  );
  const [setupError, setSetupError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // ── Score ────────────────────────────────────────────────────
  const [scoreHome, setScoreHome] = useState(initialScoreHome);
  const [scoreAway, setScoreAway] = useState(initialScoreAway);
  const [currentSet, setCurrentSet] = useState(initialCurrentSet);
  const [setsHistory, setSetsHistory] = useState<SetHistory[]>(() =>
    buildSetsHistory(initialSetsHome, initialSetsAway),
  );
  const [lastActionId, setLastActionId] = useState<string | null>(null);

  // ── Timeline ─────────────────────────────────────────────────
  // Newest first (prepend on record, filter by set for display)
  const [localActions, setLocalActions] =
    useState<TimelineAction[]>(initialActions);
  const [viewingSet, setViewingSet] = useState(initialCurrentSet);

  // ── Finalizar partida ─────────────────────────────────────────
  const router = useRouter();

  const handleFinish = async () => {
    const res = await finishMatch(matchId);
    if (res.success) {
      router.push("/matches");
    }
  };

  // ── Substituição / Rotação ────────────────────────────────────
  const [substitutionOpen, setSubstitutionOpen] = useState(false);
  const [isRotating, startRotateTransition] = useTransition();

  // ── Setup helpers ────────────────────────────────────────────
  const assignedIds = new Set(
    Object.values(lineup)
      .filter(Boolean)
      .map((p) => (p as SlotPlayer).id),
  );
  const availablePlayers = players.filter((p) => !assignedIds.has(p.id));
  const filledSlots = Object.values(lineup).filter(Boolean).length;

  const handleSelectPlayer = (player: SlotPlayer) => {
    if (activePickerSlot === null) return;
    setLineup((prev) => ({ ...prev, [activePickerSlot]: player }));
    setActivePickerSlot(null);
  };

  const handleRemove = (slot: SlotNumber) => {
    setLineup((prev) => ({ ...prev, [slot]: null }));
  };

  const handleConfirmLineup = () => {
    setSetupError(null);
    const slots = (Object.entries(lineup) as [string, SlotPlayer | null][])
      .filter(([, p]) => p !== null)
      .map(([slot, p]) => ({
        slot: Number(slot),
        playerId: (p as SlotPlayer).id,
      }));

    startTransition(async () => {
      const result = await saveLineup({ matchId, slots });
      if (result.success) {
        setMode("live");
      } else {
        setSetupError(result.error ?? "Erro ao salvar escalação");
      }
    });
  };

  // ── Live handlers ─────────────────────────────────────────────
  const handleSaveAction = async (type: ActionType, result: ActionResult) => {
    const player = activePlayerSlot ? lineup[activePlayerSlot] : null;
    if (!player) return;

    const res = await createAction({
      matchId,
      playerId: player.id,
      type,
      result,
      set: currentSet,
      isOpponentPoint: false,
    });

    if (res.success && res.data) {
      setLastActionId(res.data.actionId);

      // Score otimístico
      if (result === "POINT") setScoreHome((s) => s + 1);
      if (result === "ERROR") setScoreAway((s) => s + 1);

      // Timeline: prepend (mais recente no topo)
      const actionId = res.data.actionId;
      setLocalActions((prev) => [
        {
          id: actionId,
          set: currentSet,
          player: { name: player.name, number: player.number },
          type,
          result,
          isOpponentPoint: false,
        },
        ...prev,
      ]);
    }
  };

  const handleUndo = async () => {
    if (!lastActionId) return;
    const res = await undoLastAction(matchId, lastActionId);
    if (res.success && res.data) {
      if (res.data.revertedResult === "POINT")
        setScoreHome((s) => Math.max(0, s - 1));
      if (res.data.revertedResult === "ERROR")
        setScoreAway((s) => Math.max(0, s - 1));

      // Remove da timeline
      const removedId = lastActionId;
      setLocalActions((prev) => prev.filter((a) => a.id !== removedId));
      setLastActionId(null);
    }
  };

  const handleNewSet = async () => {
    const res = await startNewSet(matchId);
    if (res.success && res.data) {
      const { savedHome, savedAway, newSet: nextSet } = res.data;
      setSetsHistory((prev) => [...prev, { home: savedHome, away: savedAway }]);
      setScoreHome(0);
      setScoreAway(0);
      setCurrentSet(nextSet);
      setViewingSet(nextSet); // Auto-muda a timeline para o novo set
      setLastActionId(null);
    }
  };

  const activePlayer = activePlayerSlot
    ? (lineup[activePlayerSlot] as RecorderPlayer | null)
    : null;

  // ── Substituição ─────────────────────────────────────────────
  const courtPlayers: CourtEntry[] = (
    Object.entries(lineup) as [string, SlotPlayer | null][]
  )
    .filter(([, p]) => p !== null)
    .map(([slot, p]) => ({
      slot: Number(slot) as SlotNumber,
      player: p as SlotPlayer,
    }));

  const benchPlayers = players.filter((p) => !assignedIds.has(p.id));

  const handleSubstitute = async (slot: SlotNumber, inPlayer: SlotPlayer) => {
    const outPlayer = lineup[slot];
    if (!outPlayer) return;
    const res = await substitutePlayer({
      matchId,
      slot,
      outPlayerId: outPlayer.id,
      inPlayerId: inPlayer.id,
    });
    if (res.success) {
      setLineup((prev) => ({ ...prev, [slot]: inPlayer }));
      setSubstitutionOpen(false);
    }
  };

  // ── Rotação ──────────────────────────────────────────────────
  const ROTATION_SOURCE: Record<SlotNumber, SlotNumber> = {
    1: 2,
    2: 3,
    3: 4,
    4: 5,
    5: 6,
    6: 1,
  };

  const handleRotate = () => {
    // Atualiza local imediatamente (otimístico)
    setLineup((prev) => {
      const next = { ...prev };
      for (const slot of [1, 2, 3, 4, 5, 6] as SlotNumber[]) {
        next[slot] = prev[ROTATION_SOURCE[slot]];
      }
      return next;
    });
    startRotateTransition(async () => {
      await rotateLineup({ matchId });
    });
  };

  // ── Inner grid de slots (mesmo para ambos os modos) ─────────────
  const slotGrid = (fillHeight: boolean) =>
    COURT_GRID.flat().map((slot) => (
      <div key={slot} className='flex items-center justify-center'>
        <div
          className={
            fillHeight
              ? "aspect-square h-full max-h-24 max-w-24"
              : "w-full aspect-square max-w-25"
          }
        >
          <PlayerSlot
            slotLabel={`P${slot}`}
            player={lineup[slot]}
            onClick={() => {
              if (mode === "setup") {
                setActivePickerSlot(slot);
              } else if (lineup[slot]) {
                setActivePlayerSlot(slot);
              }
            }}
            onRemove={mode === "setup" ? () => handleRemove(slot) : undefined}
          />
        </div>
      </div>
    ));

  return (
    // Wrapper flex-1 para que o componente preencha a altura disponível na page
    <div className='flex-1 min-h-0 flex flex-col'>
      {mode === "live" ? (
        /* ── Live: preenche a altura disponível ── */
        <div className='flex-1 min-h-0 flex gap-3 items-stretch'>
          {/* Timeline */}
          <div className='w-44 shrink-0'>
            <ActionTimeline
              actions={localActions}
              currentSet={currentSet}
              viewingSet={viewingSet}
              onViewSet={setViewingSet}
            />
          </div>

          {/* Coluna direita: Placar + Quadra */}
          <div className='flex-1 min-w-0 flex flex-col gap-3'>
            {/* Placar (altura natural) */}
            <div className='shrink-0'>
              <Scoreboard
                teamName={teamName}
                opponent={opponent}
                scoreHome={scoreHome}
                scoreAway={scoreAway}
                currentSet={currentSet}
                setsHistory={setsHistory}
                hasLastAction={lastActionId !== null}
                onUndo={handleUndo}
                onNewSet={handleNewSet}
                onFinish={handleFinish}
              />
            </div>

            {/* Controles: Substituição + Rotação */}
            <div className='shrink-0 flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='flex-1 h-8 text-xs gap-1.5'
                onClick={() => setSubstitutionOpen(true)}
                disabled={courtPlayers.length === 0}
              >
                <ArrowRightLeft className='size-3.5' />
                Substituição
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='flex-1 h-8 text-xs gap-1.5'
                onClick={handleRotate}
                disabled={courtPlayers.length === 0 || isRotating}
              >
                {isRotating ? (
                  <Loader2 className='size-3.5 animate-spin' />
                ) : (
                  <RotateCcw className='size-3.5' />
                )}
                Rotação
              </Button>
            </div>

            {/* Quadra preenche o restante */}
            <div className='flex-1 min-h-0 relative rounded-lg overflow-hidden border-2 border-white/60 bg-transparent shadow-lg'>
              <div className='h-full flex'>
                {/* Faixa da rede */}
                <div
                  className='relative flex items-center justify-center border-r border-white/50 shrink-0'
                  style={{ width: "15%" }}
                >
                  <span className='text-white/30 text-[10px] font-semibold tracking-widest uppercase [writing-mode:vertical-rl] rotate-180'>
                    Rede
                  </span>
                </div>

                {/* Área principal (relativa para linha de ataque) */}
                <div className='relative flex-1 h-full'>
                  {/* Linha de ataque: 43% do total ≈ 33% desta área */}
                  <div
                    className='absolute top-0 bottom-0 border-r border-white/30 border-dashed'
                    style={{ left: "33%" }}
                  />
                  {/* Grid de jogadores */}
                  <div className='h-full grid grid-cols-2 grid-rows-3 p-3 gap-2'>
                    {slotGrid(true)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Setup: aspect-ratio + botão confirmar ── */
        <div className='flex flex-col gap-4'>
          <div className='relative w-full rounded-lg overflow-hidden border-2 border-white/60 bg-transparent shadow-lg'>
            <div className='relative' style={{ paddingTop: "62.5%" }}>
              <div className='absolute inset-0 flex'>
                <div
                  className='relative flex items-center justify-center border-r border-white/50'
                  style={{ width: "15%" }}
                >
                  <span className='text-white/30 text-[10px] font-semibold tracking-widest uppercase [writing-mode:vertical-rl] rotate-180'>
                    Rede
                  </span>
                </div>
                <div
                  className='absolute top-0 bottom-0 border-r border-white/30 border-dashed'
                  style={{ left: "43%" }}
                />
                <div className='flex-1 grid grid-cols-2 grid-rows-3 p-4 gap-3'>
                  {slotGrid(false)}
                </div>
              </div>
            </div>
          </div>

          <div className='flex flex-col items-center gap-2'>
            {setupError && (
              <p className='text-sm text-destructive'>{setupError}</p>
            )}
            <Button
              onClick={handleConfirmLineup}
              disabled={filledSlots === 0 || isPending}
              size='lg'
            >
              {isPending ? (
                <>
                  <Loader2 className='mr-2 size-4 animate-spin' />
                  Salvando...
                </>
              ) : (
                `Confirmar Escalação (${filledSlots}/6)`
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Sheets / Dialogs — sempre montados para o Portal funcionar */}
      <SubstitutionDialog
        open={substitutionOpen}
        courtPlayers={courtPlayers}
        benchPlayers={benchPlayers}
        onConfirm={handleSubstitute}
        onClose={() => setSubstitutionOpen(false)}
      />

      <PlayerPicker
        open={activePickerSlot !== null}
        slotLabel={activePickerSlot ? `P${activePickerSlot}` : ""}
        players={availablePlayers}
        onSelect={handleSelectPlayer}
        onClose={() => setActivePickerSlot(null)}
      />

      <ActionRecorder
        open={activePlayerSlot !== null}
        player={activePlayer}
        currentSet={currentSet}
        onSave={handleSaveAction}
        onClose={() => setActivePlayerSlot(null)}
      />
    </div>
  );
}
