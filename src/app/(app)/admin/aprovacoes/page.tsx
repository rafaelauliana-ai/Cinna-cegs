"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  ComprovantePagamento,
  Cotacao,
  PocamarketRequest,
  Reporte,
} from "@/lib/supabase/types";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select, Textarea } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatBRL, formatDate } from "@/lib/utils";

type Tab = "comprovantes" | "cotacoes" | "pocamarket" | "reportes";

interface WithOwner {
  profiles: { username: string } | null;
}

export default function AdminAprovacoesPage() {
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<Tab>("comprovantes");

  const [comprovantes, setComprovantes] = useState<(ComprovantePagamento & WithOwner)[]>([]);
  const [cotacoes, setCotacoes] = useState<(Cotacao & WithOwner)[]>([]);
  const [pocamarket, setPocamarket] = useState<(PocamarketRequest & WithOwner)[]>([]);
  const [reportes, setReportes] = useState<(Reporte & WithOwner)[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [{ data: c1 }, { data: c2 }, { data: c3 }, { data: c4 }] = await Promise.all([
      supabase
        .from("comprovantes_pagamento")
        .select("*, profiles(username)")
        .order("created_at", { ascending: false }),
      supabase
        .from("cotacoes")
        .select("*, profiles(username)")
        .order("created_at", { ascending: false }),
      supabase
        .from("pocamarket_requests")
        .select("*, profiles(username)")
        .order("created_at", { ascending: false }),
      supabase
        .from("reportes")
        .select("*, profiles(username)")
        .order("created_at", { ascending: false }),
    ]);
    setComprovantes((c1 ?? []) as (ComprovantePagamento & WithOwner)[]);
    setCotacoes((c2 ?? []) as (Cotacao & WithOwner)[]);
    setPocamarket((c3 ?? []) as (PocamarketRequest & WithOwner)[]);
    setReportes((c4 ?? []) as (Reporte & WithOwner)[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getSignedUrl(path: string) {
    const { data } = await supabase.storage.from("comprovantes").createSignedUrl(path, 60 * 10);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  async function updateStatus(
    table: "comprovantes_pagamento" | "cotacoes",
    id: string,
    status: string,
  ) {
    await supabase.from(table).update({ status }).eq("id", id);
    load();
  }

  async function updatePocamarket(id: string, patch: Partial<PocamarketRequest>) {
    await supabase.from("pocamarket_requests").update(patch).eq("id", id);
    load();
  }

  async function updateReporte(id: string, patch: Partial<Reporte>) {
    await supabase.from("reportes").update(patch).eq("id", id);
    load();
  }

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: "comprovantes", label: "Comprovantes", count: comprovantes.length },
    { key: "cotacoes", label: "Cotações", count: cotacoes.length },
    { key: "pocamarket", label: "Pocamarket", count: pocamarket.length },
    { key: "reportes", label: "Reportes", count: reportes.length },
  ];

  return (
    <Card>
      <CardHeader
        icon="✅"
        title="Aprovações"
        actions={
          <div className="flex flex-wrap gap-1 rounded-pill bg-white/20 p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-pill px-3 py-1.5 text-xs font-bold transition-colors ${
                  tab === t.key ? "bg-white text-sky-700" : "text-white/90 hover:bg-white/10"
                }`}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>
        }
      />
      <CardBody>
        {loading ? (
          <p className="text-sm text-foreground-muted">Carregando...</p>
        ) : (
          <>
            {tab === "comprovantes" &&
              (comprovantes.length === 0 ? (
                <EmptyState title="Nenhum comprovante enviado." icon="📎" />
              ) : (
                <ul className="flex flex-col gap-2">
                  {comprovantes.map((c) => (
                    <li key={c.id} className="rounded-control border-2 border-sky-100 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold">@{c.profiles?.username}</p>
                          <p className="text-xs text-foreground-muted">
                            {formatDate(c.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => getSignedUrl(c.proof_url)}
                            className="text-xs font-semibold text-sky-600 hover:underline"
                          >
                            Ver comprovante
                          </button>
                          <Select
                            className="w-auto py-1.5 text-xs"
                            value={c.status}
                            onChange={(e) =>
                              updateStatus("comprovantes_pagamento", c.id, e.target.value)
                            }
                          >
                            <option value="enviado">Enviado</option>
                            <option value="confirmado">Confirmado</option>
                            <option value="rejeitado">Rejeitado</option>
                          </Select>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ))}

            {tab === "cotacoes" &&
              (cotacoes.length === 0 ? (
                <EmptyState title="Nenhuma cotação enviada." icon="💰" />
              ) : (
                <ul className="flex flex-col gap-2">
                  {cotacoes.map((c) => (
                    <li key={c.id} className="rounded-control border-2 border-sky-100 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold">
                            @{c.profiles?.username} — {c.product_name}
                          </p>
                          <p className="text-xs text-foreground-muted">
                            US$ {c.value_usd} · {formatBRL(c.value_brl)} ·{" "}
                            {c.product_link && (
                              <a href={c.product_link} target="_blank" className="text-sky-600 hover:underline">
                                link
                              </a>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {c.proof_url && (
                            <button
                              onClick={() => getSignedUrl(c.proof_url!)}
                              className="text-xs font-semibold text-sky-600 hover:underline"
                            >
                              Ver comprovante
                            </button>
                          )}
                          <Select
                            className="w-auto py-1.5 text-xs"
                            value={c.status}
                            onChange={(e) => updateStatus("cotacoes", c.id, e.target.value)}
                          >
                            <option value="pendente">Pendente</option>
                            <option value="confirmado">Confirmado</option>
                            <option value="rejeitado">Rejeitado</option>
                          </Select>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ))}

            {tab === "pocamarket" &&
              (pocamarket.length === 0 ? (
                <EmptyState title="Nenhum pedido no Pocamarket." icon="🛒" />
              ) : (
                <ul className="flex flex-col gap-2">
                  {pocamarket.map((p) => (
                    <li key={p.id} className="rounded-control border-2 border-sky-100 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold">@{p.profiles?.username}</p>
                          <a
                            href={p.listing_link}
                            target="_blank"
                            className="text-xs text-sky-600 hover:underline"
                          >
                            {p.group_query || p.listing_link}
                          </a>
                        </div>
                        <Select
                          className="w-auto py-1.5 text-xs"
                          value={p.status}
                          onChange={(e) =>
                            updatePocamarket(p.id, { status: e.target.value as PocamarketRequest["status"] })
                          }
                        >
                          <option value="pendente">Pendente</option>
                          <option value="em_andamento">Em andamento</option>
                          <option value="concluido">Concluído</option>
                          <option value="cancelado">Cancelado</option>
                        </Select>
                      </div>
                      <Textarea
                        className="mt-2"
                        rows={2}
                        placeholder="Nota interna (visível pro joiner)"
                        value={notes[p.id] ?? p.admin_notes ?? ""}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        onBlur={(e) => updatePocamarket(p.id, { admin_notes: e.target.value })}
                      />
                    </li>
                  ))}
                </ul>
              ))}

            {tab === "reportes" &&
              (reportes.length === 0 ? (
                <EmptyState title="Nenhum reporte enviado." icon="🐛" />
              ) : (
                <ul className="flex flex-col gap-2">
                  {reportes.map((r) => (
                    <li key={r.id} className="rounded-control border-2 border-sky-100 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <Badge tone={r.type === "erro" ? "danger" : "sky"}>
                            {r.type === "erro" ? "🐛 Erro" : "💡 Sugestão"}
                          </Badge>{" "}
                          <span className="text-sm font-semibold">@{r.profiles?.username}</span>
                          <p className="mt-1 text-sm text-foreground-muted">{r.message}</p>
                        </div>
                        <Select
                          className="w-auto py-1.5 text-xs"
                          value={r.status}
                          onChange={(e) =>
                            updateReporte(r.id, { status: e.target.value as Reporte["status"] })
                          }
                        >
                          <option value="aberto">Aberto</option>
                          <option value="em_analise">Em análise</option>
                          <option value="resolvido">Resolvido</option>
                        </Select>
                      </div>
                      <Textarea
                        className="mt-2"
                        rows={2}
                        placeholder="Responder ao joiner"
                        value={notes[r.id] ?? r.admin_response ?? ""}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [r.id]: e.target.value }))}
                        onBlur={(e) => updateReporte(r.id, { admin_response: e.target.value })}
                      />
                    </li>
                  ))}
                </ul>
              ))}
          </>
        )}
      </CardBody>
    </Card>
  );
}
