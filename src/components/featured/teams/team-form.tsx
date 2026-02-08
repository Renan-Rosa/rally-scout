"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  type CreateTeamInput,
  createTeamSchema,
} from "@/actions/schemas/teams";
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
import { useTeams } from "@/hooks/use-teams";
import { TEAM_TYPE_LABELS } from "@/lib/volleyball";

export function TeamForm() {
  const { createTeam, isPending } = useTeams();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateTeamInput>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      type: undefined,
    },
  });

  const onSubmit = async (data: CreateTeamInput) => {
    setError(null);
    const result = await createTeam(data);
    if (!result.success) {
      setError(result.error ?? "Erro ao criar time");
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
          <FieldLabel htmlFor='name'>Nome do Time</FieldLabel>
          <Input
            id='name'
            placeholder='Ex: Vôlei Clube'
            disabled={isPending}
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <FieldError>{form.formState.errors.name.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel>Categoria</FieldLabel>
          <Controller
            control={form.control}
            name='type'
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isPending}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Selecione a categoria' />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TEAM_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.type && (
            <FieldError>{form.formState.errors.type.message}</FieldError>
          )}
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
