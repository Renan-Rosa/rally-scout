"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { type SignUpInput, signUpSchema } from "@/actions/schemas/auth";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signUp, isPending } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignUpInput) => {
    setError(null);
    const result = await signUp(data);
    if (!result.success) {
      setError(result.error ?? "Erro ao criar conta");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className='flex flex-col items-center gap-2 text-center'>
            <h1 className='text-xl font-bold'>Crie sua conta no Rally</h1>
            <FieldDescription>
              Já tem conta?{" "}
              <Link href='/sign-in' className='underline underline-offset-4'>
                Faça login
              </Link>
            </FieldDescription>
          </div>

          {error && (
            <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
              {error}
            </div>
          )}

          <Field>
            <FieldLabel htmlFor='name'>Nome</FieldLabel>
            <Input
              id='name'
              type='text'
              placeholder='Seu nome completo'
              disabled={isPending}
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <FieldError>{form.formState.errors.name.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor='email'>Email</FieldLabel>
            <Input
              id='email'
              type='email'
              placeholder='seu@email.com'
              disabled={isPending}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <FieldError>{form.formState.errors.email.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor='password'>Senha</FieldLabel>
            <Input
              id='password'
              type='password'
              placeholder='Mínimo 6 caracteres'
              disabled={isPending}
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <FieldError>{form.formState.errors.password.message}</FieldError>
            )}
          </Field>

          <Button type='submit' className='w-full' disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className='mr-2 size-4 animate-spin' />
                Criando conta...
              </>
            ) : (
              "Criar conta"
            )}
          </Button>
        </FieldGroup>
      </form>

      <p className='px-6 text-center text-xs text-muted-foreground'>
        Ao criar sua conta, você está concordando com os nossos{" "}
        <Link href='/terms' className='underline underline-offset-4'>
          Termos de serviço
        </Link>{" "}
        e{" "}
        <Link href='/privacy' className='underline underline-offset-4'>
          Políticas de Privacidade
        </Link>
        .
      </p>
    </div>
  );
}
