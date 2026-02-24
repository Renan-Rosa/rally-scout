import { notFound } from "next/navigation";
import { getMatch } from "@/actions/matches";
import type { TimelineAction } from "@/components/featured/scout/action-timeline";
import {
  type AnalyticsAction,
  AnalyticsSection,
} from "@/components/featured/scout/analytics-section";
import {
  type LineupSlotData,
  VolleyballCourt,
} from "@/components/featured/scout/volleyball-court";

export default async function ScoutPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;

  const result = await getMatch(matchId);

  if (!result.success || !result.data) {
    notFound();
  }

  const match = result.data;

  const initialLineup: LineupSlotData[] = match.lineup.map((entry) => ({
    slot: entry.slot,
    player: {
      id: entry.player.id,
      name: entry.player.name,
      number: entry.player.number,
      position: entry.player.position,
    },
  }));

  // Todas as ações — newest-first (DESC). Timeline exibe nessa ordem.
  const initialActions: TimelineAction[] = match.actions
    .filter((a) => a.player !== null)
    .map((a) => ({
      id: a.id,
      set: a.set,
      player: a.player
        ? { name: a.player.name, number: a.player.number }
        : null,
      type: a.type,
      result: a.result,
      isOpponentPoint: a.isOpponentPoint,
    }));

  // Analytics recebe todas as ações (com isOpponentPoint)
  const analyticsActions: AnalyticsAction[] = match.actions.map((a) => ({
    type: a.type,
    result: a.result,
    set: a.set,
    isOpponentPoint: a.isOpponentPoint,
    player: a.player
      ? {
          name: a.player.name,
          number: a.player.number,
          position: a.player.position,
        }
      : null,
  }));

  // Header h-14 (56px) + main p-4 (32px top+bottom) = 88px | lg:p-6 (48px) = 104px
  return (
    <div className='flex flex-col gap-3 max-w-5xl mx-auto min-h-full'>
      {/* ── Scout: ocupa exatamente um viewport ── */}
      <section className='h-[calc(100dvh-88px)] lg:h-[calc(100dvh-104px)] shrink-0 flex flex-col gap-3'>
        <div className='shrink-0'>
          <h1 className='text-lg font-bold leading-tight'>
            {match.team.name} vs {match.opponent}
          </h1>
          <p className='text-muted-foreground text-xs'>
            Scout ao vivo · Set {match.currentSet}
          </p>
        </div>

        <VolleyballCourt
          matchId={matchId}
          teamName={match.team.name}
          opponent={match.opponent}
          players={match.team.players}
          initialLineup={initialLineup}
          initialCurrentSet={match.currentSet}
          initialScoreHome={match.scoreHome}
          initialScoreAway={match.scoreAway}
          initialSetsHome={match.setsHome}
          initialSetsAway={match.setsAway}
          initialActions={initialActions}
        />
      </section>

      {/* ── Analytics: scroll para baixo ── */}
      <AnalyticsSection
        actions={analyticsActions}
        setsHistory={match.setsHome.map((h, i) => ({
          home: h,
          away: match.setsAway[i] ?? 0,
        }))}
        currentSet={match.currentSet}
        teamName={match.team.name}
        opponent={match.opponent}
        lineupPlayers={match.lineup.map((e) => ({
          name: e.player.name,
          number: e.player.number,
          position: e.player.position,
        }))}
      />
    </div>
  );
}
