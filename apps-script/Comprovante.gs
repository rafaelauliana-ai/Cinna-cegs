/**
 * Comprovante.gs — envio de comprovante de pagamento.
 */

const PAYMENT_METHODS = {
  pixKey: "rafaelauliana001@gmail.com",
  cardLink: "https://linknabio.gg/cinnamoncegs", // TODO(Rafa): ajuste se precisar.
};

function getPaymentMethods() {
  return PAYMENT_METHODS;
}

function getClaimsAguardandoPagamento(token) {
  const user = requireSession_(token);
  return findWhere_("Claims", function (c) {
    return c.user_id === user.id && (c.status === "nao_confirmado" || c.status === "aguardando_pagamento");
  }).map(claimWithItems_);
}

function sendComprovante(token, payload) {
  const user = requireSession_(token);
  if (!payload.claimIds || payload.claimIds.length === 0) throw new Error("Selecione ao menos uma claim.");
  if (!payload.proofFileId) throw new Error("Anexe o comprovante.");

  insertMany_("ComprovantesPagamento", payload.claimIds.map(function (claimId) {
    return { user_id: user.id, claim_id: claimId, proof_url: payload.proofFileId, status: "enviado" };
  }));
  return true;
}
