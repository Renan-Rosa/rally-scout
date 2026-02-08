"use client";

import { columns, type MatchRow } from "./columns";
import { MatchesDataTable } from "./matches-data-table";

interface MatchesTableProps {
  matches: MatchRow[];
}

export function MatchesTable({ matches }: MatchesTableProps) {
  return <MatchesDataTable columns={columns} data={matches} />;
}
