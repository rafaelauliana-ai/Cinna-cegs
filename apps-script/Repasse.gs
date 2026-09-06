/**
 * Repasse.gs
 */

function getMyRepasses(token) {
  const user = requireSession_(token);
  return findWhere_("Repasses", function (r) { return r.user_id === user.id; })
    .sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
}

function requestRepasse(token, claimIds) {
  const user = requireSession_(token);
  if (!claimIds || claimIds.length === 0) throw new Error("Selecione ao menos uma claim.");

  const repasse = insertRecord_("Repasses", { user_id: user.id, status: "solicitado" });
  insertMany_("RepasseClaims", claimIds.map(function (claimId) {
    return { repasse_id: repasse.id, claim_id: claimId };
  }));
  return repasse;
}
