"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Reporte } from "@/lib/supabase/types";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FieldGroup, Select, Textarea } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

const STATUS_LABEL: Record<Reporte["status"], string> = {
  aberto: "Aberto",
  em_analise: "Em análise",
  resolvido: "Resolvido",
};
const STATUS_TONE: Record<Reporte["status"], "warning" | "sky" | "success"> = {
  aberto: "warning",
  em_analise: "sky",
  resolvido: "success",
};

export default function ReportarPage() {
  const supabase = useMemo(() => createClient(), []);
  const [type, setType] = useState<Reporte["type"]>("sugestao");
  const [message, setMessage] = useState("");
  const [reports, setReports] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function load() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("reportes")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setReports((data ?? []) as Reporte[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("reportes").insert({ user_id: user!.id, type, message });
    setSubmitting(false);
    setSuccess(true);
    setMessage("");
    load();
  }

  return (
    <Card>
      <CardHeader icon="🐛" title="Reportar Erro / Sugestão" />
      <CardBody className="flex flex-col gap-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldGroup label="Tipo" htmlFor="type">
            <Select id="type" value={type} onChange={(e) => setType(e.target.value as Reporte["type"])}>
              <option value="sugestao">💡 Sugestão</option>
              <option value="erro">🐛 Erro / Bug</option>
            </Select>
          </FieldGroup>
          <FieldGroup label="Conte pra gente" htmlFor="message">
            <Textarea
              id="message"
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </FieldGroup>
          {success && (
            <p className="text-sm font-semibold text-success-700">Enviado, obrigada! 💙</p>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Enviando..." : "Enviar"}
          </Button>
        </form>

        <div className="border-t border-sky-100 pt-4">
          <h3 className="mb-2 font-heading font-bold text-sky-700">Meus reportes</h3>
          {loading ? (
            <p className="text-sm text-foreground-muted">Carregando...</p>
          ) : reports.length === 0 ? (
            <EmptyState title="Nenhum reporte enviado ainda." icon="🐛" />
          ) : (
            <ul className="flex flex-col gap-2">
              {reports.map((r) => (
                <li key={r.id} className="rounded-control border-2 border-sky-100 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">
                      {r.type === "erro" ? "🐛 Erro" : "💡 Sugestão"}
                    </span>
                    <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-foreground-muted">{r.message}</p>
                  {r.admin_response && (
                    <p className="mt-1 text-sm text-sky-700">💬 {r.admin_response}</p>
                  )}
                  <p className="mt-1 text-xs text-foreground-muted">{formatDate(r.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
