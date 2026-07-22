-- 詢問單：顧客在前台點「LINE 詢問」時記錄一筆，後台可追蹤處理狀態。
-- 商品名稱/規格/價格用快照儲存，避免之後商品被改動或刪除導致歷史紀錄跑掉。

create table inquiries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  variant_id uuid references variants(id) on delete set null,
  product_name text not null,
  variant_label text,
  price numeric(10, 2) not null,
  status text not null default 'new'
    check (status in ('new', 'confirmed', 'deposit_paid', 'shipped', 'completed', 'cancelled')),
  note text,
  created_at timestamptz not null default now()
);

create index inquiries_created_at_idx on inquiries(created_at desc);

alter table inquiries enable row level security;

-- 任何人（含匿名訪客）都可以送出一筆詢問
create policy "anyone can create inquiry"
  on inquiries for insert
  with check (true);

-- 只有登入的管理員可以查看與處理
create policy "authenticated can manage inquiries"
  on inquiries for select
  using (auth.role() = 'authenticated');

create policy "authenticated can update inquiries"
  on inquiries for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated can delete inquiries"
  on inquiries for delete
  using (auth.role() = 'authenticated');
