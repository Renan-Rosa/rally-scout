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

const positionColors: Record<Position, string> = {
  SETTER: "bg-purple-600 border-purple-700 text-white",
  OUTSIDE: "bg-blue-600 border-blue-700 text-white",
  OPPOSITE: "bg-orange-600 border-orange-700 text-white",
  MIDDLE: "bg-teal-600 border-teal-700 text-white",
  LIBERO: "bg-yellow-600 border-yellow-700 text-white",
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
      <Badge className={positionColors[row.original.position]}>
        {POSITION_LABELS[row.original.position]}
      </Badge>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) =>
      row.original.isActive ? (
        <Badge className='bg-green-600 border-green-700 text-white'>
          Ativo
        </Badge>
      ) : (
        <Badge className='bg-slate-500 border-slate-600 text-white'>
          Inativo
        </Badge>
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
