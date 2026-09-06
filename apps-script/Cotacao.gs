/**
 * Cotacao.gs — conversão Dólar -> Real (cotação do dia) + confirmação de compra.
 */

const USD_MARKUP_BRL = 4; // TODO(Rafa): ajuste aqui se quiser mudar a taxa fixa.

function getExchangeRate(token) {
  requireSession_(token);
  try {
    const response = UrlFetchApp.fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL", {
      muteHttpExceptions: true,
    });
    const data = JSON.parse(response.getContentText());
    const rate = Number(data.USDBRL.bid);
    if (!isFinite(rate)) throw new Error("Cotação inválida");
    return { rate: rate, markup: USD_MARKUP_BRL, updatedAt: data.USDBRL.create_date };
  } catch (e) {
    throw new Error("Não foi possível obter a cotação do dólar agora. Tente novamente.");
  }
}

/** payload: { productName, valueUsd, valueBrl, productLink, proofFileId } */
function confirmCotacao(token, payload) {
  const user = requireSession_(token);
  if (!payload.productName || !payload.proofFileId) {
    throw new Error("Preencha o produto e anexe o comprovante.");
  }
  return insertRecord_("Cotacoes", {
    user_id: user.id,
    product_name: payload.productName,
    value_usd: Number(payload.valueUsd) || 0,
    value_brl: Number(payload.valueBrl) || 0,
    product_link: payload.productLink || "",
    proof_url: payload.proofFileId,
    status: "pendente",
  });
}
