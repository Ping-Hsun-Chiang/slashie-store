-- 銷售管理：記錄成交的品項、金額與買家資訊。
-- 成交後品項狀態改為 sold（沿用既有狀態機，不新增欄位），
-- 庫存管理/商品管理維持顯示但改為刪除線標示，不再出現在新增銷售的可選清單。

create table sales (
  id uuid primary key default gen_random_uuid(),
  amount numeric(10, 2) not null,
  buyer_name text not null,
  shipping_code text,
  created_at timestamptz not null default now()
);

create table sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  variant_id uuid not null references variants(id) on delete cascade,
  unique (variant_id)
);

create index sale_items_sale_id_idx on sale_items(sale_id);
create index sales_created_at_idx on sales(created_at desc);

-- 買家姓名、寄件編碼屬於內部資料，不開放匿名讀取
alter table sales enable row level security;
alter table sale_items enable row level security;

create policy "authenticated can manage sales"
  on sales for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated can manage sale items"
  on sale_items for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
