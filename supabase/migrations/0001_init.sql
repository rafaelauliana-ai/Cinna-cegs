-- ============================================================================
-- Cinnamon Cegs — schema inicial
-- ----------------------------------------------------------------------------
-- Como usar: cole este arquivo inteiro no SQL Editor do Supabase e clique em
-- "Run". Ele cria todas as tabelas, funções auxiliares e as políticas de
-- Row Level Security (RLS) que implementam os dois níveis de acesso:
--   - master  -> Rafaela (@pur_pleki): acesso total a todos os dados
--   - joiner  -> membros comuns: só enxergam/editam os próprios dados
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PROFILES
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  full_name text not null,
  email text not null,
  phone text,
  role text not null default 'joiner' check (role in ('master', 'joiner')),
  address_street text,
  address_number text,
  address_complement text,
  address_district text,
  address_city text,
  address_state text,
  address_zip text,
  cpf text,
  accepted_rules_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Dados de cada joiner/master. O endereço/CPF só é visível para o próprio dono e para o master (necessário para organizar envios).';

-- Função auxiliar: o usuário autenticado é a master (Rafaela)?
create or replace function public.is_master()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'master'
  );
$$;

-- Impede que um joiner promova a si mesmo para master via update na própria linha.
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_master() and new.role is distinct from old.role then
    new.role := old.role;
  end if;
  return new;
end;
$$;

create trigger trg_prevent_role_self_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();

