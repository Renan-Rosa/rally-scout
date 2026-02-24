"use client";

import { ArrowDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { POSITION_SHORT_LABELS } from "@/lib/volleyball";
import type { SlotPlayer } from "./player-slot";

type SlotNumber = 1 | 2 | 3 | 4 | 5 | 6;

export type CourtEntry = { slot: SlotNumber; player: SlotPlayer };

type Props = {
  open: boolean;
  courtPlayers: CourtEntry[];
  benchPlayers: SlotPlayer[];
  onConfirm: (slot: SlotNumber, inPlayer: SlotPlayer) => Promise<void>;
  onClose: () => void;
};

export function SubstitutionDialog({
  open,
  courtPlayers,
  benchPlayers,
  onConfirm,
  onClose,
}: Props) {
  const [outEntry, setOutEntry] = useState<CourtEntry | null>(null);
  const [inPlayer, setInPlayer] = useState<SlotPlayer | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleClose = () => {
    setOutEntry(null);
    setInPlayer(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (!outEntry || !inPlayer) return;
    setIsPending(true);
    await onConfirm(outEntry.slot, inPlayer);
    setIsPending(false);
    setOutEntry(null);
    setInPlayer(null);
  };

  const canConfirm = outEntry !== null && inPlayer !== null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className='max-w-sm p-0 gap-0 overflow-hidden'
        showCloseButton={false}
      >
        <div className='p-4 pb-3 border-b'>
          <DialogHeader>
            <DialogTitle>Substituição</DialogTitle>
          </DialogHeader>
        </div>

        <div className='p-4 flex flex-col gap-4'>
          {/* Quem sai */}
          <div>
            <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2'>
              Quem sai?
            </p>
            <div className='grid grid-cols-3 gap-2'>
              {courtPlayers.map((entry) => {
                const isSelected = outEntry?.slot === entry.slot;
                return (
                  <button
                    key={entry.slot}
                    type='button'
                    onClick={() => setOutEntry(isSelected ? null : entry)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border p-2.5 transition-all",
                      isSelected
                        ? "border-red-500 bg-red-500/10 ring-1 ring-red-500"
                        : "border-border hover:border-muted-foreground/50 hover:bg-muted/50",
                    )}
                  >
                    <div
                      className={cn(
                        "size-9 rounded-full flex items-center justify-center text-sm font-black tabular-nums",
                        isSelected
                          ? "bg-red-500 text-white"
                          : "bg-muted text-foreground",
                      )}
                    >
                      {entry.player.number}
                    </div>
                    <span className='text-[11px] font-medium truncate max-w-full leading-none'>
                      {entry.player.name.split(" ")[0]}
                    </span>
                    <span
                      className={cn(
                        "text-[9px] font-semibold uppercase",
                        isSelected ? "text-red-400" : "text-muted-foreground",
                      )}
                    >
                      P{entry.slot} ·{" "}
                      {POSITION_SHORT_LABELS[entry.player.position]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divisor */}
          <div className='flex items-center gap-2'>
            <div className='flex-1 border-t border-dashed' />
            <div className='size-6 rounded-full border flex items-center justify-center shrink-0'>
              <ArrowDown className='size-3 text-muted-foreground' />
            </div>
            <div className='flex-1 border-t border-dashed' />
          </div>

          {/* Quem entra */}
          <div>
            <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2'>
              Quem entra?
            </p>

            {benchPlayers.length === 0 ? (
              <p className='text-xs text-muted-foreground/60 text-center py-4'>
                Nenhum jogador disponível no banco
              </p>
            ) : (
              <div className='flex flex-col gap-1.5 max-h-44 overflow-y-auto'>
                {benchPlayers.map((player) => {
                  const isSelected = inPlayer?.id === player.id;
                  return (
                    <button
                      key={player.id}
                      type='button'
                      onClick={() => setInPlayer(isSelected ? null : player)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all",
                        isSelected
                          ? "border-green-500 bg-green-500/10 ring-1 ring-green-500"
                          : "border-border hover:border-muted-foreground/50 hover:bg-muted/50",
                      )}
                    >
                      <div
                        className={cn(
                          "size-8 rounded-full flex items-center justify-center text-sm font-black tabular-nums shrink-0",
                          isSelected
                            ? "bg-green-500 text-white"
                            : "bg-muted text-foreground",
                        )}
                      >
                        {player.number}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium truncate leading-none mb-0.5'>
                          {player.name}
                        </p>
                        <p
                          className={cn(
                            "text-[11px]",
                            isSelected
                              ? "text-green-400"
                              : "text-muted-foreground",
                          )}
                        >
                          {POSITION_SHORT_LABELS[player.position]}
                        </p>
                      </div>
                      {isSelected && (
                        <span className='text-[10px] font-bold text-green-500 shrink-0'>
                          Entrando
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className='p-4 pt-0 flex gap-2'>
          <Button
            variant='outline'
            className='flex-1'
            onClick={handleClose}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            className='flex-1'
            disabled={!canConfirm || isPending}
            onClick={handleConfirm}
          >
            {isPending ? (
              <>
                <Loader2 className='mr-2 size-4 animate-spin' />
                Substituindo...
              </>
            ) : (
              "Confirmar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
