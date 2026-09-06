import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { Input, Select, FieldGroup } from "@/components/ui/Input";

// Página só pra visualizar a base da estética (cores, tipografia, componentes)
// sem precisar de login/Supabase configurado. Não faz parte do menu do site.
export default function PreviewPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center gap-2">
        <span className="text-3xl">☁️</span>
        <h1 className="font-heading text-2xl font-extrabold text-sky-700">Cinnamon Cegs</h1>
      </div>
      <p className="text-sm text-foreground-muted">
        Esta página é só um mostruário da identidade visual (cores, tipografia, botões,
        cards) — não faz parte do site final.
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard icon="📦" label="Total de Itens" value={12} tone="sky" />
        <StatCard icon="💰" label="Valor Pendente" value="R$ 245,00" hint="Pagamento de itens" tone="danger" />
        <StatCard icon="📅" label="Prazos Próximos" value={2} hint="Até 5 dias" tone="warning" />
        <StatCard icon="⏰" label="Itens em Atraso" value={0} tone="danger" />
        <StatCard icon="🔔" label="Avisos" value={3} hint="Não visualizados" tone="pink" />
      </div>

      <Card>
        <CardHeader icon="➕" title="Nova Claim" />
        <CardBody className="flex flex-col gap-4">
          <FieldGroup label="Selecione a CEG:">
            <Select defaultValue="thisthat">
              <option value="thisthat">THIS&amp;THAT</option>
            </Select>
          </FieldGroup>

          <div className="flex flex-col gap-3 rounded-control border-2 border-sky-100 p-3 sm:flex-row sm:items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/placeholder-product.svg" alt="" className="h-16 w-16 rounded-control object-cover" />
            <div className="flex-1">
              <p className="font-heading font-bold text-foreground">Accordion — R$ 35,00</p>
              <div className="mt-1">
                <Badge tone="neutral">8 variações</Badge>
              </div>
            </div>
            <Button variant="secondary">Adicionar</Button>
          </div>

          <FieldGroup label="Buscar item">
            <Input placeholder="🔍 Buscar item..." />
          </FieldGroup>

          <div className="flex items-center justify-between border-t border-sky-100 pt-4">
            <p className="font-heading text-lg font-bold text-foreground">Total: R$ 35,00</p>
            <div className="flex gap-2">
              <Button variant="secondary">Limpar Carrinho</Button>
              <Button variant="success">✅ Confirmar Claim</Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon="📋" title="Minhas Claims" />
        <CardBody className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge tone="neutral">Não Confirmado</Badge>
            <Badge tone="warning">Aguardando Pagamento</Badge>
            <Badge tone="success">Pago</Badge>
            <Badge tone="pink">Cotação Pendente</Badge>
            <Badge tone="sky">Nacional Liberado</Badge>
            <Badge tone="danger">Cancelado</Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 rounded-card border-2 border-sky-100 bg-white p-4 shadow-softer">
              <div className="flex items-center justify-between">
                <p className="font-heading font-bold text-foreground">THIS&amp;THAT</p>
                <Badge tone="success">Pago</Badge>
              </div>
              <ul className="text-sm text-foreground-muted">
                <li>1× Accordion (Ver. A)</li>
              </ul>
              <div className="mt-auto flex items-center justify-between border-t border-sky-100 pt-2">
                <span className="text-xs text-foreground-muted">Prazo: 12/09/2026</span>
                <span className="font-heading font-bold text-sky-700">R$ 35,00</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-card border-2 border-sky-100 bg-white p-4 shadow-softer">
              <div className="flex items-center justify-between">
                <p className="font-heading font-bold text-foreground">RUN IT Japan</p>
                <Badge tone="warning">Aguardando Pagamento</Badge>
              </div>
              <ul className="text-sm text-foreground-muted">
                <li>2× Photocard (Felix)</li>
              </ul>
              <div className="mt-auto flex items-center justify-between border-t border-sky-100 pt-2">
                <span className="text-xs text-foreground-muted">Prazo: 20/09/2026</span>
                <span className="font-heading font-bold text-sky-700">R$ 90,00</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon="🛍️" title="Lojinha" />
        <CardBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col overflow-hidden rounded-card border-2 border-sky-100 bg-white shadow-softer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/placeholder-product.svg" alt="" className="h-32 w-full object-cover" />
              <div className="flex flex-col gap-2 p-4">
                <p className="font-heading font-bold text-foreground">POB After Party — Felix</p>
                <p className="font-heading text-lg font-bold text-sky-700">R$ 45,00</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="sky">Repasse</Badge>
                  <Badge tone="success">Disponível</Badge>
                </div>
                <Button variant="success">💬 Tenho interesse!</Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon="🎨" title="Botões e cores" />
        <CardBody className="flex flex-wrap gap-2">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="success">Success</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </CardBody>
      </Card>
    </div>
  );
}
