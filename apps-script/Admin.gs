/**
 * Admin.gs — funções exclusivas da master (Rafa). Cada uma chama
 * requireMaster_ logo de cara, então nunca executam pra um joiner comum.
 */

function driveViewUrl_(fileId) {
  return fileId ? "https://drive.google.com/uc?export=view&id=" + fileId : "";
}

function adminGetOverview(token) {
  requireMaster_(token);
  const claims = readAll_("Claims");
  return {
    joiners: readAll_("Usuarios").length,
    openClaims: claims.filter(function (c) { return c.status !== "entregue" && c.status !== "cancelado"; }).length,
    pendingComprovantes: findWhere_("ComprovantesPagamento", function (c) { return c.status === "enviado"; }).length,
    pendingPocamarket: findWhere_("PocamarketRequests", function (p) { return p.status === "pendente"; }).length,
    openReportes: findWhere_("Reportes", function (r) { return r.status === "aberto"; }).length,
  };
}

function adminGetJoiners(token) {
  requireMaster_(token);
  return readAll_("Usuarios").sort(function (a, b) { return a.full_name.localeCompare(b.full_name); });
}

function adminGetCotacoes(token) {
  requireMaster_(token);
  const users = readAll_("Usuarios");
  const userMap = {};
  users.forEach(function (u) { userMap[u.id] = u.username; });

  return readAll_("Cotacoes").map(function (c) {
    return Object.assign({}, c, { username: userMap[c.user_id] || "?", proof_view_url: driveViewUrl_(c.proof_url) });
  }).sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
}

function adminUpdateCotacaoStatus(token, id, status) {
  requireMaster_(token);
  updateRecord_("Cotacoes", id, { status: status });
  return true;
}

function adminGetComprovantes(token) {
  requireMaster_(token);
  const users = readAll_("Usuarios");
  const userMap = {};
  users.forEach(function (u) { userMap[u.id] = u.username; });

  return readAll_("ComprovantesPagamento").map(function (c) {
    return Object.assign({}, c, { username: userMap[c.user_id] || "?", proof_view_url: driveViewUrl_(c.proof_url) });
  }).sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
}

function adminUpdateComprovanteStatus(token, id, status) {
  requireMaster_(token);
  updateRecord_("ComprovantesPagamento", id, { status: status });
  return true;
}

function adminGetPocamarket(token) {
  requireMaster_(token);
  const users = readAll_("Usuarios");
  const userMap = {};
  users.forEach(function (u) { userMap[u.id] = u.username; });

  return readAll_("PocamarketRequests").map(function (p) {
    return Object.assign({}, p, { username: userMap[p.user_id] || "?" });
  }).sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
}

function adminUpdatePocamarket(token, id, patch) {
  requireMaster_(token);
  updateRecord_("PocamarketRequests", id, patch);
  return true;
}

function adminGetReportes(token) {
  requireMaster_(token);
  const users = readAll_("Usuarios");
  const userMap = {};
  users.forEach(function (u) { userMap[u.id] = u.username; });

  return readAll_("Reportes").map(function (r) {
    return Object.assign({}, r, { username: userMap[r.user_id] || "?" });
  }).sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
}

function adminUpdateReporte(token, id, patch) {
  requireMaster_(token);
  updateRecord_("Reportes", id, patch);
  return true;
}
