"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  type UpdateTeamInput,
  updateTeamSchema,
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
import type { TeamType } from "@/generated/prisma/enums";
import { TeamLogoPicker } from "./team-logo-picker";

interface TeamEditFormProps {
  team: {
    id: string;
    name: string;
    type: TeamType;
    logoUrl?: string | null;
  };
  onSuccess?: () => void;
}

export function TeamEditForm({ team, onSuccess }: TeamEditFormProps) {
  const { updateTeam, isPending } = useTeams();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UpdateTeamInput>({
    resolver: zodResolver(updateTeamSchema),
    defaultValues: {
      id: team.id,
      name: team.name,
      type: team.type,
      logoUrl: team.logoUrl ?? undefined,
    },
  });

  const onSubmit = async (data: UpdateTeamInput) => {
    setError(null);
    const result = await updateTeam(data);
    if (!result.success) {
      setError(result.error ?? "Erro ao atualizar time");
    } else {
      onSuccess?.();
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

        <Field>
          <FieldLabel>Logo do Time</FieldLabel>
          <Controller
            control={form.control}
            name='logoUrl'
            render={({ field }) => (
              <TeamLogoPicker
                value={field.value}
                onChange={field.onChange}
                disabled={isPending}
              />
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
