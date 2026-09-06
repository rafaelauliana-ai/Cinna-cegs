import type { SupabaseClient } from "@supabase/supabase-js";
import type { Claim, ClaimItem } from "@/lib/supabase/types";

export interface ClaimWithDetails extends Claim {
  cegs: { name: string } | null;
  claim_items: ClaimItem[];
}

export async function getClaimsForUser(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("claims")
    .select("*, cegs(name), claim_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []) as ClaimWithDetails[];
}
