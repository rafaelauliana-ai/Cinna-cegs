"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Aviso, AvisoType } from "@/lib/supabase/types";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

const TYPE_LABEL: Record<AvisoType, string> = {
  compra_lojinha: "🛒 Compra na Lojinha",
  comprovante_enviado: "📎 Comprovante enviado",
  envio_solicitado: "🚚 Envio solicitado",
  nova_ceg: "📣 Nova CEG",
  status_alterado: "📌 Status alterado",
  valores_atualizados: "💰 Valores atualizados",
  cotacao: "💰 Cotação",
  geral: "📣 Geral",
  reporte_atualizado: "📋 Reporte atualizado",
};

export default function AvisosPage() {
  const supabase = useMemo(() => createClient(), []);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<"nao_visualizados" | "visualizados" | "todos">(
    "nao_visualizados",
  );
  const [typeFilter, setTypeFilter] = useState<"todos" | AvisoType>("todos");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: avisosData } = await supabase
      .from("avisos")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: reads } = await supabase
      .from("aviso_reads")
      .select("aviso_id")
      .eq("user_id", user!.id);

    setAvisos((avisosData ?? []) as Aviso[]);
    setReadIds(new Set((reads ?? []).map((r: { aviso_id: string }) => r.aviso_id)));
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function markAsRead(avisoId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase
      .from("aviso_reads")
      .upsert({ aviso_id: avisoId, user_id: user!.id }, { onConflict: "aviso_id,user_id" });
    setReadIds((prev) => new Set(prev).add(avisoId));
  }

  async function markAllAsRead() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const unread = avisos.filter((a) => !readIds.has(a.id));
    if (unread.length === 0) return;
    await supabase
      .from("aviso_reads")
      .upsert(
        unread.map((a) => ({ aviso_id: a.id, user_id: user!.id })),
        { onConflict: "aviso_id,user_id" },
      );
    setReadIds(new Set(avisos.map((a) => a.id)));
  }

  const filtered = avisos.filter((aviso) => {
    const isRead = readIds.has(aviso.id);
    if (statusFilter === "nao_visualizados" && isRead) return false;
    if (statusFilter === "visualizados" && !isRead) return false;
    if (typeFilter !== "todos" && aviso.type !== typeFilter) return false;
    return true;
  });

  return (
    <Card>
      <CardHeader
        icon="🔔"
        title="Avisos"
        actions={
          <Button variant="secondary" size="sm" onClick={markAllAsRead}>
            ✓ Marcar todos como lido
          </Button>
        }
      />
      <CardBody className="flex flex-col gap-4">
        <p className="text-sm text-foreground-muted">
          Acompanhe os avisos do sistema, como novas CEGs, atualizações de status, compras e
          muito mais.
        </p>

        <div className="flex flex-wrap gap-3">
          <div className="min-w-[160px] flex-1">
            <label className="mb-1 block text-xs font-semibold text-foreground-muted">
              Status
            </label>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            >
              <option value="nao_visualizados">Não visualizados</option>
              <option value="visualizados">Visualizados</option>
              <option value="todos">Todos</option>
            </Select>
          </div>
          <div className="min-w-[160px] flex-1">
            <label className="mb-1 block text-xs font-semibold text-foreground-muted">Tipo</label>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}>
              <option value="todos">Todos</option>
              {Object.entries(TYPE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-foreground-muted">Carregando...</p>
        ) : filtered.length === 0 ? (
          <EmptyState title="Nenhum aviso encontrado." icon="📭" />
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((aviso) => {
              const isRead = readIds.has(aviso.id);
              return (
                <li
                  key={aviso.id}
                  className={`rounded-control border-2 p-3 ${
                    isRead ? "border-sky-50 bg-white" : "border-sky-200 bg-sky-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">
                      {TYPE_LABEL[aviso.type]} — {aviso.title}
                    </p>
                    {!isRead && (
                      <button
                        onClick={() => markAsRead(aviso.id)}
                        className="shrink-0 text-xs font-semibold text-sky-600 hover:underline"
                      >
                        marcar como lido
                      </button>
                    )}
                  </div>
                  {aviso.message && (
                    <p className="mt-1 text-sm text-foreground-muted">{aviso.message}</p>
                  )}
                  <p className="mt-1 text-xs text-foreground-muted">
                    {formatDate(aviso.created_at)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
