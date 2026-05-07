"use client";

import type { PlayerRow } from "./columns";
import { PlayersView } from "./players-view";

interface PlayersTableProps {
  players: PlayerRow[];
}

export function PlayersTable({ players }: PlayersTableProps) {
  return <PlayersView players={players} />;
}
