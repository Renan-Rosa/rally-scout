import { redirect } from "next/navigation";
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

  return (
    <div className='min-h-screen flex flex-col gap-4'>
      <Header user={user} />
      <main className='flex-1 p-6'>
        {children}
      </main>
    </div>
  );
}
