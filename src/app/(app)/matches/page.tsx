import { Plus } from "lucide-react";
import Link from "next/link";
import { getMatches } from "@/actions/matches";
import { MatchesTable } from "@/components/featured/matches/matches-table";
import { Button } from "@/components/ui/button";

export default async function MatchesPage() {
  const result = await getMatches();

  if (!result.success || !result.data) {
    return (
      <div className='p-4'>
        <p className='text-destructive'>Erro ao carregar partidas.</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Partidas</h1>
          <p className='text-muted-foreground mt-1'>
            Gerencie as partidas dos seus times.
          </p>
        </div>
        <Button asChild>
          <Link href='/matches/new'>
            <Plus className='mr-2 size-4' />
            Nova partida
          </Link>
        </Button>
      </div>

      <MatchesTable matches={result.data} />
    </div>
  );
}
