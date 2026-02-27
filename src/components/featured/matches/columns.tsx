"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, Play, Trash2 } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MatchStatus } from "@/generated/prisma/enums";
import { useMatches } from "@/hooks/use-matches";

export type MatchRow = {
  id: string;
  opponent: string;
  location: string | null;
  date: Date;
  status: MatchStatus;
  team: {
    id: string;
    name: string;
  };
};

function MatchOptionsCell({ match }: { match: MatchRow }) {
  const { startMatch, deleteMatch, isPending } = useMatches();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isFinished = match.status === "FINISHED";

  const handleDelete = async () => {
    setDeleting(true);
    await deleteMatch({ id: match.id });
    setDeleting(false);
    setDeleteOpen(false);
  };

  return (
    <TooltipProvider>
      <div className='flex items-center gap-1'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              disabled={isPending || isFinished}
              onClick={() => startMatch(match.id)}
            >
              <Play className='size-4' />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isFinished ? "Partida finalizada" : "Iniciar Scout"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              disabled={isPending}
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className='size-4' />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Excluir Partida</TooltipContent>
        </Tooltip>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent showCloseButton={false} className='max-w-sm p-6'>
          <DialogHeader>
            <DialogTitle>Excluir partida?</DialogTitle>
            <DialogDescription>
              {isFinished
                ? "Todos os dados do scout serão excluídos permanentemente — ações por jogador, escalação e placar de cada set. Essa ação não pode ser desfeita."
                : "A partida será excluída. Essa ação não pode ser desfeita."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='mt-2'>
            <Button
              variant='outline'
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className='mr-2 size-4 animate-spin' />}
              Excluir partida
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

export const columns: ColumnDef<MatchRow>[] = [
  {
    accessorKey: "team.name",
    header: "Time",
    cell: ({ row }) => row.original.team.name,
    filterFn: (row, _columnId, filterValue) => {
      if (filterValue === "all") return true;
      return row.original.team.id === filterValue;
    },
  },
  {
    accessorKey: "opponent",
    header: "Adversário",
  },
  {
    accessorKey: "date",
    header: "Data e Hora",
    cell: ({ row }) =>
      new Date(row.original.date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    filterFn: (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      const { from, to } = filterValue as { from?: Date; to?: Date };
      if (!from) return true;
      const date = new Date(row.original.date);
      if (from && !to) return date >= from;
      if (from && to) {
        const endOfDay = new Date(to);
        endOfDay.setHours(23, 59, 59, 999);
        return date >= from && date <= endOfDay;
      }
      return true;
    },
  },
  {
    accessorKey: "location",
    header: "Local",
    cell: ({ row }) => row.original.location || "—",
  },
  {
    id: "options",
    header: "",
    cell: ({ row }) => <MatchOptionsCell match={row.original} />,
    enableSorting: false,
  },
];
