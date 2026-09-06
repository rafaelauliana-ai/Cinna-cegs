import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [
    { count: joinersCount },
    { count: openClaimsCount },
    { count: pendingReportesCount },
    { count: pendingPocamarketCount },
    { count: pendingComprovantesCount },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("claims")
      .select("id", { count: "exact", head: true })
      .not("status", "in", "(entregue,cancelado)"),
    supabase
      .from("reportes")
      .select("id", { count: "exact", head: true })
      .eq("status", "aberto"),
    supabase
      .from("pocamarket_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pendente"),
    supabase
      .from("comprovantes_pagamento")
      .select("id", { count: "exact", head: true })
      .eq("status", "enviado"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard icon="👥" label="Joiners" value={joinersCount ?? 0} tone="sky" />
        <StatCard icon="📦" label="Claims em aberto" value={openClaimsCount ?? 0} tone="warning" />
        <StatCard
          icon="📎"
          label="Comprovantes p/ revisar"
          value={pendingComprovantesCount ?? 0}
          tone="pink"
        />
        <StatCard
          icon="🛒"
          label="Pocamarket pendente"
          value={pendingPocamarketCount ?? 0}
          tone="sky"
        />
        <StatCard
          icon="🐛"
          label="Reportes abertos"
          value={pendingReportesCount ?? 0}
          tone="danger"
        />
      </div>

      <Card>
        <CardHeader icon="👋" title="Bem-vinda de volta, Rafa!" />
        <CardBody className="text-sm text-foreground-muted">
          Use as abas acima para gerenciar CEGs e produtos, ver os dados dos joiners
          (endereço/contato para organizar envios), editar o status das claims, enviar avisos
          e revisar comprovantes, pedidos do Pocamarket e reportes.
        </CardBody>
      </Card>
    </div>
  );
}
