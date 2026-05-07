import { Activity, Plus, Trophy, Users, UsersRound } from "lucide-react";
import Link from "next/link";
import { getTeams } from "@/actions/teams";
import { TeamsView } from "@/components/featured/teams/teams-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function TeamsPage() {
  const result = await getTeams();

  if (!result.success || !result.data) {
    return (
      <div className='p-4'>
        <p className='text-destructive'>Erro ao carregar times.</p>
      </div>
    );
  }

  const teams = result.data;
  const totalTeams = teams.length;
  const totalPlayers = teams.reduce((sum, t) => sum + t._count.players, 0);
  const totalMatches = teams.reduce((sum, t) => sum + t._count.matches, 0);
  const avgPlayers =
    totalTeams > 0 ? Math.round(totalPlayers / totalTeams) : 0;

  const kpis = [
    {
      label: "Times",
      value: totalTeams,
      icon: UsersRound,
      iconClass: "bg-blue-500/10 text-blue-500",
    },
    {
      label: "Atletas no total",
      value: totalPlayers,
      icon: Users,
      iconClass: "bg-purple-500/10 text-purple-500",
    },
    {
      label: "Partidas no total",
      value: totalMatches,
      icon: Activity,
      iconClass: "bg-orange-500/10 text-orange-500",
    },
    {
      label: "Média de atletas/time",
      value: avgPlayers,
      icon: Trophy,
      iconClass: "bg-green-500/10 text-green-500",
    },
  ];

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Times</h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Gerencie os seus times cadastrados.
          </p>
        </div>
        <Button asChild>
          <Link href='/teams/new'>
            <Plus className='mr-2 size-4' />
            Adicionar time
          </Link>
        </Button>
      </div>

      {totalTeams > 0 && (
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {kpis.map(({ label, value, icon: Icon, iconClass }) => (
            <Card key={label} className='gap-0 py-0'>
              <CardContent className='flex items-center gap-3 p-4'>
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-md",
                    iconClass,
                  )}
                >
                  <Icon className='size-4' />
                </span>
                <div className='min-w-0'>
                  <p className='text-xs text-muted-foreground'>{label}</p>
                  <p className='text-xl font-bold tabular-nums'>{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TeamsView teams={teams} />
    </div>
  );
}
