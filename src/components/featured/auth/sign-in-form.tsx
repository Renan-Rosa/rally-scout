"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link"; // Use o Link do Next.js para navegação interna
import { useTheme } from "next-themes";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { type SignInInput, signInSchema } from "@/actions/schemas/auth";
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

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn, isPending } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInInput) => {
    setError(null);
    const result = await signIn(data);
    if (!result.success) {
      setError(result.error ?? "Erro ao fazer login");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className='flex flex-col items-center gap-2 text-center'>
            {/* CORRIGIDO: Tag <a> aberta corretamente */}
            <Image src="/logo_orange.svg" alt='Rally' width={150} height={150} />

            <h1 className='text-xl font-bold'>Bem vindo ao Rally</h1>
            <FieldDescription>
              Não tem conta ainda?{" "}
              <Link href='/sign-up' className='underline underline-offset-4'>
                Crie sua conta
              </Link>
            </FieldDescription>
          </div>

          {error && (
            <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
              {error}
            </div>
          )}

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
              placeholder='Digite sua senha'
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
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </FieldGroup>
      </form>

      {/* CORRIGIDO: Texto limpo e sem semicolons perdidos */}
      <p className='px-6 text-center text-xs text-muted-foreground'>
        Ao acessar, você está concordando com os nossos{" "}
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
