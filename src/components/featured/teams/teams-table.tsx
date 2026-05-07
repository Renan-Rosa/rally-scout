"use client";

import type { TeamRow } from "./columns";
import { TeamsView } from "./teams-view";

interface TeamsTableProps {
  teams: TeamRow[];
}

export function TeamsTable({ teams }: TeamsTableProps) {
  return <TeamsView teams={teams} />;
}
