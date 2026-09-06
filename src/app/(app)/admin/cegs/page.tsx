"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Ceg, Product } from "@/lib/supabase/types";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FieldGroup, Input, Select } from "@/components/ui/Input";
import { formatBRL } from "@/lib/utils";

export default function AdminCegsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [cegs, setCegs] = useState<Ceg[]>([]);
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [newCegName, setNewCegName] = useState("");
  const [creatingCeg, setCreatingCeg] = useState(false);

  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    imageUrl: "",
    variations: "",
  });
  const [savingProduct, setSavingProduct] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("cegs").select("*").order("created_at", { ascending: false });
    setCegs((data ?? []) as Ceg[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadProducts(cegId: string) {
    const { data } = await supabase.from("products").select("*").eq("ceg_id", cegId).order("name");
    setProducts((prev) => ({ ...prev, [cegId]: (data ?? []) as Product[] }));
  }

  async function toggleExpand(cegId: string) {
    if (expanded === cegId) {
      setExpanded(null);
      return;
    }
    setExpanded(cegId);
    if (!products[cegId]) await loadProducts(cegId);
  }

  async function handleCreateCeg(event: FormEvent) {
    event.preventDefault();
    if (!newCegName.trim()) return;
    setCreatingCeg(true);
    await supabase.from("cegs").insert({ name: newCegName.trim() });
    setNewCegName("");
    setCreatingCeg(false);
    load();
  }

  async function updateCegStatus(ceg: Ceg, status: Ceg["status"]) {
    await supabase.from("cegs").update({ status }).eq("id", ceg.id);
    load();
  }

  async function handleAddProduct(cegId: string, event: FormEvent) {
    event.preventDefault();
    setSavingProduct(true);
    const variations = productForm.variations
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    await supabase.from("products").insert({
      ceg_id: cegId,
      name: productForm.name,
      price: Number(productForm.price) || 0,
      image_url: productForm.imageUrl || null,
      variations,
    });

    setProductForm({ name: "", price: "", imageUrl: "", variations: "" });
    setSavingProduct(false);
    loadProducts(cegId);
  }

  async function removeProduct(cegId: string, productId: string) {
    await supabase.from("products").delete().eq("id", productId);
    loadProducts(cegId);
  }

  return (
    <Card>
      <CardHeader icon="📊" title="CEGs & Produtos" />
      <CardBody className="flex flex-col gap-5">
        <form onSubmit={handleCreateCeg} className="flex gap-2">
          <Input
            placeholder="Nome da nova CEG"
            value={newCegName}
            onChange={(e) => setNewCegName(e.target.value)}
          />
          <Button type="submit" disabled={creatingCeg}>
            + Criar CEG
          </Button>
        </form>

        {loading ? (
          <p className="text-sm text-foreground-muted">Carregando...</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {cegs.map((ceg) => (
              <li key={ceg.id} className="rounded-control border-2 border-sky-100">
                <div className="flex flex-wrap items-center justify-between gap-2 p-3">
                  <button
                    onClick={() => toggleExpand(ceg.id)}
                    className="font-heading font-bold text-foreground hover:underline"
                  >
                    {expanded === ceg.id ? "▾" : "▸"} {ceg.name}
                  </button>
                  <div className="flex items-center gap-2">
                    <Select
                      value={ceg.status}
                      onChange={(e) => updateCegStatus(ceg, e.target.value as Ceg["status"])}
                      className="w-auto py-1.5 text-xs"
                    >
                      <option value="em_andamento">Em andamento</option>
                      <option value="finalizada">Finalizada</option>
                      <option value="cancelada">Cancelada</option>
                    </Select>
                  </div>
                </div>

                {expanded === ceg.id && (
                  <div className="border-t border-sky-100 bg-surface-muted p-3">
                    <ul className="mb-3 flex flex-col gap-2">
                      {(products[ceg.id] ?? []).map((product) => (
                        <li
                          key={product.id}
                          className="flex items-center justify-between rounded-control bg-white px-3 py-2 text-sm"
                        >
                          <span>
                            {product.name} — {formatBRL(product.price)}
                            {product.variations.length > 0 && (
                              <Badge tone="neutral" className="ml-2">
                                {product.variations.length} variações
                              </Badge>
                            )}
                          </span>
                          <button
                            onClick={() => removeProduct(ceg.id, product.id)}
                            className="text-xs font-semibold text-danger-700 hover:underline"
                          >
                            remover
                          </button>
                        </li>
                      ))}
                      {(products[ceg.id] ?? []).length === 0 && (
                        <p className="text-sm text-foreground-muted">Nenhum produto ainda.</p>
                      )}
                    </ul>

                    <form
                      onSubmit={(e) => handleAddProduct(ceg.id, e)}
                      className="grid grid-cols-1 gap-2 sm:grid-cols-4"
                    >
                      <FieldGroup label="Nome" htmlFor={`name-${ceg.id}`}>
                        <Input
                          id={`name-${ceg.id}`}
                          required
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        />
                      </FieldGroup>
                      <FieldGroup label="Preço (R$)" htmlFor={`price-${ceg.id}`}>
                        <Input
                          id={`price-${ceg.id}`}
                          inputMode="decimal"
                          required
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        />
                      </FieldGroup>
                      <FieldGroup label="URL da imagem" htmlFor={`img-${ceg.id}`}>
                        <Input
                          id={`img-${ceg.id}`}
                          value={productForm.imageUrl}
                          onChange={(e) =>
                            setProductForm({ ...productForm, imageUrl: e.target.value })
                          }
                        />
                      </FieldGroup>
                      <FieldGroup
                        label="Variações"
                        htmlFor={`var-${ceg.id}`}
                        hint="separadas por vírgula"
                      >
                        <Input
                          id={`var-${ceg.id}`}
                          value={productForm.variations}
                          onChange={(e) =>
                            setProductForm({ ...productForm, variations: e.target.value })
                          }
                        />
                      </FieldGroup>
                      <Button type="submit" size="sm" className="sm:col-span-4" disabled={savingProduct}>
                        + Adicionar produto
                      </Button>
                    </form>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
