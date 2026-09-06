"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LojinhaItem } from "@/lib/supabase/types";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatBRL } from "@/lib/utils";

const STATUS_LABEL: Record<LojinhaItem["status"], string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
  cancelado: "Cancelado",
};
const STATUS_TONE: Record<LojinhaItem["status"], "success" | "warning" | "neutral" | "danger"> = {
  disponivel: "success",
  reservado: "warning",
  vendido: "neutral",
  cancelado: "danger",
};

type Tab = "todos" | "meus" | "anunciar";

function ItemCard({
  item,
  ownerName,
  isOwner,
  onChangeStatus,
}: {
  item: LojinhaItem;
  ownerName?: string;
  isOwner: boolean;
  onChangeStatus?: (status: LojinhaItem["status"]) => void;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-card border-2 border-sky-100 bg-white shadow-softer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.image_url ?? "/placeholder-product.svg"}
        alt={item.title}
        className="h-40 w-full object-cover"
      />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="font-heading font-bold text-foreground">{item.title}</p>
        {item.description && <p className="text-sm text-foreground-muted">{item.description}</p>}
        <p className="font-heading text-lg font-bold text-sky-700">{formatBRL(item.price)}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="sky">Repasse</Badge>
          <Badge tone={STATUS_TONE[item.status]}>{STATUS_LABEL[item.status]}</Badge>
          {ownerName && <span className="text-xs text-foreground-muted">@{ownerName}</span>}
        </div>

        {isOwner ? (
          <Select
            className="mt-auto"
            value={item.status}
            onChange={(e) => onChangeStatus?.(e.target.value as LojinhaItem["status"])}
          >
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        ) : (
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Tenho interesse no item "${item.title}" (${formatBRL(item.price)}) da Lojinha Cinnamon Cegs!`,
            )}`}
            target="_blank"
            className="mt-auto"
          >
            <Button variant="success" className="w-full">
              💬 Tenho interesse!
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}

export default function LojinhaPage() {
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<Tab>("todos");
  const [items, setItems] = useState<LojinhaItem[]>([]);
  const [owners, setOwners] = useState<Record<string, string>>({});
  const [myItems, setMyItems] = useState<LojinhaItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  async function load() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUserId(user!.id);

    const [{ data: allItems }, { data: mine }] = await Promise.all([
      supabase.from("lojinha_items").select("*").order("created_at", { ascending: false }),
      supabase
        .from("lojinha_items")
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false }),
    ]);

    setItems((allItems ?? []) as LojinhaItem[]);
    setMyItems((mine ?? []) as LojinhaItem[]);

    const ownerIds = Array.from(new Set((allItems ?? []).map((i) => i.owner_id)));
    const ownerMap: Record<string, string> = {};
    if (ownerIds.length > 0) {
      const { data: usernames } = await supabase.rpc("list_usernames", { p_ids: ownerIds });
      (usernames ?? []).forEach((u: { id: string; username: string }) => {
        ownerMap[u.id] = u.username;
      });
    }
    setOwners(ownerMap);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateStatus(item: LojinhaItem, status: LojinhaItem["status"]) {
    await supabase.from("lojinha_items").update({ status }).eq("id", item.id);
    load();
  }

  async function handleAnunciar(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let imageUrl: string | null = null;
    if (image) {
      const path = `${user!.id}/${Date.now()}-${image.name}`;
      const { error: uploadError } = await supabase.storage.from("lojinha").upload(path, image);
      if (!uploadError) {
        imageUrl = supabase.storage.from("lojinha").getPublicUrl(path).data.publicUrl;
      }
    }

    const { error } = await supabase.from("lojinha_items").insert({
      owner_id: user!.id,
      title,
      description: description || null,
      price: Number(price) || 0,
      image_url: imageUrl,
    });

    setSubmitting(false);

    if (error) {
      setFormError("Não foi possível publicar o anúncio.");
      return;
    }

    setFormSuccess(true);
    setTitle("");
    setDescription("");
    setPrice("");
    setImage(null);
    load();
  }

  const filteredAll = items.filter(
    (item) =>
      item.status === "disponivel" &&
      item.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Card>
      <CardHeader
        icon="🛍️"
        title="Lojinha"
        actions={
          <div className="flex gap-1 rounded-pill bg-white/20 p-1">
            {(["meus", "todos", "anunciar"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-pill px-3 py-1.5 text-xs font-bold transition-colors ${
                  tab === t ? "bg-white text-sky-700" : "text-white/90 hover:bg-white/10"
                }`}
              >
                {t === "meus" ? "Meus Anúncios" : t === "todos" ? "Todos" : "+ Anunciar"}
              </button>
            ))}
          </div>
        }
      />
      <CardBody className="flex flex-col gap-4">
        {tab === "todos" && (
          <>
            <Input
              placeholder="🔍 Buscar item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {loading ? (
              <p className="text-sm text-foreground-muted">Carregando itens...</p>
            ) : filteredAll.length === 0 ? (
              <EmptyState title="Nenhum item disponível no momento." icon="🛍️" />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAll.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    ownerName={owners[item.owner_id]}
                    isOwner={item.owner_id === userId}
                    onChangeStatus={(status) => updateStatus(item, status)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "meus" &&
          (myItems.length === 0 ? (
            <EmptyState title="Você ainda não anunciou nenhum item." icon="📭" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isOwner
                  onChangeStatus={(status) => updateStatus(item, status)}
                />
              ))}
            </div>
          ))}

        {tab === "anunciar" && (
          <form onSubmit={handleAnunciar} className="flex flex-col gap-4">
            <FieldGroup label="Título *" htmlFor="title">
              <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
            </FieldGroup>
            <FieldGroup label="Descrição" htmlFor="description">
              <Textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="Valor (R$) *" htmlFor="price">
              <Input
                id="price"
                inputMode="decimal"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="Foto" htmlFor="image">
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                className="w-full text-sm"
              />
            </FieldGroup>

            {formError && <p className="text-sm font-semibold text-danger-700">{formError}</p>}
            {formSuccess && (
              <p className="text-sm font-semibold text-success-700">Anúncio publicado!</p>
            )}

            <Button type="submit" disabled={submitting}>
              {submitting ? "Publicando..." : "Publicar anúncio"}
            </Button>
          </form>
        )}
      </CardBody>
    </Card>
  );
}
