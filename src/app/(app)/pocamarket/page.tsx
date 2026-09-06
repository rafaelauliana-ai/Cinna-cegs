"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PocamarketRequest } from "@/lib/supabase/types";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FieldGroup, Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

const STATUS_LABEL: Record<PocamarketRequest["status"], string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};
const STATUS_TONE: Record<PocamarketRequest["status"], "warning" | "sky" | "success" | "danger"> = {
  pendente: "warning",
  em_andamento: "sky",
  concluido: "success",
  cancelado: "danger",
};

export default function PocamarketPage() {
  const supabase = useMemo(() => createClient(), []);
  const [groupQuery, setGroupQuery] = useState("");
  const [listingLink, setListingLink] = useState("");
  const [requests, setRequests] = useState<PocamarketRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function load() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("pocamarket_requests")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setRequests((data ?? []) as PocamarketRequest[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from("pocamarket_requests").insert({
      user_id: user!.id,
      group_query: groupQuery || null,
      listing_link: listingLink,
    });

    setSubmitting(false);

    if (insertError) {
      setError("Não foi possível enviar seu pedido. Tente novamente.");
      return;
    }

    setSuccess(true);
    setGroupQuery("");
    setListingLink("");
    load();
  }

  return (
    <Card>
      <CardHeader icon="🛒" title="Pocamarket" />
      <CardBody className="flex flex-col gap-5">
        <p className="text-sm text-foreground-muted">
          Buscando um grupo específico? Envie o link do anúncio e acompanhe o status do seu
          pedido aqui mesmo.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldGroup
            label="Buscar grupo (opcional)"
            htmlFor="groupQuery"
            hint="Ex: nome do grupo/photocard que você procura"
          >
            <Input
              id="groupQuery"
              value={groupQuery}
              onChange={(e) => setGroupQuery(e.target.value)}
            />
          </FieldGroup>
          <FieldGroup label="Link do anúncio *" htmlFor="listingLink">
            <Input
              id="listingLink"
              type="url"
              placeholder="https://..."
              required
              value={listingLink}
              onChange={(e) => setListingLink(e.target.value)}
            />
          </FieldGroup>

          {error && <p className="text-sm font-semibold text-danger-700">{error}</p>}
          {success && (
            <p className="text-sm font-semibold text-success-700">Pedido enviado!</p>
          )}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Enviando..." : "Enviar pedido"}
          </Button>
        </form>

        <div className="border-t border-sky-100 pt-4">
          <h3 className="mb-2 font-heading font-bold text-sky-700">📋 Meus pedidos</h3>
          {loading ? (
            <p className="text-sm text-foreground-muted">Carregando...</p>
          ) : requests.length === 0 ? (
            <EmptyState title="Você ainda não fez nenhum pedido no Pocamarket." icon="🛒" />
          ) : (
            <ul className="flex flex-col gap-2">
              {requests.map((r) => (
                <li key={r.id} className="rounded-control border-2 border-sky-100 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={r.listing_link}
                      target="_blank"
                      className="truncate text-sm font-semibold text-sky-600 hover:underline"
                    >
                      {r.group_query || r.listing_link}
                    </a>
                    <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                  </div>
                  {r.admin_notes && (
                    <p className="mt-1 text-sm text-foreground-muted">📝 {r.admin_notes}</p>
                  )}
                  <p className="mt-1 text-xs text-foreground-muted">
                    Enviado em {formatDate(r.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
