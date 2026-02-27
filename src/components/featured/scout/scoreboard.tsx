"use client";

import { ChevronRight, Flag, Loader2, Undo2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type SetHistory = { home: number; away: number };

type Props = {
  teamName: string;
  opponent: string;
  scoreHome: number;
  scoreAway: number;
  currentSet: number;
  setsHistory: SetHistory[];
  hasLastAction: boolean;
  onUndo: () => Promise<void>;
  onNewSet: () => Promise<void>;
  onFinish: () => Promise<void>;
};

export function Scoreboard({
  teamName,
  opponent,
  scoreHome,
  scoreAway,
  currentSet,
  setsHistory,
  hasLastAction,
  onUndo,
  onNewSet,
  onFinish,
}: Props) {
  const [undoing, setUndoing] = useState(false);
  const [newSetPending, setNewSetPending] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const handleUndo = async () => {
    setUndoing(true);
    await onUndo();
    setUndoing(false);
  };

  const handleNewSet = async () => {
    setNewSetPending(true);
    await onNewSet();
    setNewSetPending(false);
  };

  const handleFinish = async () => {
    setFinishing(true);
    await onFinish();
    setFinishing(false);
    setFinishOpen(false);
  };

  return (
    <>
      <div className='rounded-xl border bg-card shadow-sm overflow-hidden'>
        {/* Set tabs */}
        <div className='bg-muted/40 px-4 py-2 flex items-center justify-between gap-2'>
          <div className='flex items-center gap-1.5 flex-wrap'>
            {Array.from({ length: 5 }, (_, i) => i + 1).map((set) => {
              const history = setsHistory[set - 1];
              const isCurrent = set === currentSet;
              const isPast = set < currentSet;
              const wonSet = history && history.home > history.away;
              const lostSet = history && history.away > history.home;
              return (
                <span
                  key={set}
                  className={cn(
                    "text-[11px] font-semibold rounded px-2 py-0.5 tabular-nums border",
                    isCurrent && "bg-primary text-primary-foreground border-transparent",
                    isPast && wonSet && "bg-green-500/15 text-green-400 border-green-500/30",
                    isPast && lostSet && "bg-red-500/15 text-red-400 border-red-500/30",
                    isPast && !wonSet && !lostSet && "bg-muted text-muted-foreground border-transparent",
                    !isCurrent && !isPast && "text-muted-foreground/30 border-transparent",
                  )}
                >
                  {isPast && history
                    ? `S${set} ${history.home}–${history.away}`
                    : `S${set}`}
                </span>
              );
            })}
          </div>
          <span className='text-[11px] text-muted-foreground shrink-0'>
            Set {currentSet} / 5
          </span>
        </div>

        {/* Score */}
        <div className='px-6 py-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3'>
          <div className='text-center'>
            <p className='text-xs text-muted-foreground truncate mb-1 font-medium'>
              {teamName}
            </p>
            <p className='text-7xl font-black tabular-nums leading-none tracking-tight'>
              {scoreHome}
            </p>
          </div>

          <div className='text-center'>
            <p className='text-2xl font-bold text-muted-foreground/50'>×</p>
          </div>

          <div className='text-center'>
            <p className='text-xs text-muted-foreground truncate mb-1 font-medium'>
              {opponent}
            </p>
            <p className='text-7xl font-black tabular-nums leading-none tracking-tight text-muted-foreground'>
              {scoreAway}
            </p>
          </div>
        </div>

        <Separator />

        {/* Controls */}
        <div className='px-4 py-3 flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            disabled={!hasLastAction || undoing}
            className='gap-1.5 text-muted-foreground hover:text-foreground'
            onClick={handleUndo}
          >
            {undoing ? (
              <Loader2 className='size-3.5 animate-spin' />
            ) : (
              <Undo2 className='size-3.5' />
            )}
            Desfazer
          </Button>

          <div className='flex-1' />

          <Button
            variant='ghost'
            size='sm'
            className='gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10'
            onClick={() => setFinishOpen(true)}
          >
            <Flag className='size-3.5' />
            Finalizar
          </Button>

          <Button
            variant='outline'
            size='sm'
            disabled={currentSet >= 5 || newSetPending}
            className='gap-1'
            onClick={handleNewSet}
          >
            {newSetPending && <Loader2 className='size-3.5 animate-spin' />}
            Novo Set
            {!newSetPending && <ChevronRight className='size-3.5' />}
          </Button>
        </div>
      </div>

      <Dialog open={finishOpen} onOpenChange={setFinishOpen}>
        <DialogContent showCloseButton={false} className='max-w-sm p-6'>
          <DialogHeader>
            <DialogTitle>Finalizar partida?</DialogTitle>
            <DialogDescription>
              O placar do set atual ({scoreHome}–{scoreAway}) será salvo e a
              partida encerrada. Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='mt-2'>
            <Button
              variant='outline'
              onClick={() => setFinishOpen(false)}
              disabled={finishing}
            >
              Cancelar
            </Button>
            <Button
              variant='destructive'
              onClick={handleFinish}
              disabled={finishing}
            >
              {finishing && <Loader2 className='mr-2 size-4 animate-spin' />}
              Finalizar partida
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
