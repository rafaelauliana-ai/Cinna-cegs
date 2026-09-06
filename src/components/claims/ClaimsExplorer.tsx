"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ClaimWithDetails } from "@/lib/data/claims";
import { Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CLAIM_STATUS_LABEL, CLAIM_STATUS_TONE } from "@/lib/status";
import { formatBRL, formatDate } from "@/lib/utils";
import type { ClaimStatus } from "@/lib/supabase/types";

type SortKey = "recente" | "antiga" | "valor_maior" | "valor_menor" | "ceg";

export function ClaimsExplorer({ claims }: { claims: ClaimWithDetails[] }) {
  const [view, setView] = useState<"tabela" | "box">("tabela");
  const [cegFilter, setCegFilter] = useState("todas");
  const [statusFilter, setStatusFilter] = useState<"todos" | ClaimStatus>("todos");
  const [sort, setSort] = useState<SortKey>("recente");

  const cegOptions = useMemo(
    () => Array.from(new Set(claims.map((c) => c.cegs?.name).filter(Boolean))) as string[],
    [claims],
  );

  const filtered = useMemo(() => {
    let result = claims.filter((c) => {
      if (cegFilter !== "todas" && c.cegs?.name !== cegFilter) return false;
      if (statusFilter !== "todos" && c.status !== statusFilter) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sort) {
        case "antiga":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "valor_maior":
          return b.total_value - a.total_value;
        case "valor_menor":
          return a.total_value - b.total_value;
        case "ceg":
          return (a.cegs?.name ?? "").localeCompare(b.cegs?.name ?? "");
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [claims, cegFilter, statusFilter, sort]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[160px] flex-1">
          <label className="mb-1 block text-xs font-semibold text-foreground-muted">
            Filtrar por CEG
          </label>
          <Select value={cegFilter} onChange={(e) => setCegFilter(e.target.value)}>
            <option value="todas">Todas</option>
            {cegOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-[160px] flex-1">
          <label className="mb-1 block text-xs font-semibold text-foreground-muted">
            Filtrar por Status
          </label>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          >
            <option value="todos">Todos</option>
            {Object.entries(CLAIM_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-[160px] flex-1">
          <label className="mb-1 block text-xs font-semibold text-foreground-muted">
            Ordenar por
          </label>
          <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="recente">Data (mais recente)</option>
            <option value="antiga">Data (mais antiga)</option>
            <option value="valor_maior">Valor (maior)</option>
            <option value="valor_menor">Valor (menor)</option>
            <option value="ceg">CEG (A-Z)</option>
          </Select>
        </div>
        <div className="flex gap-1 rounded-pill bg-surface-muted p-1">
          <button
            onClick={() => setView("tabela")}
            className={`rounded-pill px-3 py-1.5 text-sm font-semibold transition-colors ${
              view === "tabela" ? "bg-white text-sky-700 shadow-softer" : "text-foreground-muted"
            }`}
          >
            ▦ Tabela
          </button>
          <button
            onClick={() => setView("box")}
            className={`rounded-pill px-3 py-1.5 text-sm font-semibold transition-colors ${
              view === "box" ? "bg-white text-sky-700 shadow-softer" : "text-foreground-muted"
            }`}
          >
            ▤ Box
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma claim encontrada."
          description="Ajuste os filtros ou crie uma nova claim."
          icon="📭"
        />
      ) : view === "tabela" ? (
        <div className="overflow-x-auto rounded-control border-2 border-sky-100">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface-muted text-foreground-muted">
              <tr>
                <th className="px-4 py-2 font-semibold">CEG</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2 font-semibold">Itens</th>
                <th className="px-4 py-2 font-semibold">Valor</th>
                <th className="px-4 py-2 font-semibold">Prazo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((claim) => (
                <tr key={claim.id} className="border-t border-sky-100">
                  <td className="px-4 py-3 font-semibold">{claim.cegs?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={CLAIM_STATUS_TONE[claim.status]}>
                      {CLAIM_STATUS_LABEL[claim.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">
                    {claim.claim_items.length}{" "}
                    {claim.claim_items.length === 1 ? "item" : "itens"}
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatBRL(claim.total_value)}</td>
                  <td className="px-4 py-3 text-foreground-muted">{formatDate(claim.due_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((claim) => (
            <div
              key={claim.id}
              className="flex flex-col gap-2 rounded-card border-2 border-sky-100 bg-white p-4 shadow-softer"
            >
              <div className="flex items-center justify-between">
                <p className="font-heading font-bold text-foreground">{claim.cegs?.name}</p>
                <Badge tone={CLAIM_STATUS_TONE[claim.status]}>
                  {CLAIM_STATUS_LABEL[claim.status]}
                </Badge>
              </div>
              <ul className="text-sm text-foreground-muted">
                {claim.claim_items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}× {item.product_name}
                    {item.variation ? ` (${item.variation})` : ""}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex items-center justify-between border-t border-sky-100 pt-2">
                <span className="text-xs text-foreground-muted">
                  Prazo: {formatDate(claim.due_date)}
                </span>
                <span className="font-heading font-bold text-sky-700">
                  {formatBRL(claim.total_value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <Link href="/claims/nova">
          <Button variant="primary">➕ Nova Claim</Button>
        </Link>
      </div>
    </div>
  );
}
