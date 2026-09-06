"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Ceg, Product } from "@/lib/supabase/types";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select, FieldGroup } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatBRL } from "@/lib/utils";

interface CartItem {
  key: string;
  productId: string;
  productName: string;
  variation: string | null;
  unitPrice: number;
  quantity: number;
}

export default function NovaClaimPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [cegs, setCegs] = useState<Ceg[]>([]);
  const [cegId, setCegId] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [variationChoice, setVariationChoice] = useState<Record<string, string>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("cegs")
      .select("*")
      .eq("status", "em_andamento")
      .order("name")
      .then(({ data }) => setCegs((data ?? []) as Ceg[]));
  }, [supabase]);

  useEffect(() => {
    if (!cegId) {
      setProducts([]);
      return;
    }
    setLoadingProducts(true);
    supabase
      .from("products")
      .select("*")
      .eq("ceg_id", cegId)
      .order("name")
      .then(({ data }) => {
        setProducts((data ?? []) as Product[]);
        setLoadingProducts(false);
      });
  }, [cegId, supabase]);

  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  function addToCart(product: Product) {
    const variation = variationChoice[product.id] ?? null;
    const key = `${product.id}::${variation ?? ""}`;

    setCart((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          productName: product.name,
          variation,
          unitPrice: product.price,
          quantity: 1,
        },
      ];
    });
  }

  function removeFromCart(key: string) {
    setCart((prev) => prev.filter((i) => i.key !== key));
  }

  async function handleConfirm() {
    if (!cegId || cart.length === 0) return;
    setSubmitting(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: claim, error: claimError } = await supabase
      .from("claims")
      .insert({ user_id: user!.id, ceg_id: cegId, total_value: total })
      .select()
      .single();

    if (claimError || !claim) {
      setError("Não foi possível criar a claim. Tente novamente.");
      setSubmitting(false);
      return;
    }

    const { error: itemsError } = await supabase.from("claim_items").insert(
      cart.map((item) => ({
        claim_id: claim.id,
        product_id: item.productId,
        product_name: item.productName,
        variation: item.variation,
        unit_price: item.unitPrice,
        quantity: item.quantity,
      })),
    );

    if (itemsError) {
      setError("A claim foi criada, mas houve um erro ao salvar os itens.");
      setSubmitting(false);
      return;
    }

    router.push("/claims");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader icon="➕" title="Nova Claim" />
      <CardBody className="flex flex-col gap-5">
        <FieldGroup label="Selecione a CEG:" htmlFor="ceg">
          <Select id="ceg" value={cegId} onChange={(e) => setCegId(e.target.value)}>
            <option value="">Selecione a CEG</option>
            {cegs.map((ceg) => (
              <option key={ceg.id} value={ceg.id}>
                {ceg.name}
              </option>
            ))}
          </Select>
        </FieldGroup>

        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">Selecione um produto:</p>
          {!cegId && (
            <p className="rounded-control border-2 border-sky-100 px-4 py-3 text-sm text-foreground-muted">
              Selecione uma CEG para ver os produtos.
            </p>
          )}
          {cegId && loadingProducts && (
            <p className="text-sm text-foreground-muted">Carregando produtos...</p>
          )}
          {cegId && !loadingProducts && products.length === 0 && (
            <EmptyState title="Nenhum produto cadastrado nessa CEG ainda." icon="🛍️" />
          )}
          <div className="flex flex-col gap-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-3 rounded-control border-2 border-sky-100 p-3 sm:flex-row sm:items-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image_url ?? "/placeholder-product.svg"}
                  alt={product.name}
                  className="h-16 w-16 rounded-control object-cover"
                />
                <div className="flex-1">
                  <p className="font-heading font-bold text-foreground">
                    {product.name} — {formatBRL(product.price)}
                  </p>
                  {product.variations.length > 0 && (
                    <div className="mt-1">
                      <Badge tone="neutral">{product.variations.length} variações</Badge>
                    </div>
                  )}
                  {product.variations.length > 0 && (
                    <Select
                      className="mt-2"
                      value={variationChoice[product.id] ?? ""}
                      onChange={(e) =>
                        setVariationChoice((prev) => ({ ...prev, [product.id]: e.target.value }))
                      }
                    >
                      <option value="">Escolha a variação</option>
                      {product.variations.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </Select>
                  )}
                </div>
                <Button
                  variant="secondary"
                  onClick={() => addToCart(product)}
                  disabled={product.variations.length > 0 && !variationChoice[product.id]}
                >
                  Adicionar
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">
            🛒 Carrinho ({cart.length} {cart.length === 1 ? "item" : "itens"})
          </p>
          {cart.length === 0 ? (
            <p className="rounded-control border-2 border-sky-100 px-4 py-3 text-center text-sm text-foreground-muted">
              Nenhum item no carrinho.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {cart.map((item) => (
                <li
                  key={item.key}
                  className="flex items-center justify-between rounded-control bg-surface-muted px-4 py-2 text-sm"
                >
                  <span>
                    {item.quantity}× {item.productName}
                    {item.variation ? ` (${item.variation})` : ""}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      {formatBRL(item.unitPrice * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.key)}
                      className="text-danger-700 hover:underline"
                    >
                      remover
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="text-sm font-semibold text-danger-700">{error}</p>}

        <div className="flex items-center justify-between border-t border-sky-100 pt-4">
          <p className="font-heading text-lg font-bold text-foreground">
            Total: {formatBRL(total)}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setCart([])} disabled={cart.length === 0}>
              Limpar Carrinho
            </Button>
            <Button
              variant="success"
              onClick={handleConfirm}
              disabled={cart.length === 0 || submitting}
            >
              {submitting ? "Enviando..." : "✅ Confirmar Claim"}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
