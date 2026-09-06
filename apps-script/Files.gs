/**
 * Files.gs
 * ----------------------------------------------------------------------
 * Upload de arquivos (fotos de produto/lojinha, comprovantes) pro Google
 * Drive da conta que publicou o Web App (a conta da Rafa).
 *
 * ⚠️ Nota de segurança: diferente da versão Supabase (que tinha um bucket
 * realmente privado com RLS), aqui os arquivos ficam com o link
 * "qualquer pessoa com o link pode ver" — não são listados/indexados em
 * lugar nenhum e o ID do arquivo não é adivinhável, mas tecnicamente
 * qualquer um que descubra o link consegue abrir. Para uma comunidade
 * pequena e de confiança isso costuma ser aceitável; se quiser reforçar,
 * dá pra trocar por outra abordagem no futuro.
 */

const DRIVE_ROOT_FOLDER_NAME = "Cinnamon Cegs - Arquivos";

function getOrCreateFolder_(path) {
  let folder = DriveApp.getRootFolder();
  const parts = [DRIVE_ROOT_FOLDER_NAME].concat(path ? [path] : []);

  parts.forEach((name) => {
    const existing = folder.getFoldersByName(name);
    folder = existing.hasNext() ? existing.next() : folder.createFolder(name);
  });

  return folder;
}

/**
 * Salva um arquivo enviado como base64 (data URL ou string pura).
 * Retorna { fileId, url }.
 */
function saveUploadedFile_(base64Data, filename, mimeType, subFolder) {
  const clean = base64Data.indexOf("base64,") !== -1
    ? base64Data.split("base64,")[1]
    : base64Data;

  const bytes = Utilities.base64Decode(clean);
  const blob = Utilities.newBlob(bytes, mimeType, filename);

  const folder = getOrCreateFolder_(subFolder);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    fileId: file.getId(),
    url: "https://drive.google.com/uc?export=view&id=" + file.getId(),
  };
}

/** Endpoint chamado pelo cliente (google.script.run) para qualquer upload. */
function uploadFile(token, payload) {
  requireSession_(token);

  if (!payload || !payload.base64 || !payload.filename) {
    throw new Error("Arquivo inválido.");
  }

  const subFolder = payload.subFolder || "geral";
  return saveUploadedFile_(payload.base64, payload.filename, payload.mimeType || "application/octet-stream", subFolder);
}
