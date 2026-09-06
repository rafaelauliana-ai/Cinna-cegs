"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const cleanUsername = username.trim().replace(/^@/, "").toLowerCase();

    const { data: email, error: lookupError } = await supabase.rpc(
      "get_email_by_username",
      { p_username: cleanUsername },
    );

    if (lookupError || !email) {
      setError("Usuário ou senha inválidos.");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("Usuário ou senha inválidos.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader icon="🔐" title="Login" />
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldGroup label="Usuário (@)" htmlFor="username">
            <Input
              id="username"
              placeholder="@seuUsuario"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FieldGroup>
          <FieldGroup label="Senha" htmlFor="password">
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FieldGroup>

          {error && <p className="text-sm font-semibold text-danger-700">{error}</p>}

          <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <div className="flex flex-col items-center gap-2 pt-2 text-sm">
            <p className="text-foreground-muted">
              Ainda não tem conta?{" "}
              <Link href="/cadastro" className="font-semibold text-sky-600 hover:underline">
                Cadastre-se
              </Link>
            </p>
            <Link href="/" className="text-foreground-muted hover:underline">
              ← Voltar para a página inicial
            </Link>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