-- Cria automaticamente o profile quando alguém se cadastra (auth.users).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, email, phone)
  values (
    new.id,
    lower(new.raw_user_meta_data ->> 'username'),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RPC pública usada na tela de login: resolve "@usuario" -> e-mail cadastrado,
-- já que o Supabase Auth autentica por e-mail. Não expõe mais nada além disso.
create or replace function public.get_email_by_username(p_username text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select email from public.profiles where username = lower(p_username);
$$;

revoke all on function public.get_email_by_username(text) from public;
grant execute on function public.get_email_by_username(text) to anon, authenticated;

-- RPC usada em "combinar envio com outro joiner": permite resolver um @usuario
-- para id/nome sem expor o restante do profile (endereço, CPF, etc.) de outros usuários.
create or replace function public.find_joiner_by_username(p_username text)
returns table (id uuid, username text, full_name text)
language sql
stable
security definer
set search_path = public
as $$
  select id, username, full_name from public.profiles
  where username = lower(p_username) and id <> auth.uid();
$$;

revoke all on function public.find_joiner_by_username(text) from public;
grant execute on function public.find_joiner_by_username(text) to authenticated;

-- Utilitário genérico usado por várias tabelas com coluna updated_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

alter table public.profiles enable row level security;

create policy "profiles_select_own_or_master"
  on public.profiles for select
  using (id = auth.uid() or public.is_master());

create policy "profiles_update_own_or_master"
  on public.profiles for update
  using (id = auth.uid() or public.is_master());

-- Inserts acontecem só via trigger (security definer), então não há policy
-- de insert liberada para joiners/anon.

-- ----------------------------------------------------------------------------
-- 2. CEGS (compras em grupo)
-- ----------------------------------------------------------------------------
create table public.cegs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'em_andamento' check (status in ('em_andamento', 'finalizada', 'cancelada')),
  description text,
  cover_image_url text,
  created_at timestamptz not null default now()
);

alter table public.cegs enable row level security;

create policy "cegs_select_authenticated"
  on public.cegs for select
  using (auth.uid() is not null);

create policy "cegs_write_master"
  on public.cegs for all
  using (public.is_master())
  with check (public.is_master());

-- ----------------------------------------------------------------------------
-- 3. PRODUCTS
-- ----------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  ceg_id uuid not null references public.cegs (id) on delete cascade,
  name text not null,
  price numeric(10, 2) not null default 0,
  image_url text,
  variations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products_select_authenticated"
  on public.products for select
  using (auth.uid() is not null);

create policy "products_write_master"
  on public.products for all
  using (public.is_master())
  with check (public.is_master());

-- ----------------------------------------------------------------------------
-- 4. CLAIMS + CLAIM_ITEMS
-- ----------------------------------------------------------------------------
create table public.claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  ceg_id uuid not null references public.cegs (id),
  status text not null default 'nao_confirmado' check (status in (
    'nao_confirmado', 'aguardando_pagamento', 'pago', 'cotacao_pendente', 'comprado',
    'aguardando_repasse', 'nacional_liberado', 'envio_solicitado', 'enviado', 'entregue', 'cancelado'
  )),
  total_value numeric(10, 2) not null default 0,
  due_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.claim_items (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims (id) on delete cascade,
  product_id uuid references public.products (id),
  product_name text not null,
  variation text,
  unit_price numeric(10, 2) not null default 0,
  quantity int not null default 1 check (quantity > 0)
);

alter table public.claims enable row level security;
alter table public.claim_items enable row level security;

create policy "claims_select_own_or_master"
  on public.claims for select
  using (user_id = auth.uid() or public.is_master());

create policy "claims_insert_own_or_master"
  on public.claims for insert
  with check (user_id = auth.uid() or public.is_master());

create policy "claims_update_own_or_master"
  on public.claims for update
  using (user_id = auth.uid() or public.is_master());

create policy "claim_items_select_via_claim"
  on public.claim_items for select
  using (exists (
    select 1 from public.claims c
    where c.id = claim_items.claim_id
      and (c.user_id = auth.uid() or public.is_master())
  ));

create policy "claim_items_write_via_claim"
  on public.claim_items for all
  using (exists (
    select 1 from public.claims c
    where c.id = claim_items.claim_id
      and (c.user_id = auth.uid() or public.is_master())
  ))
  with check (exists (
    select 1 from public.claims c
    where c.id = claim_items.claim_id
      and (c.user_id = auth.uid() or public.is_master())
  ));

create trigger trg_claims_set_updated_at
  before update on public.claims
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 5. COTAÇÕES (confirmação de compra internacional)
-- ----------------------------------------------------------------------------
create table public.cotacoes (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references public.claims (id) on delete set null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_name text not null,
  value_jpy numeric(10, 2),
  value_brl numeric(10, 2),
  product_link text,
  proof_url text,
  status text not null default 'pendente' check (status in ('pendente', 'confirmado', 'rejeitado')),
  created_at timestamptz not null default now()
);

alter table public.cotacoes enable row level security;

create policy "cotacoes_select_own_or_master"
  on public.cotacoes for select
  using (user_id = auth.uid() or public.is_master());

create policy "cotacoes_insert_own_or_master"
  on public.cotacoes for insert
  with check (user_id = auth.uid() or public.is_master());

create policy "cotacoes_update_master"
  on public.cotacoes for update
  using (public.is_master());

-- ----------------------------------------------------------------------------
-- 6. AVISOS (notificações, com leitura por usuário)
-- ----------------------------------------------------------------------------
create table public.avisos (
  id uuid primary key default gen_random_uuid(),
  target_user_id uuid references public.profiles (id) on delete cascade,
  type text not null check (type in (
    'compra_lojinha', 'comprovante_enviado', 'envio_solicitado', 'nova_ceg',
    'status_alterado', 'valores_atualizados', 'cotacao', 'geral', 'reporte_atualizado'
  )),
  title text not null,
  message text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

comment on column public.avisos.target_user_id is 'NULL = aviso em broadcast para todos os joiners.';

create table public.aviso_reads (
  id uuid primary key default gen_random_uuid(),
  aviso_id uuid not null references public.avisos (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  read_at timestamptz not null default now(),
  unique (aviso_id, user_id)
);

alter table public.avisos enable row level security;
alter table public.aviso_reads enable row level security;

create policy "avisos_select_target_or_master"
  on public.avisos for select
  using (target_user_id = auth.uid() or target_user_id is null or public.is_master());

create policy "avisos_write_master"
  on public.avisos for all
  using (public.is_master())
  with check (public.is_master());

create policy "aviso_reads_own_or_master"
  on public.aviso_reads for all
  using (user_id = auth.uid() or public.is_master())
  with check (user_id = auth.uid() or public.is_master());

-- ----------------------------------------------------------------------------
-- 7. LOJINHA (vitrine de repasse entre membros)
-- ----------------------------------------------------------------------------
create table public.lojinha_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  claim_item_id uuid references public.claim_items (id) on delete set null,
  title text not null,
  description text,
  price numeric(10, 2) not null default 0,
  image_url text,
  status text not null default 'disponivel' check (status in ('disponivel', 'reservado', 'vendido', 'cancelado')),
  created_at timestamptz not null default now()
);

alter table public.lojinha_items enable row level security;

create policy "lojinha_select_authenticated"
  on public.lojinha_items for select
  using (auth.uid() is not null);

create policy "lojinha_write_own_or_master"
  on public.lojinha_items for all
  using (owner_id = auth.uid() or public.is_master())
  with check (owner_id = auth.uid() or public.is_master());

-- ----------------------------------------------------------------------------
-- 8. POCAMARKET
-- ----------------------------------------------------------------------------
create table public.pocamarket_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  group_query text,
  listing_link text not null,
  status text not null default 'pendente' check (status in ('pendente', 'em_andamento', 'concluido', 'cancelado')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pocamarket_requests enable row level security;

create policy "pocamarket_select_own_or_master"
  on public.pocamarket_requests for select
  using (user_id = auth.uid() or public.is_master());

create policy "pocamarket_insert_own_or_master"
  on public.pocamarket_requests for insert
  with check (user_id = auth.uid() or public.is_master());

create policy "pocamarket_update_own_or_master"
  on public.pocamarket_requests for update
  using (user_id = auth.uid() or public.is_master());

create trigger trg_pocamarket_set_updated_at
  before update on public.pocamarket_requests
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 9. ENVIO NACIONAL
-- ----------------------------------------------------------------------------
create table public.envios_nacionais (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  combined_with_user_id uuid references public.profiles (id),
  status text not null default 'solicitado' check (status in ('solicitado', 'em_transito', 'entregue', 'cancelado')),
  address_snapshot jsonb,
  created_at timestamptz not null default now()
);

create table public.envio_claims (
  envio_id uuid not null references public.envios_nacionais (id) on delete cascade,
  claim_id uuid not null references public.claims (id) on delete cascade,
  primary key (envio_id, claim_id)
);

alter table public.envios_nacionais enable row level security;
alter table public.envio_claims enable row level security;

create policy "envios_select_own_or_master"
  on public.envios_nacionais for select
  using (user_id = auth.uid() or combined_with_user_id = auth.uid() or public.is_master());

create policy "envios_insert_own_or_master"
  on public.envios_nacionais for insert
  with check (user_id = auth.uid() or public.is_master());

create policy "envios_update_master"
  on public.envios_nacionais for update
  using (public.is_master());

create policy "envio_claims_select_via_envio"
  on public.envio_claims for select
  using (exists (
    select 1 from public.envios_nacionais e
    where e.id = envio_claims.envio_id
      and (e.user_id = auth.uid() or e.combined_with_user_id = auth.uid() or public.is_master())
  ));

create policy "envio_claims_write_via_envio"
  on public.envio_claims for all
  using (exists (
    select 1 from public.envios_nacionais e
    where e.id = envio_claims.envio_id
      and (e.user_id = auth.uid() or public.is_master())
  ))
  with check (exists (
    select 1 from public.envios_nacionais e
    where e.id = envio_claims.envio_id
      and (e.user_id = auth.uid() or public.is_master())
  ));

-- ----------------------------------------------------------------------------
-- 10. REPASSES
-- ----------------------------------------------------------------------------
create table public.repasses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'solicitado' check (status in ('solicitado', 'aprovado', 'pago', 'rejeitado')),
  created_at timestamptz not null default now()
);

create table public.repasse_claims (
  repasse_id uuid not null references public.repasses (id) on delete cascade,
  claim_id uuid not null references public.claims (id) on delete cascade,
  primary key (repasse_id, claim_id)
);

alter table public.repasses enable row level security;
alter table public.repasse_claims enable row level security;

create policy "repasses_select_own_or_master"
  on public.repasses for select
  using (user_id = auth.uid() or public.is_master());

create policy "repasses_insert_own_or_master"
  on public.repasses for insert
  with check (user_id = auth.uid() or public.is_master());

create policy "repasses_update_master"
  on public.repasses for update
  using (public.is_master());

create policy "repasse_claims_select_via_repasse"
  on public.repasse_claims for select
  using (exists (
    select 1 from public.repasses r
    where r.id = repasse_claims.repasse_id
      and (r.user_id = auth.uid() or public.is_master())
  ));

create policy "repasse_claims_write_via_repasse"
  on public.repasse_claims for all
  using (exists (
    select 1 from public.repasses r
    where r.id = repasse_claims.repasse_id
      and (r.user_id = auth.uid() or public.is_master())
  ))
  with check (exists (
    select 1 from public.repasses r
    where r.id = repasse_claims.repasse_id
      and (r.user_id = auth.uid() or public.is_master())
  ));

-- ----------------------------------------------------------------------------
-- 11. COMPROVANTES DE PAGAMENTO
-- ----------------------------------------------------------------------------
create table public.comprovantes_pagamento (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  claim_id uuid not null references public.claims (id),
  proof_url text not null,
  status text not null default 'enviado' check (status in ('enviado', 'confirmado', 'rejeitado')),
  created_at timestamptz not null default now()
);

alter table public.comprovantes_pagamento enable row level security;

create policy "comprovantes_select_own_or_master"
  on public.comprovantes_pagamento for select
  using (user_id = auth.uid() or public.is_master());

create policy "comprovantes_insert_own_or_master"
  on public.comprovantes_pagamento for insert
  with check (user_id = auth.uid() or public.is_master());

create policy "comprovantes_update_master"
  on public.comprovantes_pagamento for update
  using (public.is_master());

-- ----------------------------------------------------------------------------
-- 12. REPORTES (Reportar Erro / Sugestão)
-- ----------------------------------------------------------------------------
create table public.reportes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('erro', 'sugestao')),
  message text not null,
  status text not null default 'aberto' check (status in ('aberto', 'em_analise', 'resolvido')),
  admin_response text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reportes enable row level security;

create policy "reportes_select_own_or_master"
  on public.reportes for select
  using (user_id = auth.uid() or public.is_master());

create policy "reportes_insert_own_or_master"
  on public.reportes for insert
  with check (user_id = auth.uid() or public.is_master());

create policy "reportes_update_master"
  on public.reportes for update
  using (public.is_master());

create trigger trg_reportes_set_updated_at
  before update on public.reportes
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 13. STORAGE (buckets + policies)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('produtos', 'produtos', true),
  ('lojinha', 'lojinha', true),
  ('comprovantes', 'comprovantes', false)
on conflict (id) do nothing;

-- produtos / lojinha: leitura pública (são fotos de vitrine), escrita restrita.
create policy "produtos_public_read"
  on storage.objects for select
  using (bucket_id = 'produtos');

create policy "produtos_write_master"
  on storage.objects for all
  using (bucket_id = 'produtos' and public.is_master())
  with check (bucket_id = 'produtos' and public.is_master());

create policy "lojinha_bucket_public_read"
  on storage.objects for select
  using (bucket_id = 'lojinha');

create policy "lojinha_bucket_write_owner"
  on storage.objects for all
  using (
    bucket_id = 'lojinha'
    and (public.is_master() or (storage.foldername(name))[1] = auth.uid()::text)
  )
  with check (
    bucket_id = 'lojinha'
    and (public.is_master() or (storage.foldername(name))[1] = auth.uid()::text)
  );

-- comprovantes: bucket privado. Cada arquivo deve ser salvo em "<user_id>/arquivo.ext"
-- para que a política abaixo funcione — o próprio dono e a master enxergam/enviam.
create policy "comprovantes_owner_or_master"
  on storage.objects for all
  using (
    bucket_id = 'comprovantes'
    and (public.is_master() or (storage.foldername(name))[1] = auth.uid()::text)
  )
  with check (
    bucket_id = 'comprovantes'
    and (public.is_master() or (storage.foldername(name))[1] = auth.uid()::text)
  );

-- ============================================================================
-- Depois de rodar este arquivo:
-- 1. Crie sua conta pela tela de Cadastro do site (username @pur_pleki ou
--    @pur_plekii).
-- 2. Volte aqui no SQL Editor e rode, substituindo se necessário:
--      update public.profiles set role = 'master'
--      where username in ('pur_pleki', 'pur_plekii');
--    Isso te promove a administradora (master) do sistema.
-- ============================================================================
