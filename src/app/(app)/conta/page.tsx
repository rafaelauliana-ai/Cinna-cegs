"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input, Select } from "@/components/ui/Input";

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export default function MinhaContaPage() {
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ type: "ok" | "error"; text: string } | null>(
    null,
  );

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      setProfile(data as Profile);
      setLoading(false);
    })();
  }, [supabase]);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        address_street: profile.address_street,
        address_number: profile.address_number,
        address_complement: profile.address_complement,
        address_district: profile.address_district,
        address_city: profile.address_city,
        address_state: profile.address_state,
        address_zip: profile.address_zip,
        cpf: profile.cpf,
      })
      .eq("id", profile.id);

    setSaving(false);
    if (updateError) {
      setError("Não foi possível salvar. Tente novamente.");
      return;
    }
    setSuccess(true);
  }

  async function handlePasswordChange() {
    setPasswordMsg(null);
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "A senha precisa ter pelo menos 6 caracteres." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "As senhas não coincidem." });
      return;
    }
    const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
    if (pwError) {
      setPasswordMsg({ type: "error", text: "Não foi possível atualizar a senha." });
      return;
    }
    setPasswordMsg({ type: "ok", text: "Senha atualizada com sucesso!" });
    setNewPassword("");
    setConfirmPassword("");
  }

  if (loading || !profile) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-foreground-muted">Carregando...</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader icon="👤" title="Minha Conta" />
      <CardBody>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <h3 className="font-heading font-bold text-sky-700">Dados Pessoais</h3>

          <FieldGroup label="Nome" htmlFor="full_name">
            <Input
              id="full_name"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            />
          </FieldGroup>

          <FieldGroup label="E-mail" htmlFor="email">
            <Input id="email" value={profile.email} disabled />
          </FieldGroup>

          <FieldGroup label="@ (identificador)" htmlFor="username">
            <Input id="username" value={profile.username} disabled />
          </FieldGroup>

          <FieldGroup label="Telefone" htmlFor="phone">
            <Input
              id="phone"
              value={profile.phone ?? ""}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </FieldGroup>

          <h3 className="mt-2 font-heading font-bold text-sky-700">📍 Endereço</h3>
          <p className="-mt-2 text-xs text-foreground-muted">
            Usado apenas pela administradora para organizar envios. Só você e ela conseguem ver
            esses dados.
          </p>

          <FieldGroup label="Rua" htmlFor="street">
            <Input
              id="street"
              value={profile.address_street ?? ""}
              onChange={(e) => setProfile({ ...profile, address_street: e.target.value })}
            />
          </FieldGroup>

          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Número" htmlFor="number">
              <Input
                id="number"
                value={profile.address_number ?? ""}
                onChange={(e) => setProfile({ ...profile, address_number: e.target.value })}
              />
            </FieldGroup>
            <FieldGroup label="Complemento" htmlFor="complement">
              <Input
                id="complement"
                value={profile.address_complement ?? ""}
                onChange={(e) => setProfile({ ...profile, address_complement: e.target.value })}
              />
            </FieldGroup>
          </div>

          <FieldGroup label="Bairro" htmlFor="district">
            <Input
              id="district"
              value={profile.address_district ?? ""}
              onChange={(e) => setProfile({ ...profile, address_district: e.target.value })}
            />
          </FieldGroup>

          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Cidade" htmlFor="city">
              <Input
                id="city"
                value={profile.address_city ?? ""}
                onChange={(e) => setProfile({ ...profile, address_city: e.target.value })}
              />
            </FieldGroup>
            <FieldGroup label="Estado" htmlFor="state">
              <Select
                id="state"
                value={profile.address_state ?? ""}
                onChange={(e) => setProfile({ ...profile, address_state: e.target.value })}
              >
                <option value="">Selecione...</option>
                {ESTADOS.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </Select>
            </FieldGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="CEP" htmlFor="zip">
              <Input
                id="zip"
                inputMode="numeric"
                value={profile.address_zip ?? ""}
                onChange={(e) => setProfile({ ...profile, address_zip: e.target.value })}
              />
            </FieldGroup>
            <FieldGroup label="CPF" htmlFor="cpf">
              <Input
                id="cpf"
                inputMode="numeric"
                value={profile.cpf ?? ""}
                onChange={(e) => setProfile({ ...profile, cpf: e.target.value })}
              />
            </FieldGroup>
          </div>

          {error && <p className="text-sm font-semibold text-danger-700">{error}</p>}
          {success && (
            <p className="text-sm font-semibold text-success-700">Dados atualizados!</p>
          )}

          <Button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "💾 Atualizar Dados"}
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-4 border-t border-sky-100 pt-5">
          <h3 className="font-heading font-bold text-sky-700">🔑 Alterar Senha</h3>
          <FieldGroup label="Nova senha" htmlFor="newPassword" hint="Mínimo 6 caracteres">
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </FieldGroup>
          <FieldGroup label="Confirmar nova senha" htmlFor="confirmPassword">
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </FieldGroup>
          {passwordMsg && (
            <p
              className={`text-sm font-semibold ${
                passwordMsg.type === "ok" ? "text-success-700" : "text-danger-700"
              }`}
            >
              {passwordMsg.text}
            </p>
          )}
          <Button type="button" variant="secondary" onClick={handlePasswordChange}>
            Atualizar senha
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
