"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  cancelMatch,
  createMatch,
  deleteMatch,
  startMatch,
  updateMatch,
} from "@/actions/matches";
import type {
  CreateMatchInput,
  DeleteMatchInput,
  UpdateMatchInput,
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

  const handleUpdate = async (data: UpdateMatchInput) => {
    const result = await updateMatch(data);
    if (result.success) {
      startTransition(() => {
        router.refresh();
      });
    }
    return result;
  };

  const handleDelete = async (data: DeleteMatchInput) => {
    const result = await deleteMatch(data);
    if (result.success) {
      startTransition(() => {
        router.push("/matches");
        router.refresh();
      });
    }
    return result;
  };

  const handleStart = async (id: string) => {
    const result = await startMatch(id);
    if (result.success) {
      startTransition(() => {
        router.push(`/scout/${id}`);
        router.refresh();
      });
    }
    return result;
  };

  const handleCancel = async (id: string) => {
    const result = await cancelMatch(id);
    if (result.success) {
      startTransition(() => {
        router.refresh();
      });
    }
    return result;
  };

  return {
    createMatch: handleCreate,
    updateMatch: handleUpdate,
    deleteMatch: handleDelete,
    startMatch: handleStart,
    cancelMatch: handleCancel,
    isPending,
  };
}
