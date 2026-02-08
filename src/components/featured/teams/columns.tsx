"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { TeamType } from "@/generated/prisma";
import { TEAM_TYPE_LABELS } from "@/lib/volleyball";
import { getInitials } from "@/utils/get-initials";

export type TeamRow = {
  id: string;
  name: string;
  type: TeamType;
  _count: {
    players: number;
    matches: number;
  };
};

export const columns: ColumnDef<TeamRow>[] = [
  {
    id: "avatar",
    header: "",
    cell: ({ row }) => (
      <Avatar size='sm'>
        <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
      </Avatar>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "type",
    header: "Categoria",
    cell: ({ row }) => (
      <Badge variant='outline'>{TEAM_TYPE_LABELS[row.original.type]}</Badge>
    ),
    filterFn: (row, _columnId, filterValue) => {
      if (filterValue === "all") return true;
      return row.original.type === filterValue;
    },
  },
  {
    id: "players",
    header: "Jogadores",
    cell: ({ row }) => row.original._count.players,
  },
  {
    id: "matches",
    header: "Partidas",
    cell: ({ row }) => row.original._count.matches,
  },
];
