"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Claim } from "@/lib/supabase/types";
import { PAYMENT_METHODS } from "@/lib/config";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatBRL } from "@/lib/utils";

interface ClaimRow extends Claim {
  cegs: { name: string } | null;
}

export default function ComprovantePage() {
  const supabase = useMemo(() => createClient(), []);
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [proof, setProof] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data } = await supabase
        .from("claims")
        .select("*, cegs(name)")
        .eq("user_id", user!.id)
        .in("status", ["nao_confirmado", "aguardando_pagamento"]);

      setClaims((data ?? []) as ClaimRow[]);
      setLoading(false);
    })();
  }, [supabase]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  async function handleSubmit() {
    setError(null);
    if (selected.length === 0) {
      setError("Selecione ao menos uma claim.");
      return;
    }
    if (!proof) {
      setError("Anexe o comprovante.");
      return;
    }

    setSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const path = `${user!.id}/${Date.now()}-${proof.name}`;
    const { error: uploadError } = await supabase.storage
      .from("comprovantes")
      .upload(path, proof);

    if (uploadError) {
      setError("Não foi possível enviar o comprovante. Tente novamente.");
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from("comprovantes_pagamento").insert(
      selected.map((claim_id) => ({
        user_id: user!.id,
        claim_id,
        proof_url: path,
      })),
    );

    setSubmitting(false);

    if (insertError) {
      setError("Não foi possível registrar o comprovante. Tente novamente.");
      return;
    }

    setSuccess(true);
    setSelected([]);
    setProof(null);
  }

  return (
    <Card>
      <CardHeader icon="📤" title="Enviar Comprovante de Pagamento" />
      <CardBody className="flex flex-col gap-5">
        <p className="text-sm text-foreground-muted">Selecione as claims que deseja enviar comprovante</p>

        {loading ? (
          <p className="text-sm text-foreground-muted">Carregando claims...</p>
        ) : claims.length === 0 ? (
          <EmptyState title="Nenhuma claim aguardando pagamento." icon="✅" />
        ) : (
          <ul className="flex flex-col gap-2">
            {claims.map((claim) => (
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

        {claims.length > 0 && (
          <>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">
                Comprovante
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setProof(e.target.files?.[0] ?? null)}
                className="w-full text-sm"
              />
            </div>

            {error && <p className="text-sm font-semibold text-danger-700">{error}</p>}
            {success && (
              <p className="text-sm font-semibold text-success-700">Comprovante enviado!</p>
            )}

            <Button variant="success" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Enviando..." : "Enviar Comprovante"}
            </Button>
          </>
        )}

        <ul className="rounded-control bg-surface-muted p-4 text-sm">
          <li>
            <strong>Formas de pagamento:</strong>
          </li>
          <li>
            <strong>PIX:</strong> {PAYMENT_METHODS.pixKey}
          </li>
          <li>
            <strong>Cartão:</strong>{" "}
            <a href={PAYMENT_METHODS.cardLink} target="_blank" className="text-sky-600 hover:underline">
              {PAYMENT_METHODS.cardLink}
            </a>{" "}
            (selecione a opção &quot;Pagar com cartão&quot;)
          </li>
        </ul>
      </CardBody>
    </Card>
  );
}
