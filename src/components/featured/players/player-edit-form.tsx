"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  type UpdatePlayerInput,
  updatePlayerSchema,
} from "@/actions/schemas/players";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlayers } from "@/hooks/use-players";
import { POSITION_LABELS } from "@/lib/volleyball";
import type { Position } from "@/generated/prisma/enums";

interface PlayerEditFormProps {
  player: {
    id: string;
    name: string;
    number: number;
    position: Position;
    isActive: boolean;
  };
  onSuccess?: () => void;
}

export function PlayerEditForm({ player, onSuccess }: PlayerEditFormProps) {
  const { updatePlayer, isPending } = usePlayers();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UpdatePlayerInput>({
    resolver: zodResolver(updatePlayerSchema),
    defaultValues: {
      id: player.id,
      name: player.name,
      number: player.number,
      position: player.position,
      isActive: player.isActive,
    },
  });

  const onSubmit = async (data: UpdatePlayerInput) => {
    setError(null);
    const result = await updatePlayer(data);
    if (!result.success) {
      setError(result.error ?? "Erro ao atualizar atleta");
    } else {
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className='gap-4'>
        {error && (
          <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
            {error}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor='name'>Nome do Atleta</FieldLabel>
          <Input
            id='name'
            placeholder='Ex: João Silva'
            disabled={isPending}
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <FieldError>{form.formState.errors.name.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor='number'>Número da Camisa</FieldLabel>
          <Input
            id='number'
            type='number'
            placeholder='Ex: 10'
            disabled={isPending}
            {...form.register("number", { valueAsNumber: true })}
          />
          {form.formState.errors.number && (
            <FieldError>{form.formState.errors.number.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel>Posição</FieldLabel>
          <Controller
            control={form.control}
            name='position'
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isPending}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Selecione a posição' />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(POSITION_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.position && (
            <FieldError>{form.formState.errors.position.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel>Status</FieldLabel>
          <Controller
            control={form.control}
            name='isActive'
            render={({ field }) => (
              <Select
                value={field.value ? "true" : "false"}
                onValueChange={(v) => field.onChange(v === "true")}
                disabled={isPending}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='true'>Ativo</SelectItem>
                  <SelectItem value='false'>Inativo</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Button type='submit' className='w-full' disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className='mr-2 size-4 animate-spin' />
              Salvando...
            </>
          ) : (
            "Salvar alterações"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
