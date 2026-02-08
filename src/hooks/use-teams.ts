"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type {
  CreateTeamInput,
  DeleteTeamInput,
  UpdateTeamInput,
} from "@/actions/schemas/teams";
import { createTeam, deleteTeam, updateTeam } from "@/actions/teams";

export function useTeams() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleCreate = async (data: CreateTeamInput) => {
    const result = await createTeam(data);
    if (result.success) {
      startTransition(() => {
        router.push("/teams");
        router.refresh();
      });
    }
    return result;
  };

  const handleUpdate = async (data: UpdateTeamInput) => {
    const result = await updateTeam(data);
    if (result.success) {
      startTransition(() => {
        router.refresh();
      });
    }
    return result;
  };

  const handleDelete = async (data: DeleteTeamInput) => {
    const result = await deleteTeam(data);
    if (result.success) {
      startTransition(() => {
        router.push("/teams");
        router.refresh();
      });
    }
    return result;
  };

  return {
    createTeam: handleCreate,
    updateTeam: handleUpdate,
    deleteTeam: handleDelete,
    isPending,
  };
}
