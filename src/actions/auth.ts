"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { removeAuthCookie, setAuthCookie, signToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  type SignInInput,
  type SignUpInput,
  signInSchema,
  signUpSchema,
} from "./schemas/auth";

export type ActionResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ══════════════════════════════════════════════════════════════
// SIGN IN
// ══════════════════════════════════════════════════════════════
export async function signIn(input: SignInInput): Promise<ActionResponse> {
  // Validação
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;

  // Busca user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return { success: false, error: "Credenciais inválidas" };
  }

  // Verifica senha
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return { success: false, error: "Credenciais inválidas" };
  }

  // Gera token e seta cookie
  const token = await signToken({ userId: user.id, email: user.email });
  await setAuthCookie(token);

  return { success: true };
}

// ══════════════════════════════════════════════════════════════
// SIGN UP
// ══════════════════════════════════════════════════════════════
export async function signUp(input: SignUpInput): Promise<ActionResponse> {
  // Validação
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;

  // Verifica se email já existe
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return { success: false, error: "Email já cadastrado" };
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(password, 12);

  // Cria user
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    },
  });

  // Gera token e seta cookie (já loga após cadastro)
  const token = await signToken({ userId: user.id, email: user.email });
  await setAuthCookie(token);

  return { success: true };
}

// ══════════════════════════════════════════════════════════════
// SIGN OUT
// ══════════════════════════════════════════════════════════════
export async function signOut() {
  await removeAuthCookie();
  redirect("/sign-in");
}
