import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDashboardStats } from "@/lib/data/dashboard";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { CLAIM_STATUS_LABEL, CLAIM_STATUS_TONE } from "@/lib/status";
import { formatBRL, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const stats = await getDashboardStats(supabase, user!.id);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardBody>
          <p className="text-foreground-muted">
            Seja bem-vinde ao painel da <strong>Cinnamon Cegs</strong>! Aqui você acompanha
            suas claims, valores pendentes, prazos e avisos em um só lugar.
          </p>
        </CardBody>
      </Card>

      <div data-tour-id="dashboard-stats" className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard icon="📦" label="Total de Itens" value={stats.totalItens} tone="sky" />
        <StatCard
          icon="💰"
          label="Valor Pendente"
          value={formatBRL(stats.valorPendente)}
          hint="Pagamento de itens"
          tone="danger"
        />
        <StatCard
          icon="📅"
          label="Prazos Próximos"
          value={stats.prazosProximos.length}
          hint="Itens com vencimento em até 5 dias"
          tone="warning"
        />
        <StatCard
          icon="⏰"
          label="Itens em Atraso"
          value={stats.itensEmAtraso.length}
          hint="Com prazo vencido"
          tone="danger"
        />
        <StatCard
          icon="🔔"
          label="Avisos"
          value={stats.avisosNaoVisualizados}
          hint="Não visualizados"
          tone="pink"
        />
      </div>

      <Card>
        <CardHeader icon="📋" title="Prazo de pagamento próximo (até 5 dias)" />
        <CardBody>
          {stats.prazosProximos.length === 0 ? (
            <EmptyState title="Nenhuma claim com prazo próximo." icon="🗓️" />
          ) : (
            <ul className="flex flex-col gap-2">
              {stats.prazosProximos.map((claim) => (
                <li
                  key={claim.id}
                  className="flex items-center justify-between rounded-control bg-surface-muted px-4 py-3"
                >
                  <div>
                    <Badge tone={CLAIM_STATUS_TONE[claim.status]}>
                      {CLAIM_STATUS_LABEL[claim.status]}
                    </Badge>
                    <p className="mt-1 text-sm text-foreground-muted">
                      Vence em {formatDate(claim.due_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-bold text-sky-700">
                      {formatBRL(claim.total_value)}
                    </p>
                    <Link
                      href="/claims"
                      className="text-xs font-semibold text-sky-600 hover:underline"
                    >
                      Ver claim →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
