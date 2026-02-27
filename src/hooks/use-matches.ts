"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createMatch, deleteMatch } from "@/actions/matches";
import type {
  CreateMatchInput,
  DeleteMatchInput,
} from "@/actions/schemas/matches";

export function useMatches() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleCreate = async (data: CreateMatchInput) => {
    const result = await createMatch(data);
    if (result.success) {
      startTransition(() => {
        router.push("/matches");
        router.refresh();
      });
    }
    return result;
  };

  const handleDelete = async (data: DeleteMatchInput) => {
    const result = await deleteMatch(data);
    if (result.success) {
      startTransition(() => {
        router.refresh();
      });
    }
    return result;
  };

  const handleStart = (id: string) => {
    startTransition(() => {
      router.push(`/scout/${id}`);
    });
  };

  return {
    createMatch: handleCreate,
    deleteMatch: handleDelete,
    startMatch: handleStart,
    isPending,
  };
}
