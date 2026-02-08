"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createPlayer, deletePlayer, updatePlayer } from "@/actions/players";
import type {
  CreatePlayerInput,
  DeletePlayerInput,
  UpdatePlayerInput,
} from "@/actions/schemas/players";

export function usePlayers() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleCreate = async (data: CreatePlayerInput) => {
    const result = await createPlayer(data);
    if (result.success) {
      startTransition(() => {
        router.push("/players");
        router.refresh();
      });
    }
    return result;
  };

  const handleUpdate = async (data: UpdatePlayerInput) => {
    const result = await updatePlayer(data);
    if (result.success) {
      startTransition(() => {
        router.refresh();
      });
    }
    return result;
  };

  const handleDelete = async (data: DeletePlayerInput) => {
    const result = await deletePlayer(data);
    if (result.success) {
      startTransition(() => {
        router.push("/players");
        router.refresh();
      });
    }
    return result;
  };

  return {
    createPlayer: handleCreate,
    updatePlayer: handleUpdate,
    deletePlayer: handleDelete,
    isPending,
  };
}
