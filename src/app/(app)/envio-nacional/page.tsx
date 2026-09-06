"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Claim } from "@/lib/supabase/types";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatBRL, formatDate } from "@/lib/utils";

interface ClaimRow extends Claim {
  cegs: { name: string } | null;
}

interface EnvioRow {
  id: string;
  status: string;
  created_at: string;
  combined_with_user_id: string | null;
}

export default function EnvioNacionalPage() {
  const supabase = useMemo(() => createClient(), []);
  const [eligible, setEligible] = useState<ClaimRow[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [myEnvios, setMyEnvios] = useState<EnvioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [combineWithOther, setCombineWithOther] = useState(false);
  const [otherUsername, setOtherUsername] = useState("");
  const [resolvedOther, setResolvedOther] = useState<{ id: string; full_name: string } | null>(
    null,
  );
  const [combineError, setCombineError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const [{ data: claims }, { data: envios }] = await Promise.all([
      supabase
        .from("claims")
        .select("*, cegs(name)")
        .eq("user_id", user!.id)
        .eq("status", "nacional_liberado"),
      supabase
        .from("envios_nacionais")
        .select("id, status, created_at, combined_with_user_id")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false }),
    ]);

    setEligible((claims ?? []) as ClaimRow[]);
    setMyEnvios((envios ?? []) as EnvioRow[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  async function resolveOtherUsername() {
    setCombineError(null);
    setResolvedOther(null);
    const clean = otherUsername.trim().replace(/^@/, "");
    if (!clean) return;

    const { data, error } = await supabase.rpc("find_joiner_by_username", {
      p_username: clean,
    });

    if (error || !data || data.length === 0) {
      setCombineError("Joiner não encontrado.");
      return;
    }
    setResolvedOther(data[0]);
  }

  async function handleSubmit() {
    if (selected.length === 0) return;
    if (combineWithOther && !resolvedOther) {
      setCombineError("Busque e confirme o @ do outro joiner antes de continuar.");
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: envio, error } = await supabase
      .from("envios_nacionais")
      .insert({
        user_id: user!.id,
        combined_with_user_id: combineWithOther ? resolvedOther!.id : null,
      })
      .select()
      .single();

    if (!error && envio) {
      await supabase
        .from("envio_claims")
        .insert(selected.map((claim_id) => ({ envio_id: envio.id, claim_id })));
      setSuccess(true);
      setSelected([]);
      setCombineWithOther(false);
      setOtherUsername("");
      setResolvedOther(null);
      load();
    }
    setSubmitting(false);
  }

  return (
    <Card>
      <CardHeader icon="🚚" title="Envio Nacional" />
      <CardBody className="flex flex-col gap-5">
        <p className="text-sm text-foreground-muted">
          Selecione as claims com status <strong>Nacional Liberado</strong> para solicitar
          envio.
        </p>

        <div className="border-t border-sky-100 pt-4">
          <h3 className="mb-2 font-heading font-bold text-sky-700">📦 Meus envios solicitados</h3>
          {loading ? (
            <p className="text-sm text-foreground-muted">Carregando...</p>
          ) : myEnvios.length === 0 ? (
            <p className="text-sm text-foreground-muted">Nenhum envio solicitado ainda.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {myEnvios.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between rounded-control bg-surface-muted px-4 py-2 text-sm"
                >
                  <span>Solicitado em {formatDate(e.created_at)}</span>
                  <Badge tone={e.status === "entregue" ? "success" : "sky"}>{e.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-sky-100 pt-4">
          <h3 className="mb-2 font-heading font-bold text-sky-700">📦 Solicitar Envio</h3>
          <p className="mb-2 text-sm font-semibold">Selecione os itens para enviar:</p>
          {eligible.length === 0 ? (
            <EmptyState title="Não há nenhuma claim correspondente." icon="📭" />
          ) : (
            <ul className="flex flex-col gap-2">
              {eligible.map((claim) => (
                <li
                  key={claim.id}
                  className="flex items-center gap-3 rounded-control border-2 border-sky-100 p-3"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-sky-500"
                    checked={selected.includes(claim.id)}
                    onChange={() => toggle(claim.id)}
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{claim.cegs?.name}</p>
                  </div>
                  <span className="font-heading font-bold text-sky-700">
                    {formatBRL(claim.total_value)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <label className="mt-4 flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-sky-500"
              checked={combineWithOther}
              onChange={(e) => {
                setCombineWithOther(e.target.checked);
                setResolvedOther(null);
                setCombineError(null);
              }}
            />
            <span>
              <strong>📦 Quero solicitar o envio com outro joiner</strong>
              <br />
              <span className="text-foreground-muted">
                Marque se os itens selecionados serão enviados junto com os de outro joiner.
              </span>
            </span>
          </label>

          {combineWithOther && (
            <div className="mt-3 flex flex-col gap-2 rounded-control bg-surface-muted p-3">
              <div className="flex gap-2">
                <Input
                  placeholder="@usuario do outro joiner"
                  value={otherUsername}
                  onChange={(e) => setOtherUsername(e.target.value)}
                />
                <Button type="button" variant="secondary" onClick={resolveOtherUsername}>
                  Buscar
                </Button>
              </div>
              {resolvedOther && (
                <p className="text-sm font-semibold text-success-700">
                  ✓ Encontrado: {resolvedOther.full_name}
                </p>
              )}
              {combineError && (
                <p className="text-sm font-semibold text-danger-700">{combineError}</p>
              )}
            </div>
          )}

          {success && (
            <p className="mt-3 text-sm font-semibold text-success-700">
              Envio solicitado com sucesso!
            </p>
          )}

          <Button
            variant="success"
            className="mt-4"
            onClick={handleSubmit}
            disabled={selected.length === 0 || submitting}
          >
            {submitting ? "Enviando..." : "Solicitar Envio"}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
