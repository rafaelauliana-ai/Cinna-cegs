"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input } from "@/components/ui/Input";
import { formatBRL, formatDate } from "@/lib/utils";

interface CambioInfo {
  rate: number;
  markup: number;
  updatedAt: string;
}

export default function CotacaoPage() {
  const supabase = useMemo(() => createClient(), []);

  const [cambio, setCambio] = useState<CambioInfo | null>(null);
  const [cambioError, setCambioError] = useState<string | null>(null);

  const [usdInput, setUsdInput] = useState("");
  const [estimatedBrl, setEstimatedBrl] = useState<number | null>(null);

  const [productName, setProductName] = useState("");
  const [valueUsd, setValueUsd] = useState("");
  const [valueBrl, setValueBrl] = useState("");
  const [productLink, setProductLink] = useState("");
  const [proof, setProof] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/cambio")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setCambioError(data.error);
          return;
        }
        setCambio(data as CambioInfo);
      })
      .catch(() => setCambioError("Não foi possível obter a cotação do dólar agora."));
  }, []);

  function calculate(usd: number) {
    if (!cambio) return null;
    return usd * cambio.rate + cambio.markup;
  }

  function handleCalculate() {
    const value = Number(usdInput);
    if (!Number.isFinite(value)) return;
    setEstimatedBrl(calculate(value));
  }

  function useEstimatedValue() {
    if (estimatedBrl === null) return;
    setValueUsd(usdInput);
    setValueBrl(estimatedBrl.toFixed(2));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!proof) {
      setError("Anexe o comprovante da compra.");
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

    const { error: insertError } = await supabase.from("cotacoes").insert({
      user_id: user!.id,
      product_name: productName,
      value_usd: Number(valueUsd) || null,
      value_brl: Number(valueBrl) || null,
      product_link: productLink || null,
      proof_url: path,
    });

    setSubmitting(false);

    if (insertError) {
      setError("Não foi possível confirmar a compra. Tente novamente.");
      return;
    }

    setSuccess(true);
    setProductName("");
    setValueUsd("");
    setValueBrl("");
    setProductLink("");
    setProof(null);
  }

  return (
    <Card>
      <CardHeader icon="💵" title="Cotação em Dólar" />
      <CardBody className="flex flex-col gap-6">
        <div>
          <h3 className="mb-3 font-heading font-bold text-sky-700">
            📊 Calcular valor em Real
          </h3>

          {cambioError && (
            <p className="mb-3 text-sm font-semibold text-danger-700">{cambioError}</p>
          )}
          {cambio && (
            <p className="mb-3 rounded-control bg-surface-muted px-3 py-2 text-xs text-foreground-muted">
              Cotação de hoje: <strong>US$ 1 = {formatBRL(cambio.rate)}</strong> (já inclui a
              taxa fixa de {formatBRL(cambio.markup)} sobre o total convertido) · atualizado em{" "}
              {formatDate(cambio.updatedAt)}
            </p>
          )}

          <FieldGroup label="Valor em Dólar (US$)" htmlFor="usd">
            <Input
              id="usd"
              placeholder="Ex: 30"
              inputMode="decimal"
              value={usdInput}
              onChange={(e) => setUsdInput(e.target.value)}
            />
          </FieldGroup>
          <Button
            type="button"
            className="mt-3 w-full"
            onClick={handleCalculate}
            disabled={!cambio}
          >
            Calcular
          </Button>

          <FieldGroup label="Valor estimado em Real (R$)" htmlFor="estimated" className="mt-3">
            <Input id="estimated" readOnly value={estimatedBrl !== null ? formatBRL(estimatedBrl) : ""} />
          </FieldGroup>
          <Button
            type="button"
            variant="success"
            className="mt-3 w-full"
            onClick={useEstimatedValue}
            disabled={estimatedBrl === null}
          >
            Usar este valor
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 border-t border-sky-100 pt-5">
          <h3 className="font-heading font-bold text-success-700">✅ Confirmar Compra</h3>
          <p className="text-sm text-foreground-muted">
            Preencha os dados abaixo para confirmar a compra. Lembrando que caso o produto dê
            sold, iremos devolver o dinheiro.
          </p>

          <FieldGroup label="Nome do Produto *" htmlFor="productName">
            <Input
              id="productName"
              placeholder="Ex: Photocard ABC"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </FieldGroup>

          <FieldGroup label="Valor em Dólar (US$) *" htmlFor="valueUsd">
            <Input
              id="valueUsd"
              inputMode="decimal"
              required
              value={valueUsd}
              onChange={(e) => setValueUsd(e.target.value)}
            />
          </FieldGroup>

          <FieldGroup label="Valor em Real (R$) *" htmlFor="valueBrl">
            <Input
              id="valueBrl"
              inputMode="decimal"
              required
              value={valueBrl}
              onChange={(e) => setValueBrl(e.target.value)}
            />
          </FieldGroup>

          <FieldGroup label="Link do produto *" htmlFor="productLink">
            <Input
              id="productLink"
              type="url"
              placeholder="https://..."
              required
              value={productLink}
              onChange={(e) => setProductLink(e.target.value)}
            />
          </FieldGroup>

          <FieldGroup
            label="Comprovante de pagamento *"
            htmlFor="proof"
            hint="Anexe o comprovante da compra (PDF, JPG ou PNG)."
          >
            <input
              id="proof"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              required
              onChange={(e) => setProof(e.target.files?.[0] ?? null)}
              className="w-full text-sm"
            />
          </FieldGroup>

          {error && <p className="text-sm font-semibold text-danger-700">{error}</p>}
          {success && (
            <p className="text-sm font-semibold text-success-700">
              Compra confirmada! Obrigada 💙
            </p>
          )}

          <Button type="submit" variant="success" disabled={submitting}>
            {submitting ? "Enviando..." : "✅ Confirmar Compra"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
