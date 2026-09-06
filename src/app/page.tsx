import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-14 text-center">
      <span className="text-5xl">☁️🤍</span>
      <h1 className="font-heading text-3xl font-extrabold text-sky-700 sm:text-4xl">
        Bem-vindo à Cinnamon Cegs!
      </h1>
      <p className="max-w-md text-foreground-muted">
        Comunidade de compras em grupo (CEG) de photocards, merchs e outros itens.
        Entre ou crie sua conta para acessar seu painel.
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
  );
}
