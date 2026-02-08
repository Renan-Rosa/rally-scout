import { getTeams } from "@/actions/teams";
import { PlayerForm } from "@/components/featured/players/player-form";

export default async function NewPlayerPage() {
  const result = await getTeams();

  return (
    <div className='mx-auto max-w-lg space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Novo Atleta</h1>
        <p className='text-muted-foreground mt-1'>
          Preencha os dados para cadastrar um novo atleta.
        </p>
      </div>

      <PlayerForm teams={result.data ?? []} />
    </div>
  );
}
