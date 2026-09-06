import type { ClaimStatus } from "@/lib/supabase/types";

export const CLAIM_STATUS_LABEL: Record<ClaimStatus, string> = {
  nao_confirmado: "Não Confirmado",
  aguardando_pagamento: "Aguardando Pagamento",
  pago: "Pago",
  cotacao_pendente: "Cotação Pendente",
  comprado: "Comprado",
  aguardando_repasse: "Aguardando Repasse",
  nacional_liberado: "Nacional Liberado",
  envio_solicitado: "Envio Solicitado",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const CLAIM_STATUS_TONE: Record<ClaimStatus, "sky" | "success" | "warning" | "danger" | "neutral" | "pink"> = {
  nao_confirmado: "neutral",
  aguardando_pagamento: "warning",
  pago: "success",
  cotacao_pendente: "pink",
  comprado: "sky",
  aguardando_repasse: "pink",
  nacional_liberado: "success",
  envio_solicitado: "sky",
  enviado: "sky",
  entregue: "success",
  cancelado: "danger",
};

// Claims elegíveis para "Solicitar Repasse" (regra da especificação):
// tudo, exceto Não Confirmado, Aguardando Pagamento ou vazio.
export const REPASSE_ELIGIBLE_STATUSES: ClaimStatus[] = [
  "pago",
  "cotacao_pendente",
  "comprado",
  "aguardando_repasse",
  "nacional_liberado",
  "envio_solicitado",
  "enviado",
  "entregue",
];
