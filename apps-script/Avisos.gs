/**
 * Avisos.gs
 */

function getMyAvisos(token) {
  const user = requireSession_(token);
  const avisos = findWhere_("Avisos", function (a) { return !a.target_user_id || a.target_user_id === user.id; });
  const reads = findWhere_("AvisoReads", function (r) { return r.user_id === user.id; });
  const readIds = reads.map(function (r) { return r.aviso_id; });

  return avisos
    .map(function (a) { return Object.assign({}, a, { is_read: readIds.indexOf(a.id) !== -1 }); })
    .sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
}

function markAvisoRead(token, avisoId) {
  const user = requireSession_(token);
  const already = findWhere_("AvisoReads", function (r) { return r.aviso_id === avisoId && r.user_id === user.id; });
  if (already.length === 0) {
    insertRecord_("AvisoReads", { aviso_id: avisoId, user_id: user.id, read_at: nowIso_() });
  }
  return true;
}

function markAllAvisosRead(token) {
  const user = requireSession_(token);
  const avisos = getMyAvisos(token);
  const toMark = avisos.filter(function (a) { return !a.is_read; });
  insertMany_("AvisoReads", toMark.map(function (a) {
    return { aviso_id: a.id, user_id: user.id, read_at: nowIso_() };
  }));
  return true;
}

// ---------------- Admin ----------------

function adminSendAviso(token, payload) {
  const user = requireMaster_(token);
  if (!payload.title) throw new Error("Título é obrigatório.");
  return insertRecord_("Avisos", {
    target_user_id: payload.targetUserId || "",
    type: payload.type || "geral",
    title: payload.title,
    message: payload.message || "",
    created_by: user.id,
  });
}

function adminGetRecentAvisos(token) {
  requireMaster_(token);
  return readAll_("Avisos").sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); }).slice(0, 30);
}
