"use client";

import { columns, type PlayerRow } from "./columns";
import { PlayersDataTable } from "./players-data-table";

interface PlayersTableProps {
  players: PlayerRow[];
}

export function PlayersTable({ players }: PlayersTableProps) {
  return <PlayersDataTable columns={columns} data={players} />;
}
