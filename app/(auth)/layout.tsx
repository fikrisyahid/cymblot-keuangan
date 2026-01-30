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

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      {children}
    </div>
  );
}
