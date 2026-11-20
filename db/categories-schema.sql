create table if not exists categories (
  id text primary key check (id ~ '^[a-z0-9-]{1,60}$'),
  label text not null check (char_length(label) between 1 and 60),
  tagline text not null default '',
  image text not null default '',
  position integer not null default 100 check (position between 0 and 10000)
);

-- statement
insert into categories (id,label,tagline,image,position) values
('consoles','Consoles','Nova geração','/products/console-home.jpg',10),
('jogos','Jogos','Lançamentos e clássicos','/products/games-stack.jpg',20),
('controles','Controles','Domine a partida','/products/controller.jpg',30),
('acessorios','Acessórios','Setup completo','/products/headset.jpg',40),
('retro','Retrô','Nostalgia raiz','/products/console-retro.jpg',50)
on conflict (id) do nothing;

-- statement
alter table products drop constraint if exists products_category_check,
  add constraint products_category_fk foreign key (category) references categories(id);

-- statement
create index if not exists products_category_idx on products(category);

-- statement
create table if not exists category_images (
  category_id text primary key references categories(id) on delete cascade,
  mime text not null check (mime in ('image/jpeg','image/png','image/webp')),
  data_base64 text not null
);

-- statement
grant select on categories, category_images to gameland_store;

-- statement
grant select, insert, update, delete on categories, category_images to gameland_admin;
