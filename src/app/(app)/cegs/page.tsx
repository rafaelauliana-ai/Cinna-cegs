import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Ceg } from "@/lib/supabase/types";

const STATUS_LABEL: Record<Ceg["status"], string> = {
  em_andamento: "Em andamento",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
};

const STATUS_TONE: Record<Ceg["status"], "warning" | "success" | "danger"> = {
  em_andamento: "warning",
  finalizada: "success",
  cancelada: "danger",
};

export default async function CegsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("cegs").select("*").order("name");
  const cegs = (data ?? []) as Ceg[];

  return (
    <Card>
      <CardHeader icon="📊" title="CEGs em Andamento" />
      <CardBody>
        {cegs.length === 0 ? (
          <EmptyState title="Nenhuma CEG cadastrada ainda." icon="🌱" />
        ) : (
          <ul className="flex flex-col divide-y divide-sky-100">
            {cegs.map((ceg) => (
              <li key={ceg.id} className="flex items-center justify-between py-3">
                <span className="font-heading font-bold text-foreground">{ceg.name}</span>
                <Badge tone={STATUS_TONE[ceg.status]}>{STATUS_LABEL[ceg.status]}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
