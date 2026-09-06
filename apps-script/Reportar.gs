/**
 * Reportar.gs — reportar erro/sugestão.
 */

function getMyReportes(token) {
  const user = requireSession_(token);
  return findWhere_("Reportes", function (r) { return r.user_id === user.id; })
    .sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
}

function createReporte(token, payload) {
  const user = requireSession_(token);
  if (!payload.message) throw new Error("Escreva uma mensagem.");
  return insertRecord_("Reportes", {
    user_id: user.id,
    type: payload.type || "sugestao",
    message: payload.message,
    status: "aberto",
    updated_at: nowIso_(),
  });
}
