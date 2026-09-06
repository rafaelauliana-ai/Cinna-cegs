"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

const USERNAME_REGEX = /^[a-z0-9_.]{3,30}$/;

export default function CadastroPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);

    const cleanUsername = username.trim().replace(/^@/, "").toLowerCase();

    if (!USERNAME_REGEX.test(cleanUsername)) {
      setError("O @ deve ter 3-30 caracteres: letras minúsculas, números, \".\" ou \"_\".");
      return;
    }
    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!acceptedRules) {
      setError("Você precisa aceitar as regras da comunidade para continuar.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          username: cleanUsername,
          full_name: fullName.trim(),
          phone: phone.trim(),
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(
        signUpError.message.includes("already registered")
          ? "Esse e-mail já está cadastrado."
          : "Não foi possível criar sua conta. Verifique os dados e tente novamente.",
      );
      return;
    }

    if (data.session) {
      await supabase
        .from("profiles")
        .update({ accepted_rules_at: new Date().toISOString() })
        .eq("id", data.user!.id);

      setLoading(false);
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setLoading(false);
    setInfo("Conta criada! Confira seu e-mail para confirmar o cadastro antes de entrar.");
  }

  return (
    <Card>
      <CardHeader icon="📝" title="Criar Conta" />
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldGroup label="Nome" htmlFor="fullName">
            <Input
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </FieldGroup>

          <FieldGroup label="@ (identificador único)" htmlFor="username">
            <Input
              id="username"
              placeholder="@seuUsuario"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FieldGroup>

          <FieldGroup label="E-mail" htmlFor="email">
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FieldGroup>

          <FieldGroup
            label="Telefone (com DDD)"
            htmlFor="phone"
            hint="Digite apenas números, incluindo DDD. Ex: 11999999999"
          >
            <Input
              id="phone"
              placeholder="11999999999"
              inputMode="numeric"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </FieldGroup>

          <FieldGroup label="Senha" htmlFor="password">
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FieldGroup>

          <FieldGroup label="Confirmar senha" htmlFor="confirmPassword">
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </FieldGroup>

          <label className="flex items-start gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-sky-500"
              checked={acceptedRules}
              onChange={(e) => setAcceptedRules(e.target.checked)}
            />
            Li e concordo com as{" "}
            <Link href="/regras" target="_blank" className="font-semibold text-sky-600 hover:underline">
              regras e termos da CEG
            </Link>
          </label>

          {error && <p className="text-sm font-semibold text-danger-700">{error}</p>}
          {info && <p className="text-sm font-semibold text-success-700">{info}</p>}

          <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
            {loading ? "Criando..." : "Criar conta"}
          </Button>

          <p className="text-center text-sm text-foreground-muted">
            Já tem conta?{" "}
            <Link href="/login" className="font-semibold text-sky-600 hover:underline">
              Faça login
            </Link>
          </p>
        </form>
      </CardBody>
    </Card>
  );
}
