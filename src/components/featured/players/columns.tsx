"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Position } from "@/generated/prisma/enums";
import { POSITION_LABELS } from "@/lib/volleyball";
import { getInitials } from "@/utils/get-initials";

export type PlayerRow = {
  id: string;
  name: string;
  number: number;
  position: Position;
  isActive: boolean;
  team: {
    id: string;
    name: string;
  };
};

export const columns: ColumnDef<PlayerRow>[] = [
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
    accessorKey: "number",
    header: "Camisa",
    cell: ({ row }) => <span>#{row.original.number}</span>,
  },
  {
    accessorKey: "position",
    header: "Posição",
    cell: ({ row }) => (
      <Badge variant='outline'>{POSITION_LABELS[row.original.position]}</Badge>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) =>
      row.original.isActive ? (
        <Badge variant='default'>Ativo</Badge>
      ) : (
        <Badge variant='secondary'>Inativo</Badge>
      ),
    filterFn: (row, _columnId, filterValue) => {
      if (filterValue === "all") return true;
      if (filterValue === "active") return row.original.isActive === true;
      if (filterValue === "inactive") return row.original.isActive === false;
      return true;
    },
  },
  {
    accessorKey: "team.name",
    header: "Time",
    cell: ({ row }) => row.original.team.name,
  },
];
