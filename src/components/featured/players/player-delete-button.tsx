"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { usePlayers } from "@/hooks/use-players";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PlayerDeleteButtonProps {
  playerId: string;
  playerName: string;
}

export function PlayerDeleteButton({
  playerId,
  playerName,
}: PlayerDeleteButtonProps) {
  const { deletePlayer, isPending } = usePlayers();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    await deletePlayer({ id: playerId });
    setOpen(false);
  };

  return (
    <>
      <Button
        variant='ghost'
        size='icon'
        className='text-muted-foreground hover:text-destructive size-8'
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <Trash2 className='size-4' />
        <span className='sr-only'>Excluir</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='flex flex-col gap-0 p-0 overflow-hidden'>
          <DialogHeader className='px-6 py-5 border-b'>
            <DialogTitle>Excluir atleta</DialogTitle>
          </DialogHeader>
          <div className='px-6 py-5'>
            <p className='text-sm text-muted-foreground'>
              Tem certeza que deseja excluir{" "}
              <span className='font-medium text-foreground'>{playerName}</span>?
              Esta ação não pode ser desfeita e todas as ações registradas do
              atleta serão perdidas.
            </p>
          </div>
          <DialogFooter className='px-6 py-4 border-t'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setOpen(false)}
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
