import { Plus } from "lucide-react";
import Link from "next/link";
import { getPlayers } from "@/actions/players";
import { PlayersTable } from "@/components/featured/players/players-table";
import { Button } from "@/components/ui/button";

export default async function PlayersPage() {
  const result = await getPlayers();

  if (!result.success || !result.data) {
    return (
      <div className='p-4'>
        <p className='text-destructive'>Erro ao carregar atletas.</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Atletas</h1>
          <p className='text-muted-foreground mt-1'>
            Gerencie os atletas dos seus times.
          </p>
        </div>
        <Button asChild>
          <Link href='/players/new'>
            <Plus className='mr-2 size-4' />
            Adicionar atleta
          </Link>
        </Button>
      </div>

      <PlayersTable players={result.data} />
    </div>
  );
}
