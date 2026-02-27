"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Position } from "@/generated/prisma/enums";
import { PlayerEditForm } from "./player-edit-form";

interface PlayerEditDialogProps {
  player: {
    id: string;
    name: string;
    number: number;
    position: Position;
    isActive: boolean;
  };
}

export function PlayerEditDialog({ player }: PlayerEditDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <Pencil className='mr-2 size-4' />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className='flex flex-col gap-0 p-0 overflow-hidden'>
        <DialogHeader className='px-6 py-5 border-b'>
          <DialogTitle>Editar atleta</DialogTitle>
        </DialogHeader>
        <div className='px-6 py-5'>
          <PlayerEditForm player={player} onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
