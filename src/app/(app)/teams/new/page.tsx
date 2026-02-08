import { TeamForm } from "@/components/featured/teams/team-form";

export default function NewTeamPage() {
  return (
    <div className='mx-auto max-w-lg space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Novo Time</h1>
        <p className='text-muted-foreground mt-1'>
          Preencha os dados para cadastrar um novo time.
        </p>
      </div>

      <TeamForm />
    </div>
  );
}
