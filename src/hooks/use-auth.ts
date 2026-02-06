"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { signIn, signOut, signUp } from "@/actions/auth";
import type { SignInInput, SignUpInput } from "@/actions/schemas/auth";

export function useAuth() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignIn = async (data: SignInInput) => {
    const result = await signIn(data);
    if (result.success) {
      startTransition(() => {
        router.push("/dashboard");
        router.refresh();
      });
    }
    return result;
  };

  const handleSignUp = async (data: SignUpInput) => {
    const result = await signUp(data);
    if (result.success) {
      startTransition(() => {
        router.push("/dashboard");
        router.refresh();
      });
    }
    return result;
  };

  const handleSignOut = async () => {
    startTransition(() => {
      signOut();
    });
  };

  return {
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    isPending,
  };
}
