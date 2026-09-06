"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Claim, ClaimStatus } from "@/lib/supabase/types";
import { CLAIM_STATUS_LABEL } from "@/lib/status";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Select, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatBRL } from "@/lib/utils";

interface ClaimRow extends Claim {
  cegs: { name: string } | null;
  profiles: { username: string; full_name: string } | null;
}

export default function AdminClaimsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [edits, setEdits] = useState<Record<string, Partial<Claim>>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("claims")
      .select("*, cegs(name), profiles(username, full_name)")
      .order("created_at", { ascending: false });
    setClaims((data ?? []) as ClaimRow[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setEdit(id: string, patch: Partial<Claim>) {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  async function saveClaim(claim: ClaimRow) {
    const patch = edits[claim.id];
    if (!patch) return;
    setSavingId(claim.id);
    await supabase.from("claims").update(patch).eq("id", claim.id);
    setSavingId(null);
    setEdits((prev) => {
      const next = { ...prev };
      delete next[claim.id];
      return next;
    });
    load();
  }

  const filtered = claims.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.profiles?.username.toLowerCase().includes(term) ||
      c.profiles?.full_name.toLowerCase().includes(term) ||
      c.cegs?.name.toLowerCase().includes(term)
    );
  });

  return (
    <Card>
      <CardHeader icon="📋" title="Todas as Claims" />
      <CardBody className="flex flex-col gap-4">
        <Input
          placeholder="🔍 Buscar por joiner ou CEG..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <p className="text-sm text-foreground-muted">Carregando...</p>
        ) : filtered.length === 0 ? (
          <EmptyState title="Nenhuma claim encontrada." icon="📭" />
        ) : (
          <div className="overflow-x-auto rounded-control border-2 border-sky-100">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-surface-muted text-foreground-muted">
                <tr>
                  <th className="px-3 py-2 font-semibold">Joiner</th>
                  <th className="px-3 py-2 font-semibold">CEG</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Valor (R$)</th>
                  <th className="px-3 py-2 font-semibold">Prazo</th>
                  <th className="px-3 py-2 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((claim) => {
                  const edit = edits[claim.id];
                  return (
                    <tr key={claim.id} className="border-t border-sky-100">
                      <td className="px-3 py-2">
                        {claim.profiles?.full_name}
                        <br />
                        <span className="text-xs text-foreground-muted">
                          @{claim.profiles?.username}
                        </span>
                      </td>
                      <td className="px-3 py-2">{claim.cegs?.name}</td>
                      <td className="px-3 py-2">
                        <Select
                          value={edit?.status ?? claim.status}
                          onChange={(e) =>
                            setEdit(claim.id, { status: e.target.value as ClaimStatus })
                          }
                          className="py-1.5 text-xs"
                        >
                          {Object.entries(CLAIM_STATUS_LABEL).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          inputMode="decimal"
                          className="py-1.5 text-xs"
                          value={edit?.total_value ?? claim.total_value}
                          onChange={(e) =>
                            setEdit(claim.id, { total_value: Number(e.target.value) || 0 })
                          }
                        />
                        <span className="text-xs text-foreground-muted">
                          {formatBRL(edit?.total_value ?? claim.total_value)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="date"
                          className="py-1.5 text-xs"
                          value={(edit?.due_date ?? claim.due_date) || ""}
                          onChange={(e) => setEdit(claim.id, { due_date: e.target.value })}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Button
                          size="sm"
                          variant="success"
                          disabled={!edit || savingId === claim.id}
                          onClick={() => saveClaim(claim)}
                        >
                          Salvar
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
