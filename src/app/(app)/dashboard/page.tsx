import { getDashboardData } from "@/actions/dashboard";
import { MatchCards } from "@/components/featured/dashboard/match-card";
import { StatsCards } from "@/components/featured/dashboard/stats-card";
import { TopPerformers } from "@/components/featured/dashboard/top-performers";

export default async function DashboardPage() {
  const { stats, nextMatch, lastMatch, topPerformers } =
    await getDashboardData();

  return (
    <div className='space-y-6'>
      <StatsCards stats={stats} />
      <MatchCards nextMatch={nextMatch} lastMatch={lastMatch} />
      <TopPerformers performers={topPerformers} />
    </div>
  );
}
