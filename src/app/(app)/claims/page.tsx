import { createClient } from "@/lib/supabase/server";
import { getClaimsForUser } from "@/lib/data/claims";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ClaimsExplorer } from "@/components/claims/ClaimsExplorer";

export default async function MinhasClaimsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const claims = await getClaimsForUser(supabase, user!.id);

  return (
    <Card>
      <CardHeader icon="📋" title="Minhas Claims" />
      <CardBody>
        <ClaimsExplorer claims={claims} />
      </CardBody>
    </Card>
  );
}
