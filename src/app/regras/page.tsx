import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

// TODO(Rafa): substitua todo o conteúdo abaixo pelo texto real das regras do
// seu site (cinnamon-cegs.vercel.app). Isto é só um esqueleto de exemplo com
// as seções que a especificação pediu.
const SECOES = [
  {
    title: "🌷 Informações Essenciais",
    body: `Esta é uma CEG conduzida por Rafaela (@pur_pleki). Todos aqui são bem-vindos,
mas cada um precisa conhecer as regras para manter tudo funcionando.`,
  },
  {
    title: "⚙️ Como funciona a CEG",
    body: "TODO: explique aqui o passo a passo — claim, cotação, pagamento, repasse e envio.",
  },
  {
    title: "🌍 Riscos de compras internacionais",
    body: "TODO: descreva os riscos (atrasos, itens sold, taxas alfandegárias etc).",
  },
  {
    title: "📦 Avarias e reembolsos",
    body: "TODO: política de avarias e reembolsos.",
  },
  {
    title: "💳 Pagamento e atrasos",
    body: "TODO: prazos de pagamento e o que acontece em caso de atraso.",
  },
  {
    title: "🔁 Repasses",
    body: "TODO: como funcionam os repasses de valores.",
  },
  {
    title: "❌ Cancelamentos",
    body: "TODO: política de cancelamento de claims.",
  },
  {
    title: "🎁 Pedidos individuais",
    body: "TODO: regras específicas para pedidos individuais (fora de CEG).",
  },
  {
    title: "🚚 Envio nacional e armazenamento",
    body: "TODO: como funciona o envio dentro do Brasil e por quanto tempo os itens ficam guardados.",
  },
  {
    title: "📦 Taxa de embalagem",
    body: "TODO: valor e regras da taxa de embalagem.",
  },
  {
    title: "💙 Clima da comunidade",
    body: "TODO: tom e expectativas de convivência na comunidade.",
  },
  {
    title: "⚠️ Consequências de descumprimento",
    body: "TODO: o que acontece quando as regras não são seguidas.",
  },
];

export default async function RegrasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-10">
      <Link
        href={user ? "/dashboard" : "/"}
        className="text-sm font-semibold text-sky-600 hover:underline"
      >
        ← {user ? "Voltar ao Dashboard" : "Voltar para a página inicial"}
      </Link>

      <Card>
        <CardHeader icon="📖" title="Regras da Comunidade" />
        <CardBody className="flex flex-col gap-5">
          {SECOES.map((secao) => (
            <div key={secao.title}>
              <h3 className="mb-1 font-heading font-bold text-sky-700">{secao.title}</h3>
              <p className="whitespace-pre-line text-sm text-foreground-muted">{secao.body}</p>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
