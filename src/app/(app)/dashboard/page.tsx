import { Plus } from "lucide-react";
import Link from "next/link";
import { getDashboardData } from "@/actions/dashboard";
import { MatchCards } from "@/components/featured/dashboard/match-card";
import { RecentMatches } from "@/components/featured/dashboard/recent-matches";
import { StatsCards } from "@/components/featured/dashboard/stats-card";
import { TopPerformers } from "@/components/featured/dashboard/top-performers";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireAuth();
  const { stats, lastMatch, upcomingMatch, recentMatches, topPerformers } =
    await getDashboardData();

  const firstName = user.name.split(" ")[0];
  const greeting = getGreeting();

  return (
    <div className='space-y-6'>
      <header className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            {greeting}, {firstName}
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Visão geral dos seus times e atletas.
          </p>
        </div>
        <Button asChild size='sm'>
          <Link href='/matches/new'>
            <Plus className='mr-2 size-4' />
            Nova partida
          </Link>
        </Button>
      </header>

      <StatsCards stats={stats} />
      <MatchCards lastMatch={lastMatch} upcomingMatch={upcomingMatch} />

      <div className='grid gap-4 lg:grid-cols-2'>
        <TopPerformers performers={topPerformers} />
        <RecentMatches matches={recentMatches} />
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "Boa madrugada";
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}
