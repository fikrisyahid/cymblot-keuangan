import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirect to dashboard if already logged in
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
