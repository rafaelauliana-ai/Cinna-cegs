// Tipos manuais que espelham supabase/migrations/0001_init.sql.
// Se preferir, gere automaticamente depois com:
//   npx supabase gen types typescript --project-id SEU_PROJECT_ID > src/lib/supabase/types.ts

export type Role = "master" | "joiner";

export type ClaimStatus =
  | "nao_confirmado"
  | "aguardando_pagamento"
  | "pago"
  | "cotacao_pendente"
  | "comprado"
  | "aguardando_repasse"
  | "nacional_liberado"
  | "envio_solicitado"
  | "enviado"
  | "entregue"
  | "cancelado";

export type AvisoType =
  | "compra_lojinha"
  | "comprovante_enviado"
  | "envio_solicitado"
  | "nova_ceg"
  | "status_alterado"
  | "valores_atualizados"
  | "cotacao"
  | "geral"
  | "reporte_atualizado";

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: Role;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_district: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  cpf: string | null;
  accepted_rules_at: string | null;
  created_at: string;
}

export interface Ceg {
  id: string;
  name: string;
  status: "em_andamento" | "finalizada" | "cancelada";
  description: string | null;
  cover_image_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  ceg_id: string;
  name: string;
  price: number;
  image_url: string | null;
  variations: string[];
  created_at: string;
}

export interface Claim {
  id: string;
  user_id: string;
  ceg_id: string;
  status: ClaimStatus;
  total_value: number;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClaimItem {
  id: string;
  claim_id: string;
  product_id: string | null;
  product_name: string;
  variation: string | null;
  unit_price: number;
  quantity: number;
}

export interface Cotacao {
  id: string;
  claim_id: string | null;
  user_id: string;
  product_name: string;
  value_jpy: number | null;
  value_brl: number | null;
  product_link: string | null;
  proof_url: string | null;
  status: "pendente" | "confirmado" | "rejeitado";
  created_at: string;
}

export interface Aviso {
  id: string;
  target_user_id: string | null;
  type: AvisoType;
  title: string;
  message: string | null;
  created_by: string | null;
  created_at: string;
}

export interface LojinhaItem {
  id: string;
  owner_id: string;
  claim_item_id: string | null;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  status: "disponivel" | "reservado" | "vendido" | "cancelado";
  created_at: string;
}

export interface PocamarketRequest {
  id: string;
  user_id: string;
  group_query: string | null;
  listing_link: string;
  status: "pendente" | "em_andamento" | "concluido" | "cancelado";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnvioNacional {
  id: string;
  user_id: string;
  combined_with_user_id: string | null;
  status: "solicitado" | "em_transito" | "entregue" | "cancelado";
  address_snapshot: Record<string, unknown> | null;
  created_at: string;
}

export interface Repasse {
  id: string;
  user_id: string;
  status: "solicitado" | "aprovado" | "pago" | "rejeitado";
  created_at: string;
}

export interface ComprovantePagamento {
  id: string;
  user_id: string;
  claim_id: string;
  proof_url: string;
  status: "enviado" | "confirmado" | "rejeitado";
  created_at: string;
}

export interface Reporte {
  id: string;
  user_id: string;
  type: "erro" | "sugestao";
  message: string;
  status: "aberto" | "em_analise" | "resolvido";
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}
