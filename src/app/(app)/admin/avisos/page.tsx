"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Aviso, AvisoType, Profile } from "@/lib/supabase/types";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";

const TYPE_OPTIONS: { value: AvisoType; label: string }[] = [
  { value: "geral", label: "📣 Geral" },
  { value: "nova_ceg", label: "📣 Nova CEG" },
  { value: "status_alterado", label: "📌 Status alterado" },
  { value: "valores_atualizados", label: "💰 Valores atualizados" },
  { value: "cotacao", label: "💰 Cotação" },
  { value: "comprovante_enviado", label: "📎 Comprovante enviado" },
  { value: "envio_solicitado", label: "🚚 Envio solicitado" },
  { value: "compra_lojinha", label: "🛒 Compra na Lojinha" },
  { value: "reporte_atualizado", label: "📋 Reporte atualizado" },
];

export default function AdminAvisosPage() {
  const supabase = useMemo(() => createClient(), []);
  const [joiners, setJoiners] = useState<Profile[]>([]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [type, setType] = useState<AvisoType>("geral");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<string>("all");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function load() {
    const [{ data: profiles }, { data: avisosData }] = await Promise.all([
      supabase.from("profiles").select("*").order("full_name"),
      supabase.from("avisos").select("*").order("created_at", { ascending: false }).limit(30),
    ]);
    setJoiners((profiles ?? []) as Profile[]);
    setAvisos((avisosData ?? []) as Aviso[]);
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

    await supabase.from("avisos").insert({
      type,
      title,
      message: message || null,
      target_user_id: target === "all" ? null : target,
      created_by: user!.id,
    });

    setSubmitting(false);
    setSuccess(true);
    setTitle("");
    setMessage("");
    load();
  }

  return (
    <Card>
      <CardHeader icon="🔔" title="Enviar Aviso" />
      <CardBody className="flex flex-col gap-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldGroup label="Tipo" htmlFor="type">
              <Select id="type" value={type} onChange={(e) => setType(e.target.value as AvisoType)}>
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup label="Enviar para" htmlFor="target">
              <Select id="target" value={target} onChange={(e) => setTarget(e.target.value)}>
                <option value="all">📢 Todos os joiners</option>
                {joiners
                  .filter((j) => j.role !== "master")
                  .map((j) => (
                    <option key={j.id} value={j.id}>
                      @{j.username}
                    </option>
                  ))}
              </Select>
            </FieldGroup>
          </div>

          <FieldGroup label="Título *" htmlFor="title">
            <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </FieldGroup>
          <FieldGroup label="Mensagem" htmlFor="message">
            <Textarea
              id="message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </FieldGroup>

          {success && (
            <p className="text-sm font-semibold text-success-700">Aviso enviado!</p>
          )}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Enviando..." : "Enviar Aviso"}
          </Button>
        </form>

        <div className="border-t border-sky-100 pt-4">
          <h3 className="mb-2 font-heading font-bold text-sky-700">Últimos avisos enviados</h3>
          <ul className="flex flex-col gap-2">
            {avisos.map((a) => (
              <li key={a.id} className="rounded-control bg-surface-muted px-3 py-2 text-sm">
                <strong>{a.title}</strong> — {formatDate(a.created_at)}
              </li>
            ))}
          </ul>
        </div>
      </CardBody>
    </Card>
  );
}
