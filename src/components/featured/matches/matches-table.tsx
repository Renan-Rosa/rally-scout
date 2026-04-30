"use client";

import { columns, type MatchRow } from "./columns";
import { MatchesDataTable } from "./matches-data-table";

interface MatchesTableProps {
  matches: MatchRow[];
  liveMatchId?: string | null;
}

export function MatchesTable({ matches, liveMatchId }: MatchesTableProps) {
  return (
    <MatchesDataTable
      columns={columns}
      data={matches}
      liveMatchId={liveMatchId}
    />
  );
}
