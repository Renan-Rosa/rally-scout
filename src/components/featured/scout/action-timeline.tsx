"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import type { ActionResult, ActionType } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { ACTION_RESULT_LABELS, ACTION_TYPE_LABELS } from "@/lib/volleyball";

export type TimelineAction = {
  id: string;
  set: number;
  player: { name: string; number: number } | null;
  type: ActionType;
  result: ActionResult;
  isOpponentPoint?: boolean;
};

type Props = {
  actions: TimelineAction[];
  currentSet: number;
  viewingSet: number;
  onViewSet: (set: number) => void;
};

const ITEM_BG: Record<ActionResult, string> = {
  POINT: "bg-green-500/10 border-green-500/25",
  ERROR: "bg-red-500/10 border-red-500/25",
  NEGATIVE: "bg-orange-500/[0.08] border-orange-500/20",
  NEUTRAL: "border-border bg-transparent",
  POSITIVE: "bg-blue-500/[0.08] border-blue-500/20",
};

const RESULT_TEXT: Record<ActionResult, string> = {
  POINT: "text-green-500",
  ERROR: "text-red-500",
  NEGATIVE: "text-orange-400",
  NEUTRAL: "text-muted-foreground",
  POSITIVE: "text-blue-400",
};

export function ActionTimeline({
  actions,
  currentSet,
  viewingSet,
  onViewSet,
}: Props) {
  const filtered = actions.filter((a) => a.set === viewingSet);

  return (
    <div className='flex flex-col h-full rounded-xl border bg-card shadow-sm overflow-hidden'>
      {/* Header */}
      <div className='px-3 pt-3 pb-2.5 border-b shrink-0'>
        <p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2'>
          Timeline
        </p>
        <div className='flex gap-1'>
          {Array.from({ length: currentSet }, (_, i) => i + 1).map((set) => (
            <button
              key={set}
              type='button'
              onClick={() => onViewSet(set)}
              className={cn(
                "text-[11px] font-semibold rounded px-2 py-0.5 transition-colors",
                viewingSet === set
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              S{set}
            </button>
          ))}
        </div>
      </div>

      {/* Actions list */}
      <ScrollArea className='flex-1 min-h-0'>
        <div className='p-2.5 flex flex-col gap-1.5'>
          {filtered.length === 0 ? (
            <p className='text-center text-muted-foreground/50 text-xs py-10 px-2'>
              Nenhuma ação registrada
            </p>
          ) : (
            filtered.map((action) => (
              <div
                key={action.id}
                className={cn(
                  "rounded-lg border px-2.5 py-2",
                  ITEM_BG[action.result],
                )}
              >
                {action.player && (
                  <div className='flex items-center gap-1.5 mb-1'>
                    <span className='size-4.5 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold tabular-nums shrink-0'>
                      {action.player.number}
                    </span>
                    <span className='text-[11px] font-medium truncate'>
                      {action.player.name.split(" ")[0]}
                    </span>
                  </div>
                )}
                <div className='flex items-center justify-between gap-1'>
                  <span className='text-[10px] text-muted-foreground'>
                    {ACTION_TYPE_LABELS[action.type]}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold",
                      RESULT_TEXT[action.result],
                    )}
                  >
                    {ACTION_RESULT_LABELS[action.result]}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
