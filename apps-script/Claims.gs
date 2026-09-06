/**
 * Claims.gs — Nova Claim, Minhas Claims, Dashboard e gestão admin de claims.
 */

const CLAIM_STATUS_LABEL = {
  nao_confirmado: "Não Confirmado",
  aguardando_pagamento: "Aguardando Pagamento",
  pago: "Pago",
  cotacao_pendente: "Cotação Pendente",
  comprado: "Comprado",
  aguardando_repasse: "Aguardando Repasse",
  nacional_liberado: "Nacional Liberado",
  envio_solicitado: "Envio Solicitado",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const REPASSE_ELIGIBLE_STATUSES = [
  "pago", "cotacao_pendente", "comprado", "aguardando_repasse",
  "nacional_liberado", "envio_solicitado", "enviado", "entregue",
];

function cegNameById_(cegId) {
  const ceg = findById_("CEGs", cegId);
  return ceg ? ceg.name : "—";
}

function claimWithItems_(claim) {
  const items = findWhere_("ClaimItems", function (i) { return i.claim_id === claim.id; });
  return Object.assign({}, claim, { ceg_name: cegNameById_(claim.ceg_id), items: items });
}

/** payload: { cegId, items: [{productId, productName, variation, unitPrice, quantity}] } */
function createClaim(token, payload) {
  const user = requireSession_(token);
  if (!payload.cegId || !payload.items || payload.items.length === 0) {
    throw new Error("Selecione ao menos um produto.");
  }

  const total = payload.items.reduce(function (sum, i) {
    return sum + Number(i.unitPrice) * Number(i.quantity);
  }, 0);

  const claim = insertRecord_("Claims", {
    user_id: user.id,
    ceg_id: payload.cegId,
    status: "nao_confirmado",
    total_value: total,
    updated_at: nowIso_(),
  });

  insertMany_("ClaimItems", payload.items.map(function (i) {
    return {
      claim_id: claim.id,
      product_id: i.productId || "",
      product_name: i.productName,
      variation: i.variation || "",
      unit_price: Number(i.unitPrice) || 0,
      quantity: Number(i.quantity) || 1,
    };
  }));

  return claimWithItems_(claim);
}

function getMyClaims(token) {
  const user = requireSession_(token);
  return findWhere_("Claims", function (c) { return c.user_id === user.id; })
    .map(claimWithItems_)
    .sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
}

function getEligibleForRepasse(token) {
  const user = requireSession_(token);
  return findWhere_("Claims", function (c) {
    return c.user_id === user.id && REPASSE_ELIGIBLE_STATUSES.indexOf(c.status) !== -1;
  }).map(claimWithItems_);
}

function getDashboardStats(token) {
  const user = requireSession_(token);
  const claims = findWhere_("Claims", function (c) { return c.user_id === user.id; });
  const openClaims = claims.filter(function (c) { return c.status !== "entregue" && c.status !== "cancelado"; });

  const claimIds = openClaims.map(function (c) { return c.id; });
  const items = findWhere_("ClaimItems", function (i) { return claimIds.indexOf(i.claim_id) !== -1; });
  const totalItens = items.reduce(function (sum, i) { return sum + Number(i.quantity); }, 0);

  const valorPendente = claims
    .filter(function (c) { return c.status === "nao_confirmado" || c.status === "aguardando_pagamento"; })
    .reduce(function (sum, c) { return sum + Number(c.total_value); }, 0);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const in5Days = new Date(today); in5Days.setDate(in5Days.getDate() + 5);

  const withDue = openClaims.filter(function (c) { return c.due_date; });
  const prazosProximos = withDue.filter(function (c) {
    const due = new Date(c.due_date);
    return due >= today && due <= in5Days;
  }).map(claimWithItems_);
  const itensEmAtraso = withDue.filter(function (c) { return new Date(c.due_date) < today; });

  const avisos = findWhere_("Avisos", function (a) { return !a.target_user_id || a.target_user_id === user.id; });
  const reads = findWhere_("AvisoReads", function (r) { return r.user_id === user.id; });
  const readIds = reads.map(function (r) { return r.aviso_id; });
  const avisosNaoVisualizados = avisos.filter(function (a) { return readIds.indexOf(a.id) === -1; }).length;

  return {
    totalItens: totalItens,
    valorPendente: valorPendente,
    prazosProximos: prazosProximos,
    itensEmAtraso: itensEmAtraso.length,
    avisosNaoVisualizados: avisosNaoVisualizados,
  };
}

// ---------------- Admin ----------------

function adminGetAllClaims(token) {
  requireMaster_(token);
  const users = readAll_("Usuarios");
  const userMap = {};
  users.forEach(function (u) { userMap[u.id] = u; });

  return readAll_("Claims").map(function (c) {
    const withItems = claimWithItems_(c);
    const owner = userMap[c.user_id];
    return Object.assign({}, withItems, {
      username: owner ? owner.username : "?",
      full_name: owner ? owner.full_name : "?",
    });
  }).sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
}

function adminUpdateClaim(token, claimId, patch) {
  requireMaster_(token);
  const clean = {};
  if (patch.status !== undefined) clean.status = patch.status;
  if (patch.total_value !== undefined) clean.total_value = Number(patch.total_value);
  if (patch.due_date !== undefined) clean.due_date = patch.due_date;
  updateRecord_("Claims", claimId, clean);
  return true;
}
