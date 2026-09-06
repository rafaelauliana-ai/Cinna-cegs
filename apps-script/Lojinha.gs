/**
 * Lojinha.gs — vitrine de repasse entre membros.
 */

function listLojinhaDisponiveis(token) {
  requireSession_(token);
  const items = findWhere_("LojinhaItems", function (i) { return i.status === "disponivel"; });
  return attachOwnerUsername_(items);
}

function listMyLojinhaItems(token) {
  const user = requireSession_(token);
  const items = findWhere_("LojinhaItems", function (i) { return i.owner_id === user.id; });
  return attachOwnerUsername_(items);
}

function attachOwnerUsername_(items) {
  const users = readAll_("Usuarios");
  const userMap = {};
  users.forEach(function (u) { userMap[u.id] = u.username; });
  return items.map(function (i) {
    return Object.assign({}, i, { owner_username: userMap[i.owner_id] || "?" });
  }).sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
}

function createLojinhaItem(token, payload) {
  const user = requireSession_(token);
  if (!payload.title) throw new Error("Título é obrigatório.");
  return insertRecord_("LojinhaItems", {
    owner_id: user.id,
    title: payload.title,
    description: payload.description || "",
    price: Number(payload.price) || 0,
    image_url: payload.imageUrl || "",
    status: "disponivel",
  });
}

function updateLojinhaItemStatus(token, itemId, status) {
  const user = requireSession_(token);
  const item = findById_("LojinhaItems", itemId);
  if (!item) throw new Error("Item não encontrado.");
  if (item.owner_id !== user.id && user.role !== "master") throw new Error("Você não pode editar esse item.");
  updateRecord_("LojinhaItems", itemId, { status: status });
  return true;
}
