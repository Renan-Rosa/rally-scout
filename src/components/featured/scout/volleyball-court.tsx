"use client";

import {
  ArrowRightLeft,
  CloudOff,
  Loader2,
  RotateCcw,
  ShieldAlert,
  Wifi,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { syncMatch } from "@/actions/scout";
import { Button } from "@/components/ui/button";
import type { ActionResult, ActionType } from "@/generated/prisma/enums";
import {
  buildSyncPayload,
  type StoredAction,
  type StoredPlayer,
  useScoutStore,
} from "@/stores/scout-store";
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

const COURT_GRID: [SlotNumber, SlotNumber][] = [
  [2, 1],
  [3, 6],
  [4, 5],
];

function toTimelineAction(a: StoredAction): TimelineAction {
  return {
    id: a.clientId,
    set: a.set,
    player: a.player
      ? { name: a.player.name, number: a.player.number }
      : null,
    type: a.type,
    result: a.result,
    isOpponentPoint: a.isOpponentPoint,
  };
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
  const router = useRouter();

  // ── Hydrate store da partida ────────────────────────────────────
  const ensureMatch = useScoutStore((s) => s.ensureMatch);
  const matchState = useScoutStore((s) => s.matches[matchId]);

  // Seed inicial: roda uma única vez. Se já existe estado local (offline),
  // o ensureMatch é no-op e as edições offline prevalecem.
  useEffect(() => {
    ensureMatch({
      matchId,
      lineup: initialLineup.map((e) => ({
        slot: e.slot,
        player: {
          id: e.player.id,
          name: e.player.name,
          number: e.player.number,
          position: e.player.position,
        },
      })),
      actions: initialActions.map((a) => ({
        clientId: a.id,
        set: a.set,
        player: a.player
          ? {
              id: "",
              name: a.player.name,
              number: a.player.number,
              position: "OUTSIDE",
            }
          : null,
        type: a.type,
        result: a.result,
        isOpponentPoint: a.isOpponentPoint ?? false,
        createdAtMs: Date.now(),
      })),
      currentSet: initialCurrentSet,
      scoreHome: initialScoreHome,
      scoreAway: initialScoreAway,
      setsHome: initialSetsHome,
      setsAway: initialSetsAway,
    });
  }, [
    matchId,
    ensureMatch,
    initialLineup,
    initialActions,
    initialCurrentSet,
    initialScoreHome,
    initialScoreAway,
    initialSetsHome,
    initialSetsAway,
  ]);

  // Store actions
  const setSlot = useScoutStore((s) => s.setSlot);
  const confirmLineup = useScoutStore((s) => s.confirmLineup);
  const addAction = useScoutStore((s) => s.addAction);
  const undoLastActionStore = useScoutStore((s) => s.undoLastAction);
  const opponentErrorStore = useScoutStore((s) => s.opponentError);
  const substituteStore = useScoutStore((s) => s.substitute);
  const rotateStore = useScoutStore((s) => s.rotate);
  const startNewSetStore = useScoutStore((s) => s.startNewSet);
  const setSyncStatus = useScoutStore((s) => s.setSyncStatus);
  const clearMatch = useScoutStore((s) => s.clearMatch);

  // ── UI state ────────────────────────────────────────────────────
  const [activePickerSlot, setActivePickerSlot] = useState<SlotNumber | null>(
    null,
  );
  const [activePlayerSlot, setActivePlayerSlot] = useState<SlotNumber | null>(
    null,
  );
  const [substitutionOpen, setSubstitutionOpen] = useState(false);
  const [opponentErrorPending, setOpponentErrorPending] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setIsOnline(navigator.onLine);
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // ── Selectors ───────────────────────────────────────────────────
  const lineup = matchState?.lineup ?? {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
  };
  const mode: "setup" | "live" = matchState?.lineupConfirmed ? "live" : "setup";
  const currentSet = matchState?.currentSet ?? initialCurrentSet;
  const scoreHome = matchState?.scoreHome ?? initialScoreHome;
  const scoreAway = matchState?.scoreAway ?? initialScoreAway;
  const setsHistory: SetHistory[] = useMemo(() => {
    const h = matchState?.setsHome ?? initialSetsHome;
    const a = matchState?.setsAway ?? initialSetsAway;
    return h.map((home, i) => ({ home, away: a[i] ?? 0 }));
  }, [matchState, initialSetsHome, initialSetsAway]);

  const localActions: TimelineAction[] = useMemo(
    () => (matchState?.actions ?? []).map(toTimelineAction).reverse(),
    [matchState],
  );
  const lastClientId = matchState?.actions.length
    ? matchState.actions[matchState.actions.length - 1].clientId
    : null;

  const [viewingSet, setViewingSet] = useState(initialCurrentSet);
  useEffect(() => {
    setViewingSet(currentSet);
  }, [currentSet]);

  const assignedIds = new Set(
    Object.values(lineup)
      .filter(Boolean)
      .map((p) => (p as StoredPlayer).id),
  );
  const availablePlayers = players.filter((p) => !assignedIds.has(p.id));
  const filledSlots = Object.values(lineup).filter(Boolean).length;

  // ── Setup ───────────────────────────────────────────────────────
  const handleSelectPlayer = (player: SlotPlayer) => {
    if (activePickerSlot === null) return;
    setSlot(matchId, activePickerSlot, player);
    setActivePickerSlot(null);
  };

  const handleRemove = (slot: SlotNumber) => {
    setSlot(matchId, slot, null);
  };

  const handleConfirmLineup = () => {
    setSetupError(null);
    if (filledSlots === 0) {
      setSetupError("Adicione pelo menos um jogador à quadra");
      return;
    }
    confirmLineup(matchId);
  };

  // ── Live ────────────────────────────────────────────────────────
  const handleSaveAction = async (type: ActionType, result: ActionResult) => {
    const player = activePlayerSlot ? lineup[activePlayerSlot] : null;
    if (!player) return;
    addAction(matchId, { player, type, result, isOpponentPoint: false });
  };

  const handleUndo = async () => {
    undoLastActionStore(matchId);
  };

  const handleNewSet = async () => {
    startNewSetStore(matchId);
  };

  const handleOpponentError = async () => {
    setOpponentErrorPending(true);
    opponentErrorStore(matchId);
    setOpponentErrorPending(false);
  };

  const handleSubstitute = async (slot: SlotNumber, inPlayer: SlotPlayer) => {
    substituteStore(matchId, slot, inPlayer);
    setSubstitutionOpen(false);
  };

  const handleRotate = () => {
    rotateStore(matchId);
  };

  // ── Finalizar (sync) ────────────────────────────────────────────
  const syncStatus = matchState?.syncStatus ?? "idle";
  const syncError = matchState?.syncError ?? null;

  const handleFinish = async () => {
    if (!matchState) return;
    setSyncStatus(matchId, "syncing", null);
    const payload = buildSyncPayload(matchState);
    try {
      const res = await syncMatch({ ...payload, finalize: true });
      if (res.success) {
        clearMatch(matchId);
        router.push("/matches");
      } else {
        setSyncStatus(matchId, "error", res.error ?? "Erro ao sincronizar");
      }
    } catch (err) {
      console.error("[SYNC_MATCH_CLIENT]", err);
      setSyncStatus(
        matchId,
        "error",
        "Sem conexão. Os dados estão salvos localmente — tente novamente quando voltar a internet.",
      );
    }
  };

  const activePlayer = activePlayerSlot
    ? (lineup[activePlayerSlot] as RecorderPlayer | null)
    : null;

  const courtPlayers: CourtEntry[] = (
    Object.entries(lineup) as [string, StoredPlayer | null][]
  )
    .filter(([, p]) => p !== null)
    .map(([slot, p]) => ({
      slot: Number(slot) as SlotNumber,
      player: p as SlotPlayer,
    }));

  const benchPlayers = players.filter((p) => !assignedIds.has(p.id));

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
    <div className='flex-1 min-h-0 flex flex-col'>
      {/* Banner offline / erro de sync */}
      {(!isOnline || syncStatus === "error") && (
        <div
          className={
            "shrink-0 mb-2 flex items-center gap-2 rounded-md px-3 py-2 text-xs " +
            (syncStatus === "error"
              ? "bg-destructive/10 text-destructive border border-destructive/30"
              : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30")
          }
        >
          {syncStatus === "error" ? (
            <CloudOff className='size-3.5 shrink-0' />
          ) : (
            <Wifi className='size-3.5 shrink-0' />
          )}
          <span className='flex-1'>
            {syncStatus === "error"
              ? syncError
              : "Sem conexão — o scout segue funcionando. Os dados serão enviados ao finalizar."}
          </span>
          {syncStatus === "error" && (
            <Button
              size='sm'
              variant='outline'
              className='h-6 text-[11px]'
              onClick={handleFinish}
            >
              Tentar novamente
            </Button>
          )}
        </div>
      )}

      {mode === "live" ? (
        <div className='flex-1 min-h-0 flex gap-3 items-stretch'>
          <div className='w-44 shrink-0'>
            <ActionTimeline
              actions={localActions}
              currentSet={currentSet}
              viewingSet={viewingSet}
              onViewSet={setViewingSet}
            />
          </div>

          <div className='flex-1 min-w-0 flex flex-col gap-3'>
            <div className='shrink-0'>
              <Scoreboard
                teamName={teamName}
                opponent={opponent}
                scoreHome={scoreHome}
                scoreAway={scoreAway}
                currentSet={currentSet}
                setsHistory={setsHistory}
                hasLastAction={lastClientId !== null}
                onUndo={handleUndo}
                onNewSet={handleNewSet}
                onFinish={handleFinish}
              />
            </div>

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
                disabled={courtPlayers.length === 0}
              >
                <RotateCcw className='size-3.5' />
                Rotação
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='flex-1 h-8 text-xs gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-500/10 border-green-500/40'
                onClick={handleOpponentError}
                disabled={opponentErrorPending}
              >
                {opponentErrorPending ? (
                  <Loader2 className='size-3.5 animate-spin' />
                ) : (
                  <ShieldAlert className='size-3.5' />
                )}
                Erro Adversário
              </Button>
            </div>

            <div className='flex-1 min-h-0 relative rounded-lg overflow-hidden border-2 border-white/60 bg-transparent shadow-lg'>
              <div className='h-full flex'>
                <div
                  className='relative flex items-center justify-center border-r border-white/50 shrink-0'
                  style={{ width: "15%" }}
                >
                  <span className='text-white/30 text-[10px] font-semibold tracking-widest uppercase [writing-mode:vertical-rl] rotate-180'>
                    Rede
                  </span>
                </div>

                <div className='relative flex-1 h-full'>
                  <div
                    className='absolute top-0 bottom-0 border-r border-white/30 border-dashed'
                    style={{ left: "33%" }}
                  />
                  <div className='h-full grid grid-cols-2 grid-rows-3 p-3 gap-2'>
                    {slotGrid(true)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
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
              disabled={filledSlots === 0}
              size='lg'
            >
              Confirmar Escalação ({filledSlots}/6)
            </Button>
          </div>
        </div>
      )}

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
