"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Claim } from "@/lib/supabase/types";
import { REPASSE_ELIGIBLE_STATUSES, CLAIM_STATUS_LABEL, CLAIM_STATUS_TONE } from "@/lib/status";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatBRL, formatDate } from "@/lib/utils";

interface ClaimRow extends Claim {
  cegs: { name: string } | null;
}

interface RepasseRow {
  id: string;
  status: string;
  created_at: string;
}

export default function RepassePage() {
  const supabase = useMemo(() => createClient(), []);
  const [eligible, setEligible] = useState<ClaimRow[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [myRepasses, setMyRepasses] = useState<RepasseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function load() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const [{ data: claims }, { data: repasses }] = await Promise.all([
      supabase
        .from("claims")
        .select("*, cegs(name)")
        .eq("user_id", user!.id)
        .in("status", REPASSE_ELIGIBLE_STATUSES),
      supabase
        .from("repasses")
        .select("id, status, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false }),
    ]);

    setEligible((claims ?? []) as ClaimRow[]);
    setMyRepasses((repasses ?? []) as RepasseRow[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  async function handleSubmit() {
    if (selected.length === 0) return;
    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: repasse, error } = await supabase
      .from("repasses")
      .insert({ user_id: user!.id })
      .select()
      .single();

    if (!error && repasse) {
      await supabase
        .from("repasse_claims")
        .insert(selected.map((claim_id) => ({ repasse_id: repasse.id, claim_id })));
      setSuccess(true);
      setSelected([]);
      load();
    }
    setSubmitting(false);
  }

  return (
    <Card>
      <CardHeader icon="🔁" title="Solicitar Repasse" />
      <CardBody className="flex flex-col gap-5">
        <p className="text-sm text-foreground-muted">
          Selecione as claims elegíveis (já pagas/confirmadas) para solicitar o repasse do
          valor.
        </p>

        {loading ? (
          <p className="text-sm text-foreground-muted">Carregando...</p>
        ) : eligible.length === 0 ? (
          <EmptyState
            title="Nenhuma claim elegível para repasse no momento."
            icon="🔁"
          />
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
                  <Badge tone={CLAIM_STATUS_TONE[claim.status]}>
                    {CLAIM_STATUS_LABEL[claim.status]}
                  </Badge>
                </div>
                <span className="font-heading font-bold text-sky-700">
                  {formatBRL(claim.total_value)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {success && (
          <p className="text-sm font-semibold text-success-700">
            Solicitação de repasse enviada!
          </p>
        )}

        <Button
          variant="success"
          onClick={handleSubmit}
          disabled={selected.length === 0 || submitting}
        >
          {submitting ? "Enviando..." : `Solicitar repasse (${selected.length})`}
        </Button>

        <div className="border-t border-sky-100 pt-4">
          <h3 className="mb-2 font-heading font-bold text-sky-700">📦 Meus repasses solicitados</h3>
          {myRepasses.length === 0 ? (
            <p className="text-sm text-foreground-muted">Nenhuma solicitação ainda.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {myRepasses.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-control bg-surface-muted px-4 py-2 text-sm"
                >
                  <span>Solicitado em {formatDate(r.created_at)}</span>
                  <Badge tone={r.status === "pago" ? "success" : "sky"}>{r.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
