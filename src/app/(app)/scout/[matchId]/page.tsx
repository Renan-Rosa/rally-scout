export default async function ScoutPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;

  return <div>{matchId}</div>;
}
