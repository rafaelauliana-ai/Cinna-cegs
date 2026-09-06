/**
 * Setup.gs
 * ----------------------------------------------------------------------
 * Define a estrutura da planilha (abas + cabeçalhos) e cria tudo com um
 * clique. Rode a função `setupSheets` uma única vez (menu "Cinnamon Cegs"
 * > "Rodar Setup" na própria planilha, ou pelo editor de Apps Script).
 */

const SHEETS_SCHEMA = {
  Usuarios: [
    "id", "username", "full_name", "email", "phone", "password_hash", "salt",
    "role", "address_street", "address_number", "address_complement",
    "address_district", "address_city", "address_state", "address_zip",
    "cpf", "accepted_rules_at", "created_at",
  ],
  Sessions: ["token", "user_id", "created_at", "expires_at"],
  CEGs: ["id", "name", "status", "description", "cover_image_url", "created_at"],
  Produtos: ["id", "ceg_id", "name", "price", "image_url", "variations", "created_at"],
  Claims: [
    "id", "user_id", "ceg_id", "status", "total_value", "due_date", "notes",
    "created_at", "updated_at",
  ],
  ClaimItems: ["id", "claim_id", "product_id", "product_name", "variation", "unit_price", "quantity"],
  Cotacoes: [
    "id", "claim_id", "user_id", "product_name", "value_usd", "value_brl",
    "product_link", "proof_url", "status", "created_at",
  ],
  Avisos: ["id", "target_user_id", "type", "title", "message", "created_by", "created_at"],
  AvisoReads: ["id", "aviso_id", "user_id", "read_at"],
  LojinhaItems: [
    "id", "owner_id", "claim_item_id", "title", "description", "price",
    "image_url", "status", "created_at",
  ],
  PocamarketRequests: [
    "id", "user_id", "group_query", "listing_link", "status", "admin_notes",
    "created_at", "updated_at",
  ],
  EnviosNacionais: ["id", "user_id", "combined_with_user_id", "status", "created_at"],
  EnvioClaims: ["envio_id", "claim_id"],
  Repasses: ["id", "user_id", "status", "created_at"],
  RepasseClaims: ["repasse_id", "claim_id"],
  ComprovantesPagamento: ["id", "user_id", "claim_id", "proof_url", "status", "created_at"],
  Reportes: [
    "id", "user_id", "type", "message", "status", "admin_response",
    "created_at", "updated_at",
  ],
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Cinnamon Cegs")
    .addItem("▶️ Rodar Setup (criar abas)", "setupSheets")
    .addItem("👑 Promover usuário a master", "promptPromoteMaster")
    .addToUi();
}

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Object.keys(SHEETS_SCHEMA).forEach((name) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    const headers = SHEETS_SCHEMA[name];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  });

  // Remove a aba padrão "Página1"/"Sheet1" vazia, se sobrou uma.
  ["Página1", "Sheet1", "Planilha1"].forEach((defaultName) => {
    const sheet = ss.getSheetByName(defaultName);
    if (sheet && sheet.getLastRow() === 0 && ss.getSheets().length > 1) {
      ss.deleteSheet(sheet);
    }
  });

  SpreadsheetApp.getUi().alert(
    "Tudo pronto! ✅",
    "As abas da planilha foram criadas. Agora é só publicar o Web App (Deploy > Nova implantação).",
    SpreadsheetApp.getUi().ButtonSet.OK,
  );
}

/**
 * Atalho de menu: pede o @ do usuário e o promove a master.
 * (equivalente ao UPDATE profiles SET role='master' da versão web)
 */
function promptPromoteMaster() {
  const ui = SpreadsheetApp.getUi();
  const res = ui.prompt("Promover a Master", "Digite o @ do usuário (sem o @):", ui.ButtonSet.OK_CANCEL);
  if (res.getSelectedButton() !== ui.Button.OK) return;

  const username = res.getResponseText().trim().toLowerCase();
  const user = findWhere_("Usuarios", (row) => row.username === username)[0];

  if (!user) {
    ui.alert("Usuário não encontrado: @" + username);
    return;
  }

  updateRecord_("Usuarios", user.id, { role: "master" });
  ui.alert("Pronto! @" + username + " agora é master. 👑");
}
