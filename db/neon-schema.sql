-- Gameland: run once in the Neon database (all business data lives in Neon).
create extension if not exists pgcrypto;

create table if not exists products (
  id text primary key,
  name text not null,
  category text not null check (category in ('consoles','jogos','controles','acessorios','retro')),
  price_cents integer not null check (price_cents >= 0),
  old_price_cents integer check (old_price_cents is null or old_price_cents >= 0),
  cost_cents integer not null default 0 check (cost_cents >= 0),
  stock integer not null default 0,
  min_stock integer not null default 2,
  image_url text not null default '',
  condition text not null default 'Novo' check (condition in ('Novo','Seminovo')),
  badge text,
  featured boolean not null default false,
  active boolean not null default true,
  description text not null default '',
  specs text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_images (
  product_id text primary key references products(id) on delete cascade,
  mime text not null,
  data_base64 text not null,
  updated_at timestamptz not null default now()
);

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  sale_date date not null default current_date,
  channel text not null default 'loja' check (channel in ('site','loja','whatsapp','instagram')),
  status text not null default 'pendente' check (status in ('pendente','concluida','cancelada')),
  customer_name text not null default '',
  customer_phone text,
  delivery text,
  address text,
  payment_method text,
  notes text,
  discount_cents integer not null default 0 check (discount_cents >= 0),
  total_cents integer not null default 0,
  created_by text
);
create index if not exists sales_date_idx on sales (sale_date desc, created_at desc);
create index if not exists sales_status_idx on sales (status);

create table if not exists sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  product_id text references products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  unit_cost_cents integer not null default 0
);
create index if not exists sale_items_sale_idx on sale_items (sale_id);

create table if not exists stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references products(id) on delete cascade,
  delta integer not null,
  reason text not null,
  sale_id uuid references sales(id) on delete set null,
  created_by text,
  created_at timestamptz not null default now()
);
create index if not exists stock_movements_product_idx on stock_movements (product_id, created_at desc);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  expense_date date not null default current_date,
  description text not null,
  category text not null,
  amount_cents integer not null check (amount_cents > 0),
  payment_method text,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists expenses_date_idx on expenses (expense_date desc);

-- user_id = login account id from the app's sign-in system.
create table if not exists team_members (
  user_id uuid primary key,
  email text not null,
  name text not null default '',
  role text not null check (role in ('dono','funcionario')),
  created_at timestamptz not null default now()
);

insert into products (id, name, category, price_cents, old_price_cents, cost_cents, stock, image_url, condition, badge, featured, description, specs) values
('playstation-5-slim','PlayStation 5 Slim','consoles',379990,419990,320000,4,'/products/console-home.jpg','Novo','Mais vendido',true,'Console de nova geração com SSD ultrarrápido, gráficos em 4K e controle sem fio com resposta tátil.','{"SSD de 1TB","Leitor de disco","1 controle sem fio","Garantia de 12 meses"}'),
('nintendo-switch-oled','Nintendo Switch OLED','consoles',229990,null,185000,3,'/products/console-handheld.jpg','Novo','Portátil',true,'Jogue na TV ou em qualquer lugar com a tela OLED de 7 polegadas e cores vibrantes.','{"Tela OLED 7\"","64GB de memória","Joy-Con neon","Base para TV"}'),
('super-nintendo-classico','Super Nintendo Clássico','retro',89990,null,50000,1,'/products/console-retro.jpg','Seminovo','Raridade',true,'O clássico dos anos 90 revisado e testado, pronto para reviver as melhores tardes de jogatina.','{"Testado e revisado","1 controle original","Cabos inclusos","Garantia de 3 meses"}'),
('controle-pro-sem-fio','Controle Pro Sem Fio','controles',34990,39990,22000,10,'/products/controller.jpg','Novo',null,true,'Pegada confortável, gatilhos precisos e bateria para longas sessões. Compatível com PC e consoles.','{"Bluetooth e cabo USB-C","Bateria de até 30h","Vibração dupla","Compatível com PC"}'),
('headset-gamer-rgb','Headset Gamer RGB','acessorios',24990,null,14000,6,'/products/headset.jpg','Novo','Novidade',true,'Som surround imersivo, microfone com cancelamento de ruído e iluminação RGB que dá vida ao setup.','{"Som surround 7.1","Microfone removível","Iluminação RGB","Suporte incluso"}'),
('ea-sports-fc-26-ps5','EA Sports FC 26 — PS5','jogos',29990,null,21000,8,'/products/games-stack.jpg','Novo','Lançamento',true,'O futebol mais jogado do mundo com novos modos de carreira e Ultimate Team.','{"Mídia física","Português","1 a 4 jogadores","Online"}'),
('mario-kart-8-deluxe','Mario Kart 8 Deluxe — Switch','jogos',27990,null,19000,5,'/products/games-stack.jpg','Novo',null,false,'Corridas para jogar com a família e os amigos, com todas as pistas e personagens.','{"Mídia física","Até 4 na mesma tela","Online","Livre para todos"}'),
('gta-v-ps5','GTA V — PS5','jogos',14990,19990,8000,2,'/products/games-stack.jpg','Seminovo',null,false,'Mundo aberto gigante com modo história e GTA Online. Disco revisado, sem riscos.','{"Mídia física","Legendas em português","Online","Disco revisado"}'),
('controle-retro-usb','Controle Retrô USB','retro',6990,null,3000,15,'/products/console-retro.jpg','Novo',null,false,'Controle no estilo clássico para jogar seus retrôs favoritos no PC ou em mini consoles.','{"Conexão USB","Plug and play","Cabo de 1,8m","Compatível com PC"}')
on conflict (id) do nothing;
