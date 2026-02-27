"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTeams } from "@/hooks/use-teams";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TeamDeleteButtonProps {
  teamId: string;
  teamName: string;
}

export function TeamDeleteButton({ teamId, teamName }: TeamDeleteButtonProps) {
  const { deleteTeam, isPending } = useTeams();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    await deleteTeam({ id: teamId });
    setOpen(false);
  };

  return (
    <>
      <Button
        variant='outline'
        size='sm'
        className='text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30'
        onClick={() => setOpen(true)}
      >
        <Trash2 className='mr-2 size-4' />
        Excluir
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='flex flex-col gap-0 p-0 overflow-hidden'>
          <DialogHeader className='px-6 py-5 border-b'>
            <DialogTitle>Excluir time</DialogTitle>
          </DialogHeader>
          <div className='px-6 py-5'>
            <p className='text-sm text-muted-foreground'>
              Tem certeza que deseja excluir{" "}
              <span className='font-medium text-foreground'>{teamName}</span>?
              Esta ação não pode ser desfeita e todos os atletas e partidas do
              time serão perdidos.
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
                "Excluir time"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
