import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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

export function StatsCards({ stats }: StatsCardsProps) {
  const isPositiveRate = stats.winRate >= 50;

  const cards = [
    {
      label: "Times",
      value: stats.teams,
      trend: null,
      description: "Times cadastrados",
    },
    {
      label: "Jogadores",
      value: stats.players,
      trend: null,
      description: "Jogadores ativos",
    },
    {
      label: "Partidas",
      value: stats.matches,
      trend: null,
      description: "Total de partidas",
    },
    {
      label: "Vitórias/Derrotas",
      value: `${stats.wins}/${stats.losses}`,
      trend:
        stats.wins + stats.losses > 0
          ? { value: stats.winRate, positive: isPositiveRate }
          : null,
      description: isPositiveRate ? "Bom aproveitamento" : "Precisa melhorar",
    },
  ];

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className='p-4'>
            {/* Header */}
            <div className='flex items-center justify-between'>
              <p className='text-sm text-muted-foreground'>{card.label}</p>
              {card.trend && (
                <div
                  className={`flex items-center gap-1 rounded-full border px-2 py-0.5 ${
                    card.trend.positive
                      ? "border-green-500/20 bg-green-500/10 text-green-500"
                      : "border-red-500/20 bg-red-500/10 text-red-500"
                  }`}
                >
                  {card.trend.positive ? (
                    <TrendingUp className='size-3' />
                  ) : (
                    <TrendingDown className='size-3' />
                  )}
                  <span className='text-xs font-medium'>
                    {card.trend.value}%
                  </span>
                </div>
              )}
            </div>

            {/* Value */}
            <p className='mt-2 text-3xl font-bold'>{card.value}</p>

            {/* Footer */}
            <p className='mt-2 text-sm text-muted-foreground'>
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
