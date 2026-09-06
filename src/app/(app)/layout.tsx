import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/shell/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const firstName = profile?.full_name?.split(" ")[0] || "por aí";
  const isMaster = profile?.role === "master";

  return (
    <AppShell isMaster={isMaster} greeting={`Olá, ${firstName}! 👋`}>
      {children}
    </AppShell>
  );
}
