import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayer, getPlayerStats } from "@/actions/players";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayerEditDialog } from "@/components/featured/players/player-edit-dialog";
import { PlayerStatsChart } from "@/components/featured/players/player-stats-chart";
import { POSITION_LABELS } from "@/lib/volleyball";
import { getInitials } from "@/utils/get-initials";

const positionColors: Record<string, string> = {
  SETTER: "bg-purple-600 border-purple-700 text-white",
  OUTSIDE: "bg-blue-600 border-blue-700 text-white",
  OPPOSITE: "bg-orange-600 border-orange-700 text-white",
  MIDDLE: "bg-teal-600 border-teal-700 text-white",
  LIBERO: "bg-yellow-600 border-yellow-700 text-white",
};

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;

  const [playerResult, statsResult] = await Promise.all([
    getPlayer(playerId),
    getPlayerStats(playerId),
  ]);

  if (!playerResult.success || !playerResult.data) {
    notFound();
  }

  const player = playerResult.data;

  return (
    <div className='space-y-6'>
      {/* Back link */}
      <Button variant='ghost' size='sm' asChild className='-ml-2'>
        <Link href='/players'>
          <ArrowLeft className='mr-2 size-4' />
          Atletas
        </Link>
      </Button>

      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <Avatar className='size-16'>
            <AvatarFallback className='text-xl font-bold'>
              {getInitials(player.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className='flex items-center gap-2 flex-wrap'>
              <h1 className='text-2xl font-bold'>{player.name}</h1>
              <span className='text-muted-foreground text-lg'>
                #{player.number}
              </span>
            </div>
            <div className='mt-1 flex items-center gap-2 flex-wrap'>
              <Badge className={positionColors[player.position]}>
                {POSITION_LABELS[player.position]}
              </Badge>
              <span className='text-muted-foreground text-sm'>
                {player.team.name}
              </span>
              {!player.isActive && (
                <Badge variant='secondary'>Inativo</Badge>
              )}
            </div>
          </div>
        </div>

        <PlayerEditDialog player={player} />
      </div>

      {/* Stats */}
      {statsResult.success && statsResult.data ? (
        <PlayerStatsChart stats={statsResult.data} />
      ) : (
        <p className='text-muted-foreground text-sm'>
          Não foi possível carregar as estatísticas.
        </p>
      )}
    </div>
  );
}
