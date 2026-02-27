import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeam, getTeamStats } from "@/actions/teams";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TeamDeleteButton } from "@/components/featured/teams/team-delete-button";
import { TeamEditDialog } from "@/components/featured/teams/team-edit-dialog";
import { TeamPlayersList } from "@/components/featured/teams/team-players-list";
import { TeamStatsView } from "@/components/featured/teams/team-stats";
import { TEAM_TYPE_LABELS } from "@/lib/volleyball";
import { getInitials } from "@/utils/get-initials";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [teamResult, statsResult] = await Promise.all([
    getTeam(id),
    getTeamStats(id),
  ]);

  if (!teamResult.success || !teamResult.data) {
    notFound();
  }

  const team = teamResult.data;
  const activePlayers = team.players.filter((p) => p.isActive);

  return (
    <div className='space-y-8'>
      {/* Back link */}
      <Button variant='ghost' size='sm' asChild className='-ml-2'>
        <Link href='/teams'>
          <ArrowLeft className='mr-2 size-4' />
          Times
        </Link>
      </Button>

      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <Avatar className='size-16'>
            {team.logoUrl && (
              <AvatarImage src={team.logoUrl} alt={team.name} />
            )}
            <AvatarFallback className='text-xl font-bold'>
              {getInitials(team.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className='text-2xl font-bold'>{team.name}</h1>
            <div className='mt-1 flex items-center gap-2 flex-wrap'>
              <Badge variant='outline'>{TEAM_TYPE_LABELS[team.type]}</Badge>
              <span className='text-muted-foreground text-sm'>
                {activePlayers.length} atleta
                {activePlayers.length !== 1 ? "s" : ""} ativo
                {activePlayers.length !== 1 ? "s" : ""}
              </span>
              <span className='text-muted-foreground text-sm'>
                · {team._count.matches} partida
                {team._count.matches !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <TeamDeleteButton teamId={team.id} teamName={team.name} />
          <TeamEditDialog team={team} />
        </div>
      </div>

      {/* Players */}
      <section className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>
            Atletas ({team.players.length})
          </h2>
          <Button asChild size='sm'>
            <Link href='/players/new'>
              <Plus className='mr-2 size-4' />
              Adicionar atleta
            </Link>
          </Button>
        </div>
        <TeamPlayersList players={team.players} />
      </section>

      {/* Stats */}
      <section className='space-y-4'>
        <h2 className='text-lg font-semibold'>Estatísticas</h2>
        {statsResult.success && statsResult.data ? (
          <TeamStatsView stats={statsResult.data} />
        ) : (
          <p className='text-muted-foreground text-sm'>
            Não foi possível carregar as estatísticas.
          </p>
        )}
      </section>
    </div>
  );
}
