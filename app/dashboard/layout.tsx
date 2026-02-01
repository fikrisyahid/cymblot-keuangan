import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppShellLayout } from "@/components/appshell-layout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <AppShellLayout>{children}</AppShellLayout>;
}
