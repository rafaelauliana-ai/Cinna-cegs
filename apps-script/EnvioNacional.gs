/**
 * EnvioNacional.gs
 */

function getClaimsLiberadas(token) {
  const user = requireSession_(token);
  return findWhere_("Claims", function (c) {
    return c.user_id === user.id && c.status === "nacional_liberado";
  }).map(claimWithItems_);
}

function getMeusEnvios(token) {
  const user = requireSession_(token);
  return findWhere_("EnviosNacionais", function (e) { return e.user_id === user.id; })
    .sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
}

/** Resolve um @usuario para {id, full_name}, sem expor mais nada (endereço/telefone/etc). */
function findJoinerByUsername(token, username) {
  requireSession_(token);
  const clean = String(username || "").trim().replace(/^@/, "").toLowerCase();
  const user = findWhere_("Usuarios", function (u) { return u.username === clean; })[0];
  return user ? { id: user.id, full_name: user.full_name, username: user.username } : null;
}

function requestEnvioNacional(token, payload) {
  const user = requireSession_(token);
  if (!payload.claimIds || payload.claimIds.length === 0) throw new Error("Selecione ao menos uma claim.");

  const envio = insertRecord_("EnviosNacionais", {
    user_id: user.id,
    combined_with_user_id: payload.combinedWithUserId || "",
    status: "solicitado",
  });
  insertMany_("EnvioClaims", payload.claimIds.map(function (claimId) {
    return { envio_id: envio.id, claim_id: claimId };
  }));
  return envio;
}
