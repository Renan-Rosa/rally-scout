"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  type CreatePlayerInput,
  createPlayerSchema,
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

interface PlayerFormProps {
  teams: { id: string; name: string }[];
}

export function PlayerForm({ teams }: PlayerFormProps) {
  const { createPlayer, isPending } = usePlayers();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreatePlayerInput>({
    resolver: zodResolver(createPlayerSchema),
    defaultValues: {
      name: "",
      number: undefined,
      position: undefined,
      teamId: "",
    },
  });

  const onSubmit = async (data: CreatePlayerInput) => {
    setError(null);
    const result = await createPlayer(data);
    if (!result.success) {
      setError(result.error ?? "Erro ao criar atleta");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
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
          <FieldLabel>Time</FieldLabel>
          <Controller
            control={form.control}
            name='teamId'
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isPending}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Selecione o time' />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.teamId && (
            <FieldError>{form.formState.errors.teamId.message}</FieldError>
          )}
          <Button variant='link' className='h-auto p-0' asChild>
            <Link href='/teams/new'>Precisa criar um time?</Link>
          </Button>
        </Field>

        <Button type='submit' className='w-full' disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className='mr-2 size-4 animate-spin' />
              Salvando...
            </>
          ) : (
            "Salvar"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
