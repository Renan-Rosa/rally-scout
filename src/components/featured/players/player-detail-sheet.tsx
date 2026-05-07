"use client";

import { ExternalLink, Loader2, Pencil, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import type { Position } from "@/generated/prisma/enums";
import { usePlayers } from "@/hooks/use-players";
import { POSITION_LABELS } from "@/lib/volleyball";
import { cn } from "@/lib/utils";
import { getInitials } from "@/utils/get-initials";
import { positionColors } from "./columns";
import { PlayerEditForm } from "./player-edit-form";

type Player = {
  id: string;
  name: string;
  number: number;
  position: Position;
  isActive: boolean;
  team: { id: string; name: string };
};

interface Props {
  player: Player | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlayerDetailSheet({ player, open, onOpenChange }: Props) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { deletePlayer, isPending } = usePlayers();

  useEffect(() => {
    if (!open) {
      setMode("view");
      setConfirmDelete(false);
    }
  }, [open]);

  if (!player) return null;

  const handleDelete = async () => {
    const result = await deletePlayer({ id: player.id });
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
            <SheetTitle className='flex items-center gap-2'>
              {mode === "edit" ? "Editar atleta" : "Detalhes do atleta"}
            </SheetTitle>
            <SheetDescription className='sr-only'>
              Informações de {player.name}
            </SheetDescription>
          </SheetHeader>

          <div className='flex-1 overflow-y-auto'>
            {mode === "view" ? (
              <ViewMode player={player} />
            ) : (
              <div className='px-6 py-5'>
                <PlayerEditForm
                  player={player}
                  onSuccess={() => setMode("view")}
                />
              </div>
            )}
          </div>

          {mode === "view" && (
            <div className='flex flex-wrap gap-2 border-t px-6 py-4'>
              <Button
                variant='outline'
                size='sm'
                asChild
                className='flex-1'
              >
                <Link href={`/players/${player.id}`}>
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
            <DialogTitle>Excluir atleta</DialogTitle>
          </DialogHeader>
          <div className='px-6 py-5'>
            <p className='text-sm text-muted-foreground'>
              Tem certeza que deseja excluir{" "}
              <span className='font-medium text-foreground'>{player.name}</span>?
              Esta ação não pode ser desfeita e todas as ações registradas do
              atleta serão perdidas.
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
                "Excluir atleta"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ViewMode({ player }: { player: Player }) {
  return (
    <div className='space-y-6 px-6 py-6'>
      <div className='flex items-center gap-4'>
        <Avatar className='size-16'>
          <AvatarFallback className='text-lg font-bold'>
            {getInitials(player.name)}
          </AvatarFallback>
        </Avatar>
        <div className='min-w-0 flex-1'>
          <div className='flex items-baseline gap-2'>
            <h2 className='truncate text-xl font-bold'>{player.name}</h2>
            <span className='text-base font-semibold text-muted-foreground'>
              #{player.number}
            </span>
          </div>
          <p className='mt-1 text-sm text-muted-foreground'>
            {player.team.name}
          </p>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <InfoTile label='Posição'>
          <Badge className={cn(positionColors[player.position])}>
            {POSITION_LABELS[player.position]}
          </Badge>
        </InfoTile>
        <InfoTile label='Status'>
          {player.isActive ? (
            <Badge className='border-green-700 bg-green-600 text-white'>
              Ativo
            </Badge>
          ) : (
            <Badge variant='secondary'>Inativo</Badge>
          )}
        </InfoTile>
        <InfoTile label='Camisa'>
          <p className='text-2xl font-bold tabular-nums'>#{player.number}</p>
        </InfoTile>
        <InfoTile label='Time'>
          <Link
            href={`/teams/${player.team.id}`}
            className='text-sm font-medium hover:underline'
          >
            {player.team.name}
          </Link>
        </InfoTile>
      </div>

      <div className='rounded-lg border bg-muted/30 px-4 py-3 text-xs text-muted-foreground'>
        Para ver estatísticas detalhadas e histórico de partidas, acesse o{" "}
        <Link
          href={`/players/${player.id}`}
          className='font-medium text-foreground underline'
        >
          perfil completo
        </Link>
        .
      </div>
    </div>
  );
}

function InfoTile({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className='rounded-lg border bg-muted/30 px-4 py-3'>
      <p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground'>
        {label}
      </p>
      <div className='mt-1.5'>{children}</div>
    </div>
  );
}
