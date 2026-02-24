import { Radio } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getLiveMatch } from "@/actions/matches";
import { Header } from "@/components/shared/header";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const liveMatchResult = await getLiveMatch();
  const liveMatch = liveMatchResult.success ? liveMatchResult.data : null;

  return (
    <div className='h-dvh flex flex-col'>
      <Header user={user} />
      <main className='flex-1 min-h-0 overflow-auto p-4 lg:p-6'>{children}</main>

      {liveMatch && (
        <Link
          href={`/scout/${liveMatch.id}`}
          className='fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-red-700 transition-colors'
        >
          <Radio className='size-4 animate-pulse' />
          LIVE — {liveMatch.opponent}
        </Link>
      )}
    </div>
  );
}
