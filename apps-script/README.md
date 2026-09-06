# Cinnamon Cegs — versão Google Apps Script

Site funcional completo da comunidade rodando 100% em Google (Sheets + Apps
Script), sem precisar de Supabase, Vercel nem nenhuma conta paga. Identidade
visual azul claro/branco, estilo kawaii.

## Como publicar (passo a passo)

Isso leva uns 10 minutos. São só cliques, sem precisar mexer em nada técnico
além de copiar e colar.

### 1. Criar a planilha

1. Acesse [sheets.google.com](https://sheets.google.com) e crie uma planilha em branco
2. Dê um nome pra ela, tipo "Cinnamon Cegs - Banco de Dados"

### 2. Criar o projeto Apps Script vinculado

1. Na planilha, vá em **Extensões → Apps Script**
2. Isso abre o editor de código, já vinculado à sua planilha

### 3. Colar os arquivos

No editor do Apps Script:

1. Apague o conteúdo padrão do arquivo `Código.gs` (ou `Code.gs`)
2. Para cada arquivo `.gs` desta pasta (`Code.gs`, `Db.gs`, `Auth.gs`, `Files.gs`,
   `Setup.gs`, `Cegs.gs`, `Claims.gs`, `Cotacao.gs`, `Repasse.gs`,
   `EnvioNacional.gs`, `Comprovante.gs`, `Lojinha.gs`, `Pocamarket.gs`,
   `Avisos.gs`, `Conta.gs`, `Reportar.gs`, `Admin.gs`):
   - Crie um novo arquivo de script (ícone "+" ao lado de "Arquivos" → "Script")
   - Dê o mesmo nome do arquivo (sem a extensão `.gs`)
   - Cole o conteúdo
3. Para cada arquivo `.html` desta pasta (`App.html`, `Styles.html`,
   `Scripts.html`, `Tour.html`, `Login.html`, `Cadastro.html`, `Dashboard.html`,
   `NovaClaim.html`, `MinhasClaims.html`, `Cotacao.html`, `Repasse.html`,
   `EnvioNacional.html`, `Comprovante.html`, `Lojinha.html`, `Pocamarket.html`,
   `Avisos.html`, `Cegs.html`, `Regras.html`, `Conta.html`, `Reportar.html`,
   `Admin.html`, `Tutorial.html`):
   - Crie um novo arquivo (ícone "+" → "HTML")
   - Dê o mesmo nome (sem `.html`)
   - Cole o conteúdo
4. Salve tudo (ícone de disquete, ou Ctrl+S)

### 4. Rodar o Setup

1. Volte pra planilha (aba do navegador)
2. Recarregue a página (F5) — deve aparecer um novo menu **"Cinnamon Cegs"** na barra de menus
3. Clique em **Cinnamon Cegs → ▶️ Rodar Setup (criar abas)**
4. Na primeira vez, o Google vai pedir autorização — clique em **Continuar**,
   escolha sua conta, clique em **Avançado** → **Acessar Cinnamon Cegs (não
   seguro)** (é normal aparecer esse aviso para scripts pessoais que você
   mesma criou) e depois **Permitir**
5. Deve aparecer uma mensagem "Tudo pronto! ✅" — as abas da planilha foram criadas

### 5. Publicar como Web App

1. No editor do Apps Script, clique em **Implantar → Nova implantação**
2. Clique no ícone de engrenagem ao lado de "Selecionar tipo" → escolha **App da Web**
3. Configure:
   - **Executar como**: Eu (sua conta)
   - **Quem pode acessar**: Qualquer pessoa
4. Clique em **Implantar**
5. Autorize de novo se pedir
6. Copie o **link do App da Web** — esse é o link do site! Pode compartilhar
   com a comunidade.

### 6. Virar administradora (master)

1. Crie sua conta pelo próprio site (tela de Cadastro), usando `@pur_pleki` ou `@pur_plekii`
2. Volte na planilha → menu **Cinnamon Cegs → 👑 Promover usuário a master**
3. Digite seu @ (sem o @) e confirme

Pronto! Agora você tem acesso ao menu **Administração**.

## Atualizando o site depois

Sempre que eu (Claude) fizer uma mudança no código, você vai precisar:
1. Copiar o conteúdo atualizado do(s) arquivo(s) que mudaram pro editor do Apps Script
2. Ir em **Implantar → Gerenciar implantações** → clicar no ícone de lápis ✏️ na implantação existente → trocar a versão para **Nova versão** → **Implantar**

(Isso atualiza o mesmo link, sem precisar criar um novo.)

## O que ainda precisa da sua revisão

- `Regras.html` — texto completo das Regras da Comunidade (está com placeholders `TODO`)
- `Comprovante.gs` — link de pagamento por cartão (a chave PIX já está preenchida)
- `Cotacao.gs` — taxa fixa somada à cotação do dólar (`USD_MARKUP_BRL`, hoje R$ 4)

## Limitações desta versão (comparado à versão Next.js/Supabase)

- **Arquivos não são 100% privados**: comprovantes de pagamento ficam no seu
  Google Drive com link "qualquer um com o link pode ver" — não são
  listados/indexados em lugar nenhum, mas tecnicamente não são
  criptograficamente protegidos como estariam num bucket privado de verdade.
  Para uma comunidade pequena de confiança, isso costuma ser aceitável.
- **Escala**: Google Sheets funciona bem até alguns milhares de linhas —
  tranquilo para uma comunidade de ~60 pessoas, mas não é pensado pra crescer
  para milhares de usuários ativos.
- **Cotas do Google**: contas gratuitas têm limites diários de execução de
  script (bem generosos para esse tamanho de uso, mas existem).
