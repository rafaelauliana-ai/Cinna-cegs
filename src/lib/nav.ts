import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Bell,
  BarChart3,
  PlusCircle,
  ClipboardList,
  Calculator,
  Repeat,
  Truck,
  Upload,
  Bug,
  Store,
  ShoppingBag,
  BookOpen,
  UserCog,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  tourId: string;
  tourText: string;
}

// Itens principais do menu lateral (hambúrguer), na ordem da especificação.
export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    tourId: "nav-dashboard",
    tourText: "Sua página inicial: um resumo rápido de itens, valores pendentes, prazos e avisos.",
  },
  {
    href: "/avisos",
    label: "Avisos",
    icon: Bell,
    tourId: "nav-avisos",
    tourText: "Notificações do sistema: novas CEGs, status alterado, comprovantes, cotações e mais.",
  },
  {
    href: "/cegs",
    label: "CEGs em Andamento",
    icon: BarChart3,
    tourId: "nav-cegs",
    tourText: "Lista de todas as compras em grupo ativas no momento.",
  },
  {
    href: "/claims/nova",
    label: "Nova Claim",
    icon: PlusCircle,
    tourId: "nav-nova-claim",
    tourText: "Escolha uma CEG, adicione produtos ao carrinho e confirme seu pedido (claim).",
  },
  {
    href: "/claims",
    label: "Minhas Claims",
    icon: ClipboardList,
    tourId: "nav-minhas-claims",
    tourText: "Acompanhe todos os seus pedidos, com filtros e visão em tabela ou cards.",
  },
  {
    href: "/cotacao",
    label: "Cotação",
    icon: Calculator,
    tourId: "nav-cotacao",
    tourText: "Converta Dólar para Real (com a cotação do dia + taxa) e confirme uma compra feita, anexando o comprovante.",
  },
  {
    href: "/repasse",
    label: "Solicitar Repasse",
    icon: Repeat,
    tourId: "nav-repasse",
    tourText: "Peça o repasse do valor de claims elegíveis (já pagas e liberadas).",
  },
  {
    href: "/envio-nacional",
    label: "Envio Nacional",
    icon: Truck,
    tourId: "nav-envio-nacional",
    tourText: "Solicite o envio dos itens liberados nacionalmente, sozinho ou combinado com outro joiner.",
  },
  {
    href: "/comprovante",
    label: "Enviar Comprovante",
    icon: Upload,
    tourId: "nav-comprovante",
    tourText: "Anexe o comprovante de pagamento das suas claims (PIX ou cartão).",
  },
  {
    href: "/pocamarket",
    label: "Pocamarket",
    icon: ShoppingBag,
    tourId: "nav-pocamarket",
    tourText: "Busque grupos, envie o link de um anúncio e acompanhe o status do seu pedido.",
  },
  {
    href: "/lojinha",
    label: "Lojinha",
    icon: Store,
    tourId: "nav-lojinha",
    tourText: "Vitrine de itens disponíveis para repasse entre membros da comunidade.",
  },
  {
    href: "/reportar",
    label: "Reportar Erro / Sugestão",
    icon: Bug,
    tourId: "nav-reportar",
    tourText: "Encontrou um bug ou tem uma ideia? Conte pra gente por aqui.",
  },
];

export const NAV_ITEMS_SECONDARY: NavItem[] = [
  {
    href: "/tutorial",
    label: "Como Usar",
    icon: HelpCircle,
    tourId: "nav-tutorial",
    tourText: "Um tour guiado explicando o que cada parte do site faz.",
  },
  {
    href: "/regras",
    label: "Regras",
    icon: BookOpen,
    tourId: "nav-regras",
    tourText: "As regras completas da comunidade.",
  },
  {
    href: "/conta",
    label: "Minha Conta",
    icon: UserCog,
    tourId: "nav-conta",
    tourText: "Seus dados pessoais, endereço e senha.",
  },
];

export const NAV_ITEM_ADMIN: NavItem = {
  href: "/admin",
  label: "Administração",
  icon: ShieldCheck,
  tourId: "nav-admin",
  tourText: "Área só sua (master): gerencie CEGs, produtos, claims e avisos de todo mundo.",
};
