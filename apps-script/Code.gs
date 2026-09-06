/**
 * Code.gs
 * ----------------------------------------------------------------------
 * Ponto de entrada do Web App. Toda a interface roda como uma SPA (single
 * page app) dentro de um único HTML — a navegação entre telas é feita em
 * JavaScript no navegador, sem recarregar a página.
 */

function doGet() {
  return HtmlService.createTemplateFromFile("App")
    .evaluate()
    .setTitle("Cinnamon Cegs")
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setFaviconUrl("https://ssl.gstatic.com/docs/script/images/favicon.ico")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Usado dentro dos templates HTML: <?!= include('NomeDoArquivo'); ?> */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
