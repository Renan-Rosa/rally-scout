import { getTeams } from "@/actions/teams";
import { MatchForm } from "@/components/featured/matches/match-form";

export default async function NewMatchPage() {
  const result = await getTeams();

  return (
    <div className='mx-auto max-w-lg space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Nova Partida</h1>
        <p className='text-muted-foreground mt-1'>
          Preencha os dados para cadastrar uma nova partida.
        </p>
      </div>

      <MatchForm teams={result.data ?? []} />
    </div>
  );
}
