import {
  Activity,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatsCardsProps = {
  stats: {
    teams: number;
    players: number;
    matches: number;
    wins: number;
    losses: number;
    winRate: number;
  };
};

type StatCard = {
  label: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  iconClass: string;
  trend?: { value: number; positive: boolean };
};

export function StatsCards({ stats }: StatsCardsProps) {
  const totalGames = stats.wins + stats.losses;
  const isPositiveRate = stats.winRate >= 50;

  const cards: StatCard[] = [
    {
      label: "Times",
      value: stats.teams,
      description: "Times cadastrados",
      icon: UsersRound,
      iconClass: "text-blue-500 bg-blue-500/10",
    },
    {
      label: "Atletas",
      value: stats.players,
      description: "Atletas ativos",
      icon: Users,
      iconClass: "text-purple-500 bg-purple-500/10",
    },
    {
      label: "Partidas",
      value: stats.matches,
      description: `${totalGames} finalizadas`,
      icon: Activity,
      iconClass: "text-orange-500 bg-orange-500/10",
    },
    {
      label: "Aproveitamento",
      value: totalGames > 0 ? `${stats.winRate}%` : "—",
      description:
        totalGames > 0
          ? `${stats.wins}V · ${stats.losses}D`
          : "Sem partidas finalizadas",
      icon: Trophy,
      iconClass: isPositiveRate
        ? "text-green-500 bg-green-500/10"
        : "text-red-500 bg-red-500/10",
      trend:
        totalGames > 0
          ? { value: stats.winRate, positive: isPositiveRate }
          : undefined,
    },
  ];

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.label}
            className='relative gap-0 overflow-hidden py-0 transition-colors hover:border-foreground/20'
          >
            <CardContent className='p-5'>
              <div className='flex items-start justify-between'>
                <div className={cn("rounded-lg p-2", card.iconClass)}>
                  <Icon className='size-4' />
                </div>
                {card.trend && (
                  <div
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                      card.trend.positive
                        ? "bg-green-500/10 text-green-500"
                        : "bg-red-500/10 text-red-500",
                    )}
                  >
                    {card.trend.positive ? (
                      <TrendingUp className='size-3' />
                    ) : (
                      <TrendingDown className='size-3' />
                    )}
                    {card.trend.value}%
                  </div>
                )}
              </div>
              <div className='mt-4'>
                <p className='text-3xl font-bold tracking-tight tabular-nums'>
                  {card.value}
                </p>
                <p className='mt-1 text-sm font-medium'>{card.label}</p>
                <p className='text-xs text-muted-foreground'>
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
