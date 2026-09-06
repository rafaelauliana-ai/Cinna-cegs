/**
 * Cegs.gs — CEGs e Produtos.
 */

function listCegs(token) {
  requireSession_(token);
  return readAll_("CEGs").sort(function (a, b) { return a.name.localeCompare(b.name); });
}

function listActiveCegs(token) {
  requireSession_(token);
  return findWhere_("CEGs", function (c) { return c.status === "em_andamento"; })
    .sort(function (a, b) { return a.name.localeCompare(b.name); });
}

function listProducts(token, cegId) {
  requireSession_(token);
  return findWhere_("Produtos", function (p) { return p.ceg_id === cegId; }).map(function (p) {
    return Object.assign({}, p, {
      variations: p.variations ? String(p.variations).split(",").map(function (v) { return v.trim(); }).filter(Boolean) : [],
    });
  });
}

// ---------------- Admin ----------------

function adminCreateCeg(token, name) {
  requireMaster_(token);
  if (!name || !name.trim()) throw new Error("Nome da CEG é obrigatório.");
  return insertRecord_("CEGs", { name: name.trim(), status: "em_andamento" });
}

function adminUpdateCegStatus(token, cegId, status) {
  requireMaster_(token);
  updateRecord_("CEGs", cegId, { status: status });
  return true;
}

function adminAddProduct(token, payload) {
  requireMaster_(token);
  return insertRecord_("Produtos", {
    ceg_id: payload.cegId,
    name: payload.name,
    price: Number(payload.price) || 0,
    image_url: payload.imageUrl || "",
    variations: (payload.variations || []).join(","),
  });
}

function adminRemoveProduct(token, productId) {
  requireMaster_(token);
  deleteRecord_("Produtos", productId);
  return true;
}
