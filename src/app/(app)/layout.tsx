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
      <Header user={user} liveMatch={liveMatch} />
      <main className='flex-1 min-h-0 overflow-auto p-4 lg:p-6'>{children}</main>
    </div>
  );
}
