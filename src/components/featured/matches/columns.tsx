"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ChartNoAxesColumnIncreasing, CircleX, Play } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MatchStatus } from "@/generated/prisma/enums";
import { useMatches } from "@/hooks/use-matches";
import { MATCH_STATUS_LABELS } from "@/lib/volleyball";

export type MatchRow = {
  id: string;
  opponent: string;
  location: string | null;
  date: Date;
  status: MatchStatus;
  setsHome: number[];
  setsAway: number[];
  team: {
    id: string;
    name: string;
  };
};

const statusColors: Record<MatchStatus, string> = {
  SCHEDULED: "bg-blue-600 border-blue-700 text-white",
  LIVE: "bg-green-600 border-green-700 text-white",
  FINISHED: "bg-slate-500 border-slate-600 text-white",
  CANCELED: "bg-red-600 border-red-700 text-white",
};

function formatScore(setsHome: number[], setsAway: number[]): string {
  if (setsHome.length === 0) return "—";
  const winsHome = setsHome.filter((s, i) => s > setsAway[i]).length;
  const winsAway = setsAway.filter((s, i) => s > setsHome[i]).length;
  return `${winsHome}x${winsAway}`;
}

function MatchOptionsCell({ match }: { match: MatchRow }) {
  const { updateMatch, isPending } = useMatches();

  const handleCancel = async () => {
    await updateMatch({
      id: match.id,
      opponent: match.opponent,
      location: match.location ?? undefined,
      date: match.date,
      status: "CANCELED",
    });
  };

  return (
    <TooltipProvider>
      <div className='flex items-center gap-1'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              disabled={match.status !== "SCHEDULED"}
              asChild={match.status === "SCHEDULED"}
            >
              {match.status === "SCHEDULED" ? (
                <Link href='/scout/new'>
                  <Play className='size-4' />
                </Link>
              ) : (
                <Play className='size-4' />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Iniciar Scout</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              disabled={match.status !== "FINISHED"}
              asChild={match.status === "FINISHED"}
            >
              {match.status === "FINISHED" ? (
                <Link href={`/stats/matches/${match.id}`}>
                  <ChartNoAxesColumnIncreasing className='size-4' />
                </Link>
              ) : (
                <ChartNoAxesColumnIncreasing className='size-4' />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ver Estatísticas</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              disabled={match.status === "CANCELED" || isPending}
              onClick={handleCancel}
            >
              <CircleX className='size-4' />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cancelar Partida</TooltipContent>
        </Tooltip>
      </div>
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge className={statusColors[row.original.status]}>
        {MATCH_STATUS_LABELS[row.original.status]}
      </Badge>
    ),
    filterFn: (row, _columnId, filterValue) => {
      if (filterValue === "all") return true;
      return row.original.status === filterValue;
    },
  },
  {
    id: "score",
    header: "Placar",
    cell: ({ row }) =>
      formatScore(row.original.setsHome, row.original.setsAway),
  },
  {
    id: "options",
    header: "",
    cell: ({ row }) => <MatchOptionsCell match={row.original} />,
    enableSorting: false,
  },
];
