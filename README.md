# Cinnamon Cegs — Site Funcional

> ⚠️ **Versão ativa**: a comunidade está usando a versão **Google Apps Script**,
> em [`apps-script/`](./apps-script/README.md) — comece por ali (tem o passo a
> passo completo de publicação). O restante deste README documenta a versão
> Next.js + Supabase, mantida no repositório apenas como referência caso um
> dia queira migrar pra ela.

Plataforma da comunidade de compras em grupo (CEG) **Cinnamon Cegs**: login individual
por joiner, painéis interativos (claims, cotação, repasses, envios, lojinha, Pocamarket,
avisos) e uma área administrativa completa para a Rafaela (@pur_pleki).

Identidade visual em tons de azul claro e branco, estilo fofo/kawaii inspirado no
Cinnamoroll.

## Stack

- **Front-end**: Next.js (App Router) + TypeScript + Tailwind CSS
- **Banco de dados + autenticação**: [Supabase](https://supabase.com) (Postgres + Auth +
  Storage), com Row Level Security implementando dois níveis de acesso:
  - **master** (Rafaela): acesso total a todos os dados
  - **joiner** (membros): só vê e edita os próprios dados
- **Hospedagem**: Vercel

Ambos os planos gratuitos cobrem folgadamente uma comunidade de ~60 pessoas.

## Como colocar no ar

### 1. Criar o projeto no Supabase

1. Crie um projeto em [supabase.com/dashboard](https://supabase.com/dashboard).
2. Abra **SQL Editor**, cole o conteúdo de `supabase/migrations/0001_init.sql` e clique em
   **Run**. Isso cria todas as tabelas, os buckets de arquivo e as políticas de segurança
   (RLS).
3. Em **Project Settings → API**, copie:
   - **Project URL**
   - **anon public key**

### 2. Configurar as variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha com os valores do passo anterior:

```bash
cp .env.example .env.local
```

### 3. Rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`, crie sua conta pela tela de **Cadastro** usando o
identificador `@pur_pleki` (ou `@pur_plekii`).

### 4. Virar administradora (master)

Depois de criar sua conta, volte ao **SQL Editor** do Supabase e rode:

```sql
update public.profiles set role = 'master'
where username in ('pur_pleki', 'pur_plekii');
```

Isso libera o menu **Administração** só para você.

### 5. Publicar na Vercel

1. Em [vercel.com](https://vercel.com), clique em **Add New Project** e importe este
   repositório do GitHub.
2. Adicione as mesmas duas variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) nas configurações do projeto na Vercel.
3. Clique em **Deploy**.

A partir daí, todo push nesta branch gera um novo deploy automaticamente.

## O que ainda precisa da sua revisão

Alguns conteúdos foram deixados como placeholder (marcados com `TODO`) porque não tive
acesso ao site informativo `cinnamon-cegs.vercel.app` para copiar os textos reais:

- `src/app/regras/page.tsx` — texto completo das Regras da Comunidade.
- `src/lib/config.ts` — link de pagamento por cartão (a chave PIX já está configurada).

## Estrutura do projeto

```
src/
  app/
    (auth)/login, (auth)/cadastro      → telas de autenticação
    (app)/...                          → telas logadas (dashboard, claims, lojinha...)
    (app)/admin/...                    → painel administrativo (só master)
    regras/                            → página pública de regras
  components/
    ui/            → design system (Button, Card, Input, Badge, StatCard...)
    shell/         → sidebar + layout do app
    tour/          → tutorial interativo "Como Usar"
    claims/        → componentes específicos de claims
  lib/
    supabase/      → clientes Supabase (browser/server/middleware) + tipos
    data/          → funções de busca de dados (dashboard, claims)
    nav.ts         → itens do menu lateral (usado também pelo tutorial)
    status.ts      → labels/cores dos status de claim
    config.ts      → configs editáveis (PIX, taxa fixa sobre a cotação do dólar)
supabase/
  migrations/0001_init.sql   → schema completo do banco + RLS + storage
```

## Segurança (RLS)

Toda regra de acesso é aplicada no banco (Postgres RLS), não só no front-end:

- Cada joiner só enxerga e edita as próprias claims, cotações, repasses, envios,
  comprovantes e reportes.
- Endereço, telefone e CPF de um joiner só são visíveis para ele mesmo e para a master
  (necessário para ela organizar envios).
- Usernames (`@usuario`) são expostos com segurança via RPCs dedicadas (login,
  "combinar envio com outro joiner", Lojinha) sem vazar o resto do profile.
- A master tem acesso total via a função `public.is_master()`.

## Cotação em Dólar

A tela **Cotação** converte Dólar → Real usando a cotação do dia (via
[AwesomeAPI](https://docs.awesomeapi.com.br/api-de-moedas), gratuita e sem chave),
somando automaticamente uma taxa fixa por cima do valor convertido
(`USD_MARKUP_BRL` em `src/lib/config.ts`, hoje R$ 4,00). A cotação é buscada pela rota
`src/app/api/cambio/route.ts` e cacheada por 1h no servidor.

> Se você já rodou `0001_init.sql` no Supabase antes desta mudança, rode também:
> ```sql
> alter table public.cotacoes rename column value_jpy to value_usd;
> ```

## Tutorial interativo

O item **"Como Usar"** no menu abre um tour guiado (sem depender de bibliotecas
externas) que destaca cada parte da interface e explica sua função — dá pra avançar
clicando em "Próximo" ou diretamente no item destacado.
