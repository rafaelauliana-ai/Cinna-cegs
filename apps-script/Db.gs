/**
 * Db.gs
 * ----------------------------------------------------------------------
 * Camada de acesso à planilha (faz o papel do banco de dados). Todas as
 * funções aqui são utilitários internos (sufixo "_") — não ficam
 * disponíveis para o cliente via google.script.run.
 */

function ss_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function sheet_(name) {
  const sheet = ss_().getSheetByName(name);
  if (!sheet) {
    throw new Error(
      'Aba "' + name + '" não encontrada. Rode o menu "Cinnamon Cegs > Rodar Setup" primeiro.',
    );
  }
  return sheet;
}

function newId_() {
  return Utilities.getUuid();
}

function nowIso_() {
  return new Date().toISOString();
}

/** Lê toda a aba e devolve um array de objetos { coluna: valor }. */
function readAll_(sheetName) {
  const sheet = sheet_(sheetName);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0];
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (row.every((cell) => cell === "" || cell === null)) continue;
    const obj = {};
    headers.forEach((h, idx) => (obj[h] = row[idx]));
    rows.push(obj);
  }
  return rows;
}

function findById_(sheetName, id) {
  return readAll_(sheetName).find((r) => String(r.id) === String(id)) || null;
}

function findWhere_(sheetName, predicate) {
  return readAll_(sheetName).filter(predicate);
}

/** Insere um novo registro. Preenche "id" e "created_at" se não vierem. */
function insertRecord_(sheetName, data) {
  const sheet = sheet_(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const record = Object.assign({}, data);
  if (headers.indexOf("id") !== -1 && !record.id) record.id = newId_();
  if (headers.indexOf("created_at") !== -1 && !record.created_at) record.created_at = nowIso_();

  const row = headers.map((h) => (record[h] !== undefined ? record[h] : ""));

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }

  return record;
}

/** Atualiza campos de um registro identificado por id (coluna "id"). */
function updateRecord_(sheetName, id, patch) {
  const sheet = sheet_(sheetName);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const idCol = headers.indexOf("id");
    if (idCol === -1) throw new Error('Aba "' + sheetName + '" não tem coluna "id".');

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][idCol]) === String(id)) {
        if (headers.indexOf("updated_at") !== -1) patch.updated_at = nowIso_();
        headers.forEach((h, col) => {
          if (patch[h] !== undefined) {
            sheet.getRange(i + 1, col + 1).setValue(patch[h]);
          }
        });
        return true;
      }
    }
    return false;
  } finally {
    lock.releaseLock();
  }
}

function deleteRecord_(sheetName, id) {
  return deleteWhere_(sheetName, (row) => String(row.id) === String(id));
}

/** Remove todas as linhas cujo objeto satisfaça o predicado. */
function deleteWhere_(sheetName, predicate) {
  const sheet = sheet_(sheetName);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    let removed = 0;

    for (let i = values.length - 1; i >= 1; i--) {
      const obj = {};
      headers.forEach((h, idx) => (obj[h] = values[i][idx]));
      if (predicate(obj)) {
        sheet.deleteRow(i + 1);
        removed++;
      }
    }
    return removed;
  } finally {
    lock.releaseLock();
  }
}

/** Insere várias linhas de uma vez (mais rápido que várias chamadas). */
function insertMany_(sheetName, dataArray) {
  const sheet = sheet_(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const rows = dataArray.map((data) => {
    const record = Object.assign({}, data);
    if (headers.indexOf("id") !== -1 && !record.id) record.id = newId_();
    if (headers.indexOf("created_at") !== -1 && !record.created_at) record.created_at = nowIso_();
    return headers.map((h) => (record[h] !== undefined ? record[h] : ""));
  });

  if (rows.length === 0) return;

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
  } finally {
    lock.releaseLock();
  }
}
