"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { TeamType } from "@/generated/prisma/enums";
import { TeamEditForm } from "./team-edit-form";

interface TeamEditDialogProps {
  team: {
    id: string;
    name: string;
    type: TeamType;
    logoUrl?: string | null;
  };
}

export function TeamEditDialog({ team }: TeamEditDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <Pencil className='mr-2 size-4' />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className='flex flex-col gap-0 p-0 overflow-hidden max-w-sm'>
        <DialogHeader className='px-6 py-5 border-b'>
          <DialogTitle>Editar time</DialogTitle>
          <DialogDescription>{team.name}</DialogDescription>
        </DialogHeader>
        <div className='px-6 py-5'>
          <TeamEditForm team={team} onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
