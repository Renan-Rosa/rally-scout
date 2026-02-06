import { getDashboardData } from "@/actions/dashboard";
import { Highlights } from "@/components/featured/dashboard/highlights";
import { MatchCards } from "@/components/featured/dashboard/match-card";
import { StatsCards } from "@/components/featured/dashboard/stats-card";

export default async function DashboardPage() {
  const { stats, nextMatch, lastMatch, highlights } = await getDashboardData();

  return (
    <div className='space-y-6'>
      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Matches */}
      <MatchCards nextMatch={nextMatch} lastMatch={lastMatch} />

      {/* Highlights */}
      {highlights.length > 0 && <Highlights highlights={highlights} />}
    </div>
  );
}
