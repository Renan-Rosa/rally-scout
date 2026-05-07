"use client";

import { Activity, ExternalLink, Loader2, Pencil, Trash2, Users, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { TeamType } from "@/generated/prisma/enums";
import { useTeams } from "@/hooks/use-teams";
import { TEAM_TYPE_LABELS } from "@/lib/volleyball";
import { getInitials } from "@/utils/get-initials";
import { TeamEditForm } from "./team-edit-form";

type Team = {
  id: string;
  name: string;
  type: TeamType;
  logoUrl: string | null;
  _count: { players: number; matches: number };
};

interface Props {
  team: Team | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeamDetailSheet({ team, open, onOpenChange }: Props) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { deleteTeam, isPending } = useTeams();

  useEffect(() => {
    if (!open) {
      setMode("view");
      setConfirmDelete(false);
    }
  }, [open]);

  if (!team) return null;

  const handleDelete = async () => {
    const result = await deleteTeam({ id: team.id });
    if (result.success) {
      setConfirmDelete(false);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className='flex w-full flex-col gap-0 p-0 sm:max-w-md'>
          <SheetHeader className='border-b px-6 py-4'>
            <SheetTitle>
              {mode === "edit" ? "Editar time" : "Detalhes do time"}
            </SheetTitle>
            <SheetDescription className='sr-only'>
              Informações de {team.name}
            </SheetDescription>
          </SheetHeader>

          <div className='flex-1 overflow-y-auto'>
            {mode === "view" ? (
              <ViewMode team={team} />
            ) : (
              <div className='px-6 py-5'>
                <TeamEditForm team={team} onSuccess={() => setMode("view")} />
              </div>
            )}
          </div>

          {mode === "view" && (
            <div className='flex flex-wrap gap-2 border-t px-6 py-4'>
              <Button variant='outline' size='sm' asChild className='flex-1'>
                <Link href={`/teams/${team.id}`}>
                  <ExternalLink className='mr-2 size-4' />
                  Ver perfil
                </Link>
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setMode("edit")}
                className='flex-1'
              >
                <Pencil className='mr-2 size-4' />
                Editar
              </Button>
              <Button
                variant='outline'
                size='icon'
                className='size-9 text-muted-foreground hover:text-destructive'
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className='size-4' />
                <span className='sr-only'>Excluir</span>
              </Button>
            </div>
          )}

          {mode === "edit" && (
            <div className='border-t px-6 py-3'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setMode("view")}
                className='w-full'
              >
                <X className='mr-2 size-4' />
                Cancelar edição
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className='flex flex-col gap-0 overflow-hidden p-0'>
          <DialogHeader className='border-b px-6 py-5'>
            <DialogTitle>Excluir time</DialogTitle>
          </DialogHeader>
          <div className='px-6 py-5'>
            <p className='text-sm text-muted-foreground'>
              Tem certeza que deseja excluir{" "}
              <span className='font-medium text-foreground'>{team.name}</span>?
              Todos os atletas e partidas relacionadas serão removidos. Esta
              ação não pode ser desfeita.
            </p>
          </div>
          <DialogFooter className='border-t px-6 py-4'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setConfirmDelete(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              variant='destructive'
              size='sm'
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className='mr-2 size-4 animate-spin' />
                  Excluindo...
                </>
              ) : (
                "Excluir time"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ViewMode({ team }: { team: Team }) {
  return (
    <div className='space-y-6 px-6 py-6'>
      <div className='flex items-center gap-4'>
        <Avatar className='size-16'>
          {team.logoUrl && <AvatarImage src={team.logoUrl} alt={team.name} />}
          <AvatarFallback className='text-lg font-bold'>
            {getInitials(team.name)}
          </AvatarFallback>
        </Avatar>
        <div className='min-w-0 flex-1'>
          <h2 className='truncate text-xl font-bold'>{team.name}</h2>
          <Badge variant='outline' className='mt-1'>
            {TEAM_TYPE_LABELS[team.type]}
          </Badge>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <StatTile
          icon={<Users className='size-4 text-blue-500' />}
          label='Atletas'
          value={team._count.players}
        />
        <StatTile
          icon={<Activity className='size-4 text-orange-500' />}
          label='Partidas'
          value={team._count.matches}
        />
      </div>

      <div className='rounded-lg border bg-muted/30 px-4 py-3 text-xs text-muted-foreground'>
        Para ver elenco completo, estatísticas e histórico, acesse o{" "}
        <Link
          href={`/teams/${team.id}`}
          className='font-medium text-foreground underline'
        >
          perfil completo
        </Link>
        .
      </div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className='rounded-lg border bg-muted/30 px-4 py-3'>
      <div className='flex items-center gap-2'>
        {icon}
        <p className='text-xs text-muted-foreground'>{label}</p>
      </div>
      <p className='mt-2 text-2xl font-bold tabular-nums'>{value}</p>
    </div>
  );
}
