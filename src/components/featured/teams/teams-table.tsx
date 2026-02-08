"use client";

import { type TeamRow, columns } from "./columns";
import { TeamsDataTable } from "./teams-data-table";

interface TeamsTableProps {
  teams: TeamRow[];
}

export function TeamsTable({ teams }: TeamsTableProps) {
  return <TeamsDataTable columns={columns} data={teams} />;
}
