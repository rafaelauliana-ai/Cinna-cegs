import { NAV_ITEMS, NAV_ITEMS_SECONDARY, NAV_ITEM_ADMIN } from "@/lib/nav";

export interface TourStep {
  id: string;
  title: string;
  text: string;
  /** data-tour-id do elemento a destacar. null = passo centralizado (sem alvo). */
  targetId: string | null;
  /** rota para navegar antes de destacar o elemento, se necessário. */
  route?: string;
}

function buildStepsFor(isMaster: boolean): TourStep[] {
  const steps: TourStep[] = [
    {
      id: "intro",
      title: "Bem-vinda ao tour! ☁️",
      text: "Vou te mostrar rapidinho pra que serve cada parte do site. Clique em \"Próximo\" (ou no próprio item destacado) para continuar.",
      targetId: null,
    },
  ];

  if (isMaster) {
    steps.push({
      id: NAV_ITEM_ADMIN.tourId,
      title: NAV_ITEM_ADMIN.label,
      text: NAV_ITEM_ADMIN.tourText,
      targetId: NAV_ITEM_ADMIN.tourId,
    });
  }

  for (const item of NAV_ITEMS) {
    steps.push({
      id: item.tourId,
      title: item.label,
      text: item.tourText,
      targetId: item.tourId,
    });
  }

  for (const item of NAV_ITEMS_SECONDARY) {
    if (item.href === "/tutorial") continue; // não faz sentido destacar o próprio tour
    steps.push({
      id: item.tourId,
      title: item.label,
      text: item.tourText,
      targetId: item.tourId,
    });
  }

  steps.push(
    {
      id: "dashboard-stats",
      title: "Resumo do Dashboard",
      text: "Esses cards mostram, de relance, quantos itens você tem, quanto está pendente de pagamento, prazos próximos, itens em atraso e avisos não lidos.",
      targetId: "dashboard-stats",
      route: "/dashboard",
    },
    {
      id: "outro",
      title: "Prontinho! 🎀",
      text: "Agora você já conhece o site inteiro. Sempre que precisar, é só voltar em \"Como Usar\" para rever esse tour.",
      targetId: null,
    },
  );

  return steps;
}

export const TOUR_STEPS_JOINER = buildStepsFor(false);
export const TOUR_STEPS_MASTER = buildStepsFor(true);
