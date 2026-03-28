-- ============================================================
-- CORREÇÕES DO BANCO — cole no Supabase SQL Editor
-- ============================================================

-- 1. Adiciona coluna extra em classified_listings (para campos de carro/imóvel)
alter table if exists classified_listings 
  add column if not exists extra jsonb default '{}';

-- 2. Adiciona coluna published em mini_sites se não existir
alter table if exists mini_sites
  add column if not exists published boolean default false;

-- 3. Tabela de assinaturas
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  plan text not null default 'pro', -- 'pro' | 'business'
  price numeric not null,
  status text default 'active',
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table subscriptions enable row level security;
create policy "own_sub" on subscriptions for all using (auth.uid() = user_id);

-- 4. Tabela de renovações de slug (cobrança anual)
create table if not exists slug_renewals (
  id uuid default gen_random_uuid() primary key,
  registration_id uuid references slug_registrations on delete cascade,
  user_id uuid references auth.users not null,
  slug text not null,
  amount numeric default 12,
  paid_at timestamptz,
  due_at timestamptz,
  status text default 'pending', -- 'pending' | 'paid' | 'expired'
  created_at timestamptz default now()
);
alter table slug_renewals enable row level security;
create policy "own_renewals" on slug_renewals for all using (auth.uid() = user_id);

-- 5. Função que expira slugs não renovados e os coloca de volta no mercado
create or replace function expire_unpaid_slugs()
returns void language plpgsql as $$
begin
  -- Marca como expirado
  update slug_registrations
  set status = 'expired'
  where status = 'active'
    and expires_at < now();

  -- Remove o slug do mini site se expirou
  update mini_sites
  set slug = null
  where slug in (
    select slug from slug_registrations
    where status = 'expired'
  );
end;
$$;

-- 6. Adiciona índices para performance
create index if not exists idx_mini_sites_user on mini_sites(user_id);
create index if not exists idx_mini_sites_slug on mini_sites(slug);
create index if not exists idx_classified_type on classified_listings(type, status);
create index if not exists idx_slug_reg_user on slug_registrations(user_id, status);
