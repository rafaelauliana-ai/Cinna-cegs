import type { SupabaseClient } from "@supabase/supabase-js";
import type { Claim, ClaimItem } from "@/lib/supabase/types";

const OPEN_STATUSES = [
  "nao_confirmado",
  "aguardando_pagamento",
  "cotacao_pendente",
  "comprado",
  "aguardando_repasse",
  "nacional_liberado",
  "envio_solicitado",
] as const;

export interface DashboardStats {
  totalItens: number;
  valorPendente: number;
  prazosProximos: Claim[];
  itensEmAtraso: Claim[];
  avisosNaoVisualizados: number;
}

export async function getDashboardStats(
  supabase: SupabaseClient,
  userId: string,
): Promise<DashboardStats> {
  const { data: claims } = await supabase
    .from("claims")
    .select("id, user_id, ceg_id, status, total_value, due_date, notes, created_at, updated_at")
    .eq("user_id", userId);

  const claimList = (claims ?? []) as Claim[];
  const openClaims = claimList.filter((c) => c.status !== "entregue" && c.status !== "cancelado");

  const claimIds = openClaims.map((c) => c.id);
  let claimItems: ClaimItem[] = [];
  if (claimIds.length > 0) {
    const { data: items } = await supabase
      .from("claim_items")
      .select("id, claim_id, product_id, product_name, variation, unit_price, quantity")
      .in("claim_id", claimIds);
    claimItems = (items ?? []) as ClaimItem[];
  }

  const totalItens = claimItems.reduce((sum, item) => sum + item.quantity, 0);

  const valorPendente = claimList
    .filter((c) => c.status === "nao_confirmado" || c.status === "aguardando_pagamento")
    .reduce((sum, c) => sum + Number(c.total_value), 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in5Days = new Date(today);
  in5Days.setDate(in5Days.getDate() + 5);

  const withDueDate = openClaims.filter((c) => c.due_date);
  const prazosProximos = withDueDate.filter((c) => {
    const due = new Date(c.due_date as string);
    return due >= today && due <= in5Days;
  });
  const itensEmAtraso = withDueDate.filter((c) => new Date(c.due_date as string) < today);

  const { data: avisos } = await supabase
    .from("avisos")
    .select("id")
    .or(`target_user_id.eq.${userId},target_user_id.is.null`);

  const avisoIds = (avisos ?? []).map((a: { id: string }) => a.id);
  let readIds: string[] = [];
  if (avisoIds.length > 0) {
    const { data: reads } = await supabase
      .from("aviso_reads")
      .select("aviso_id")
      .eq("user_id", userId)
      .in("aviso_id", avisoIds);
    readIds = (reads ?? []).map((r: { aviso_id: string }) => r.aviso_id);
  }

  return {
    totalItens,
    valorPendente,
    prazosProximos,
    itensEmAtraso,
    avisosNaoVisualizados: avisoIds.length - readIds.length,
  };
}

export { OPEN_STATUSES };
