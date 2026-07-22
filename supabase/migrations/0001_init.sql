-- 鞋槓青年 商店資料庫 schema
-- 結構：型號 (products) 為主體，底下掛規格/品項 (variants)。
-- 現貨新品可用 quantity 代表多雙庫存；二手與預購因每件狀況/名額不同，
-- 一律以獨立 variant 記錄（quantity 固定為 1），不可合併數量。

create extension if not exists "pgcrypto";

-- 預購批次
create table preorder_batches (
  id uuid primary key default gen_random_uuid(),
  batch_name text not null,
  order_deadline date,
  expected_arrival date,
  status text not null default 'open'
    check (status in ('open', 'closed', 'arrived', 'completed')),
  created_at timestamptz not null default now()
);

-- 型號（商品主體）
-- section 對應網站前台的三個分類頁：預購代購 / 現貨 / 配件
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  section text not null default 'in_stock'
    check (section in ('preorder', 'in_stock', 'accessory')),
  cover_image_url text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index products_section_idx on products(section);

-- 規格/品項（掛在型號底下）
create table variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  variant_type text not null
    check (variant_type in ('new_stock', 'used_stock', 'preorder')),
  size text,
  condition_note text,
  price numeric(10, 2) not null,
  quantity int not null default 1 check (quantity > 0),
  status text not null default 'available'
    check (status in ('available', 'sold', 'hidden')),
  batch_id uuid references preorder_batches(id),
  images text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),

  -- 二手與預購每筆都是獨立品項/名額，不可用數量合併
  constraint variants_unique_stock_qty check (
    variant_type = 'new_stock' or quantity = 1
  ),
  -- 只有預購類型的品項才會關聯批次
  constraint variants_batch_only_for_preorder check (
    (variant_type = 'preorder' and batch_id is not null)
    or (variant_type != 'preorder' and batch_id is null)
  )
);

create index variants_product_id_idx on variants(product_id);
create index variants_batch_id_idx on variants(batch_id);

-- Row Level Security：前台以匿名金鑰只能讀取上架中的資料，
-- 後台管理（新增/編輯/下架）一律透過 service role 或已登入的管理員操作。
alter table products enable row level security;
alter table variants enable row level security;
alter table preorder_batches enable row level security;

create policy "public can read active products"
  on products for select
  using (is_active = true);

create policy "public can read visible variants"
  on variants for select
  using (status != 'hidden');

create policy "public can read preorder batches"
  on preorder_batches for select
  using (true);
