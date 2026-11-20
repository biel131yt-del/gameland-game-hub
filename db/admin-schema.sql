create table if not exists admin_accounts (
  id uuid primary key default gen_random_uuid(),
  username text not null unique check (username ~ '^[a-z0-9._-]{3,40}$'),
  name text not null,
  password_hash text not null,
  role text not null check (role in ('dono', 'funcionario')),
  active boolean not null default true,
  must_change_password boolean not null default true
);

-- statement
create table if not exists admin_sessions (
  token_hash text primary key,
  account_id uuid not null references admin_accounts(id) on delete cascade,
  expires_at timestamptz not null
);

-- statement
create table if not exists admin_login_attempts (
  account_id uuid primary key references admin_accounts(id) on delete cascade,
  window_start timestamptz not null,
  attempts integer not null
);

-- statement
alter table sales add column if not exists checkout_key uuid unique;

-- statement
create or replace function public.record_gameland_sale(
  p_lines jsonb, p_name text, p_channel text, p_delivery text, p_address text,
  p_notes text, p_payment text, p_checkout_key uuid, p_actor text
) returns table (id uuid, total integer, items jsonb)
language plpgsql security definer set search_path = pg_catalog, public
as $$
declare
  sale_id uuid;
  line_count integer;
  priced_count integer;
begin
  if p_checkout_key is not null then
    perform pg_advisory_xact_lock(hashtextextended(p_checkout_key::text, 0));
    select s.id into sale_id from public.sales s where s.checkout_key = p_checkout_key;
  end if;

  if sale_id is null then
    if jsonb_typeof(p_lines) is distinct from 'array' or jsonb_array_length(p_lines) not between 1 and 30
      or char_length(trim(coalesce(p_name, ''))) not between 1 and 120 then
      raise exception using errcode = 'P0001', message = 'Pedido inválido.';
    end if;

    select count(*) into line_count
    from jsonb_to_recordset(p_lines) as l("productId" text, quantity integer)
    where l.quantity between 1 and 20;
    if line_count <> jsonb_array_length(p_lines) then
      raise exception using errcode = 'P0001', message = 'Quantidade inválida.';
    end if;

    insert into public.sales (customer_name, channel, delivery, address, notes, payment_method, checkout_key, created_by, sale_date)
    values (p_name, p_channel, p_delivery, p_address, p_notes, p_payment, p_checkout_key, p_actor, (now() at time zone 'America/Sao_Paulo')::date)
    returning sales.id into sale_id;

    insert into public.sale_items (sale_id, product_id, product_name, quantity, unit_price_cents, unit_cost_cents)
    select sale_id, p.id, p.name, sum(l.quantity)::int, p.price_cents, p.cost_cents
    from jsonb_to_recordset(p_lines) as l("productId" text, quantity integer)
    join public.products p on p.id = l."productId" and p.active
    group by p.id
    having sum(l.quantity) between 1 and least(p.stock, 20);

    get diagnostics priced_count = row_count;
    if priced_count <> line_count then
      raise exception using errcode = 'P0001', message = 'Um item ficou indisponível ou está sem estoque suficiente. Atualize o carrinho.';
    end if;

    update public.sales s set total_cents = (
      select sum(si.quantity * si.unit_price_cents) from public.sale_items si where si.sale_id = s.id
    ) where s.id = sale_id;
  end if;

  return query
  select s.id, s.total_cents, (
    select jsonb_agg(jsonb_build_object('id', si.product_id, 'name', si.product_name,
      'price', si.unit_price_cents, 'quantity', si.quantity) order by si.product_name)
    from public.sale_items si where si.sale_id = s.id
  )
  from public.sales s where s.id = sale_id;
end;
$$;

-- statement
revoke execute on function public.record_gameland_sale(jsonb,text,text,text,text,text,text,uuid,text) from public;

-- statement
create or replace function public.update_gameland_sale(p_id uuid, p_status text, p_actor text)
returns void language plpgsql security definer set search_path = pg_catalog, public
as $$
declare
  previous text;
  line record;
  change integer;
begin
  if p_status not in ('pendente', 'concluida', 'cancelada') or p_status is null then
    raise exception using errcode = 'P0001', message = 'Status inválido.';
  end if;
  select status into previous from public.sales where id = p_id for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'Venda não encontrada.';
  end if;
  if previous = p_status then return; end if;

  if previous = 'concluida' or p_status = 'concluida' then
    for line in select product_id, product_name, quantity from public.sale_items
      where sale_id = p_id order by product_id loop
      change := case when p_status = 'concluida' then -line.quantity else line.quantity end;
      update public.products set stock = stock + change, updated_at = now()
        where id = line.product_id and stock + change >= 0;
      if not found then
        raise exception using errcode = 'P0001', message = 'Estoque insuficiente para ' || line.product_name || '.';
      end if;
      insert into public.stock_movements (product_id, delta, reason, sale_id, created_by)
        values (line.product_id, change, 'Venda ' || p_status, p_id, p_actor);
    end loop;
  end if;

  update public.sales set status = p_status where id = p_id;
end;
$$;

-- statement
revoke execute on function public.update_gameland_sale(uuid,text,text) from public;

-- statement
create or replace function public.adjust_gameland_stock(p_id text, p_stock integer, p_actor text)
returns void language plpgsql security definer set search_path = pg_catalog, public
as $$
declare previous integer;
begin
  select stock into previous from public.products where id = p_id for update;
  if not found or p_stock < 0 or p_stock > 100000 then
    raise exception using errcode = 'P0001', message = 'Estoque inválido.';
  end if;
  if p_stock <> previous then
    update public.products set stock = p_stock, updated_at = now() where id = p_id;
    insert into public.stock_movements (product_id, delta, reason, created_by)
      values (p_id, p_stock - previous, 'Ajuste de estoque', p_actor);
  end if;
end;
$$;

-- statement
revoke execute on function public.adjust_gameland_stock(text,integer,text) from public;

-- statement
grant execute on function public.record_gameland_sale(jsonb,text,text,text,text,text,text,uuid,text) to gameland_store;
