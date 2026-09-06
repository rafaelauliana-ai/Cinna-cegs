"use client";

import { useTour } from "@/components/tour/TourContext";
import { NAV_ITEMS, NAV_ITEMS_SECONDARY, NAV_ITEM_ADMIN } from "@/lib/nav";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function TutorialPage() {
  const { start } = useTour();

  const allItems = [NAV_ITEM_ADMIN, ...NAV_ITEMS, ...NAV_ITEMS_SECONDARY].filter(
    (i) => i.href !== "/tutorial",
  );

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader icon="🎓" title="Como Usar" />
        <CardBody className="flex flex-col items-center gap-4 text-center">
          <span className="text-4xl">🧭☁️</span>
          <p className="max-w-md text-foreground-muted">
            Clique no botão abaixo para começar um tour guiado: eu vou destacando cada parte do
            site e explicando pra que ela serve. Você avança clicando em <strong>&quot;Próximo&quot;</strong>{" "}
            ou direto no item destacado.
          </p>
          <Button size="lg" onClick={start}>
            ▶️ Começar tour guiado
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon="📚" title="Resumo rápido" />
        <CardBody>
          <ul className="flex flex-col divide-y divide-sky-100">
            {allItems.map((item) => (
              <li key={item.href} className="flex items-start gap-3 py-3">
                <item.icon size={20} className="mt-0.5 shrink-0 text-sky-500" />
                <div>
                  <p className="font-semibold text-foreground">{item.label}</p>
                  <p className="text-sm text-foreground-muted">{item.tourText}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
