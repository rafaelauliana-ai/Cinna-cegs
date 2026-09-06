"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AdminJoinersPage() {
  const supabase = useMemo(() => createClient(), []);
  const [joiners, setJoiners] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*")
      .order("full_name")
      .then(({ data }) => {
        setJoiners((data ?? []) as Profile[]);
        setLoading(false);
      });
  }, [supabase]);

  const filtered = joiners.filter((j) => {
    const term = search.toLowerCase();
    return (
      j.full_name.toLowerCase().includes(term) ||
      j.username.toLowerCase().includes(term) ||
      j.email.toLowerCase().includes(term)
    );
  });

  return (
    <Card>
      <CardHeader icon="👥" title="Joiners" />
      <CardBody className="flex flex-col gap-4">
        <Input
          placeholder="🔍 Buscar por nome, @ ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <p className="text-sm text-foreground-muted">Carregando...</p>
        ) : filtered.length === 0 ? (
          <EmptyState title="Nenhum joiner encontrado." icon="👥" />
        ) : (
          <div className="overflow-x-auto rounded-control border-2 border-sky-100">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-surface-muted text-foreground-muted">
                <tr>
                  <th className="px-3 py-2 font-semibold">Nome</th>
                  <th className="px-3 py-2 font-semibold">@</th>
                  <th className="px-3 py-2 font-semibold">Contato</th>
                  <th className="px-3 py-2 font-semibold">Endereço</th>
                  <th className="px-3 py-2 font-semibold">Papel</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((j) => (
                  <tr key={j.id} className="border-t border-sky-100 align-top">
                    <td className="px-3 py-3 font-semibold">{j.full_name}</td>
                    <td className="px-3 py-3">@{j.username}</td>
                    <td className="px-3 py-3 text-foreground-muted">
                      {j.email}
                      <br />
                      {j.phone}
                    </td>
                    <td className="px-3 py-3 text-foreground-muted">
                      {j.address_street ? (
                        <>
                          {j.address_street}, {j.address_number}
                          {j.address_complement ? ` - ${j.address_complement}` : ""}
                          <br />
                          {j.address_district} — {j.address_city}/{j.address_state}
                          <br />
                          CEP {j.address_zip} · CPF {j.cpf}
                        </>
                      ) : (
                        "Não informado"
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={j.role === "master" ? "pink" : "sky"}>{j.role}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
