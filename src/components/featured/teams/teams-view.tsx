"use client";

import { LayoutGrid, List, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TeamType } from "@/generated/prisma/enums";
import { TEAM_TYPE_LABELS } from "@/lib/volleyball";
import { TeamDetailSheet } from "./team-detail-sheet";
import { TeamsGrid } from "./teams-grid";
import { TeamsDataTable } from "./teams-data-table";
import { columns } from "./columns";

type Team = {
  id: string;
  name: string;
  type: TeamType;
  logoUrl: string | null;
  _count: { players: number; matches: number };
};

interface Props {
  teams: Team[];
}

const VIEW_KEY = "rally:teams-view";

export function TeamsView({ teams }: Props) {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("all");
  const [selected, setSelected] = useState<Team | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(VIEW_KEY);
    if (saved === "table" || saved === "grid") setView(saved);
  }, []);

  const handleViewChange = (next: "grid" | "table") => {
    setView(next);
    localStorage.setItem(VIEW_KEY, next);
  };

  const filtered = useMemo(() => {
    return teams.filter((t) => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (type !== "all" && t.type !== type) return false;
      return true;
    });
  }, [teams, search, type]);

  const handleSelect = (team: Team) => {
    setSelected(team);
    setSheetOpen(true);
  };

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-3'>
        <div className='relative max-w-sm flex-1'>
          <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Pesquisar pelo nome...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-9'
          />
        </div>

        <Select value={type} onValueChange={setType}>
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='Categoria' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todas</SelectItem>
            {Object.entries(TEAM_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className='ml-auto flex rounded-md border p-0.5'>
          <Button
            type='button'
            variant={view === "grid" ? "secondary" : "ghost"}
            size='sm'
            className='h-7 px-2'
            onClick={() => handleViewChange("grid")}
          >
            <LayoutGrid className='size-4' />
            <span className='sr-only'>Ver em grade</span>
          </Button>
          <Button
            type='button'
            variant={view === "table" ? "secondary" : "ghost"}
            size='sm'
            className='h-7 px-2'
            onClick={() => handleViewChange("table")}
          >
            <List className='size-4' />
            <span className='sr-only'>Ver em tabela</span>
          </Button>
        </div>
      </div>

      <p className='text-xs text-muted-foreground'>
        {filtered.length} time{filtered.length === 1 ? "" : "s"}
      </p>

      {view === "grid" ? (
        <TeamsGrid teams={filtered} onSelect={handleSelect} />
      ) : (
        <TeamsDataTable columns={columns} data={filtered} />
      )}

      <TeamDetailSheet
        team={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
