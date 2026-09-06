/**
 * Pocamarket.gs
 */

function getMyPocamarketRequests(token) {
  const user = requireSession_(token);
  return findWhere_("PocamarketRequests", function (r) { return r.user_id === user.id; })
    .sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
}

function createPocamarketRequest(token, payload) {
  const user = requireSession_(token);
  if (!payload.listingLink) throw new Error("Informe o link do anúncio.");
  return insertRecord_("PocamarketRequests", {
    user_id: user.id,
    group_query: payload.groupQuery || "",
    listing_link: payload.listingLink,
    status: "pendente",
    updated_at: nowIso_(),
  });
}
