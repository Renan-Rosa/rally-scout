"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  type CreateMatchInput,
  createMatchSchema,
} from "@/actions/schemas/matches";
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
import { useMatches } from "@/hooks/use-matches";

interface MatchFormProps {
  teams: { id: string; name: string }[];
}

export function MatchForm({ teams }: MatchFormProps) {
  const { createMatch, isPending } = useMatches();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateMatchInput>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: {
      opponent: "",
      location: "",
      date: undefined,
      teamId: "",
    },
  });

  const onSubmit = async (data: CreateMatchInput) => {
    setError(null);
    const result = await createMatch(data);
    if (!result.success) {
      setError(result.error ?? "Erro ao criar partida");
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
          <FieldLabel htmlFor='opponent'>Adversário</FieldLabel>
          <Input
            id='opponent'
            placeholder='Ex: Vôlei Clube'
            disabled={isPending}
            {...form.register("opponent")}
          />
          {form.formState.errors.opponent && (
            <FieldError>{form.formState.errors.opponent.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor='location'>Local</FieldLabel>
          <Input
            id='location'
            placeholder='Ex: Ginásio Municipal'
            disabled={isPending}
            {...form.register("location")}
          />
          {form.formState.errors.location && (
            <FieldError>{form.formState.errors.location.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor='date'>Data e Hora</FieldLabel>
          <Input
            id='date'
            type='datetime-local'
            disabled={isPending}
            {...form.register("date")}
          />
          {form.formState.errors.date && (
            <FieldError>{form.formState.errors.date.message}</FieldError>
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
