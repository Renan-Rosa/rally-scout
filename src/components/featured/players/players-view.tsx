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
import type { Position } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { POSITION_LABELS } from "@/lib/volleyball";
import { PlayerDetailSheet } from "./player-detail-sheet";
import { PlayersGrid } from "./players-grid";
import { PlayersDataTable } from "./players-data-table";
import { columns } from "./columns";
import { positionDotColors } from "./columns";

type Player = {
  id: string;
  name: string;
  number: number;
  position: Position;
  isActive: boolean;
  team: { id: string; name: string };
};

interface Props {
  players: Player[];
}

const POSITIONS = Object.keys(POSITION_LABELS) as Position[];
const VIEW_KEY = "rally:players-view";

export function PlayersView({ players }: Props) {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [selected, setSelected] = useState<Player | null>(null);
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
    return players.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (position !== "all" && p.position !== position) return false;
      if (status === "active" && !p.isActive) return false;
      if (status === "inactive" && p.isActive) return false;
      return true;
    });
  }, [players, search, position, status]);

  const handleSelect = (player: Player) => {
    setSelected(player);
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

        <Select value={position} onValueChange={setPosition}>
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='Posição' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todas as posições</SelectItem>
            {POSITIONS.map((pos) => (
              <SelectItem key={pos} value={pos}>
                <div className='flex items-center gap-2'>
                  <span
                    className={cn(
                      "size-2.5 rounded-full",
                      positionDotColors[pos],
                    )}
                  />
                  {POSITION_LABELS[pos]}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className='w-36'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todos</SelectItem>
            <SelectItem value='active'>Ativos</SelectItem>
            <SelectItem value='inactive'>Inativos</SelectItem>
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
        {filtered.length} atleta{filtered.length === 1 ? "" : "s"}
      </p>

      {view === "grid" ? (
        <PlayersGrid players={filtered} onSelect={handleSelect} />
      ) : (
        <PlayersDataTable columns={columns} data={filtered} />
      )}

      <PlayerDetailSheet
        player={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
