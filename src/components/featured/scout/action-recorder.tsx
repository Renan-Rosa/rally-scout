"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type {
  ActionResult,
  ActionType,
  Position,
} from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import {
  ACTION_RESULT_LABELS,
  ACTION_TYPE_LABELS,
  POSITION_SHORT_LABELS,
  VALID_RESULTS_BY_ACTION,
} from "@/lib/volleyball";

export type RecorderPlayer = {
  id: string;
  name: string;
  number: number;
  position: Position;
};

type Props = {
  open: boolean;
  player: RecorderPlayer | null;
  currentSet: number;
  onSave: (type: ActionType, result: ActionResult) => Promise<void>;
  onClose: () => void;
};

const RESULT_STYLES: Record<ActionResult, string> = {
  ERROR:
    "bg-red-600 hover:bg-red-700 border-red-700 text-white dark:bg-red-700 dark:hover:bg-red-600",
  NEGATIVE: "bg-orange-500 hover:bg-orange-600 border-orange-600 text-white",
  NEUTRAL: "bg-yellow-500 hover:bg-yellow-600 border-yellow-600 text-black",
  POSITIVE: "bg-blue-500 hover:bg-blue-600 border-blue-600 text-white",
  POINT: "bg-green-600 hover:bg-green-700 border-green-700 text-white",
};

const ACTION_TYPES = Object.keys(ACTION_TYPE_LABELS) as ActionType[];

export function ActionRecorder({
  open,
  player,
  currentSet,
  onSave,
  onClose,
}: Props) {
  const [selectedType, setSelectedType] = useState<ActionType | null>(null);
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    setSelectedType(null);
    onClose();
  };

  const handleSelectResult = async (result: ActionResult) => {
    if (!selectedType || !player) return;
    setSaving(true);
    await onSave(selectedType, result);
    setSaving(false);
    setSelectedType(null);
    onClose();
  };

  const validResults = selectedType
    ? VALID_RESULTS_BY_ACTION[selectedType]
    : [];

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent side='bottom' className='flex flex-col gap-4 pb-8'>
        {/* Player header */}
        {player && (
          <SheetHeader>
            <SheetTitle className='flex items-center gap-3 text-left'>
              <span className='flex items-center justify-center size-10 rounded-full bg-muted font-black text-lg tabular-nums shrink-0'>
                {player.number}
              </span>
              <div className='min-w-0'>
                <p className='font-semibold truncate'>{player.name}</p>
                <p className='text-muted-foreground text-xs font-normal'>
                  {POSITION_SHORT_LABELS[player.position]} · Set {currentSet}
                </p>
              </div>
            </SheetTitle>
          </SheetHeader>
        )}

        {!selectedType ? (
          /* Step 1: Fundamento — grade 3×2 */
          <div className='px-4'>
            <p className='text-muted-foreground text-xs mb-3 uppercase tracking-widest font-semibold'>
              Fundamento
            </p>
            <div className='grid grid-cols-3 gap-2'>
              {ACTION_TYPES.map((type) => (
                <Button
                  key={type}
                  variant='outline'
                  className='h-14 text-sm font-semibold'
                  onClick={() => setSelectedType(type)}
                >
                  {ACTION_TYPE_LABELS[type]}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          /* Step 2: Resultado — todos em linha */
          <div className='px-4'>
            <div className='flex items-center gap-3 mb-3'>
              <button
                type='button'
                onClick={() => setSelectedType(null)}
                className='text-muted-foreground text-xs hover:text-foreground transition-colors'
              >
                ← Voltar
              </button>
              <p className='text-muted-foreground text-xs uppercase tracking-widest font-semibold'>
                {ACTION_TYPE_LABELS[selectedType]}
              </p>
            </div>

            {/* Todos os resultados em uma linha */}
            <div className='flex gap-1.5'>
              {validResults.map((result) => (
                <button
                  key={result}
                  type='button'
                  disabled={saving}
                  onClick={() => handleSelectResult(result)}
                  className={cn(
                    "flex-1 h-12 rounded-lg border text-[11px] font-bold tracking-wide transition-opacity disabled:opacity-50",
                    RESULT_STYLES[result],
                  )}
                >
                  {ACTION_RESULT_LABELS[result]}
                </button>
              ))}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
