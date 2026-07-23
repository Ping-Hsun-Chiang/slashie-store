-- 把原本寫死在 products.section 的 preorder/in_stock/accessory 三選一，
-- 改成後台可自由新增/排序/開關的動態分類，商品可同時掛多個分類。

create table sections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table product_sections (
  product_id uuid not null references products(id) on delete cascade,
  section_id uuid not null references sections(id) on delete cascade,
  primary key (product_id, section_id)
);

create index product_sections_section_id_idx on product_sections(section_id);

-- 預設三個分類，slug 對應原本的網址，行為不變
insert into sections (slug, name, sort_order) values
  ('preorder', '預購代購', 1),
  ('stock', '現貨', 2),
  ('accessories', '配件', 3);

-- 把既有商品的 section 欄位資料搬到新的關聯表
insert into product_sections (product_id, section_id)
select p.id, s.id
from products p
join sections s on
  (p.section = 'preorder' and s.slug = 'preorder') or
  (p.section = 'in_stock' and s.slug = 'stock') or
  (p.section = 'accessory' and s.slug = 'accessories');

alter table products drop column section;

alter table sections enable row level security;
alter table product_sections enable row level security;

create policy "public can read active sections"
  on sections for select
  using (is_active = true);

create policy "authenticated can manage sections"
  on sections for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "public can read product sections"
  on product_sections for select
  using (true);

create policy "authenticated can manage product sections"
  on product_sections for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
