import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col items-center gap-10 px-4 py-14">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="text-5xl">☁️🤍</span>
        <h1 className="font-heading text-3xl font-extrabold text-sky-700 sm:text-4xl">
          Bem-vindo à Cinnamon Cegs!
        </h1>
        <p className="max-w-md text-foreground-muted">
          Comunidade de compras em grupo (CEG) de photocards, merchs e outros itens.
          Aqui você acompanha suas claims, cotações, repasses e envios num painel só seu.
        </p>
        <div className="mt-2 flex gap-3">
          <Link href="/login" className={buttonClasses("primary", "lg")}>
            Entrar
          </Link>
          <Link href="/cadastro" className={buttonClasses("outline", "lg")}>
            Criar conta
          </Link>
        </div>
      </div>

      <Card className="w-full max-w-2xl">
        <CardBody className="flex flex-col gap-3">
          <h2 className="font-heading text-xl font-bold text-sky-700">📖 Regras da Comunidade</h2>
          <p className="text-sm text-foreground-muted">
            Antes de participar, leia as regras completas — como funciona a CEG, riscos de
            compras internacionais, pagamentos, repasses e envios.
          </p>
          <Link href="/regras" className="text-sm font-semibold text-sky-600 hover:underline">
            Ler as regras completas →
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
