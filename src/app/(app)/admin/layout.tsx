import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const TABS = [
  { href: "/admin", label: "Visão Geral" },
  { href: "/admin/cegs", label: "CEGs & Produtos" },
  { href: "/admin/joiners", label: "Joiners" },
  { href: "/admin/claims", label: "Claims" },
  { href: "/admin/avisos", label: "Avisos" },
  { href: "/admin/aprovacoes", label: "Aprovações" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "master") redirect("/dashboard");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-sky-800">
          🛡️ Administração
        </h1>
        <p className="text-sm text-foreground-muted">Área só sua, Rafa.</p>
      </div>
      <nav className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-pill bg-surface-muted px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
