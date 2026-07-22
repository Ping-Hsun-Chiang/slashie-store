-- 範例資料，方便本機開發預覽用。上線前可自行刪除或保留。

insert into preorder_batches (id, batch_name, order_deadline, expected_arrival, status)
values (
  '11111111-1111-1111-1111-111111111111',
  '2026年8月代購團',
  '2026-08-10',
  '2026-09-05',
  'open'
);

-- 現貨（同時有全新與二手品項）
insert into products (id, name, brand, section, cover_image_url, description)
values (
  '22222222-2222-2222-2222-222222222222',
  'Air Jordan 1 Retro High OG "Chicago Lost and Found"',
  'Nike',
  'in_stock',
  null,
  '經典配色復刻，做舊細節處理。'
);

insert into variants (product_id, variant_type, size, condition_note, price, quantity, status, images, sort_order)
values
  ('22222222-2222-2222-2222-222222222222', 'new_stock', 'US 9', null, 12800, 2, 'available', '{}', 1),
  ('22222222-2222-2222-2222-222222222222', 'new_stock', 'US 10', null, 12800, 1, 'available', '{}', 2),
  ('22222222-2222-2222-2222-222222222222', 'used_stock', 'US 9', '9成新，鞋盒完整，右腳外側些微氧化', 9500, 1, 'available', '{}', 3),
  ('22222222-2222-2222-2222-222222222222', 'used_stock', 'US 9', '8成新，無鞋盒，鞋頭有輕微摺痕', 8600, 1, 'available', '{}', 4);

-- 預購代購
insert into products (id, name, brand, section, cover_image_url, description)
values (
  '33333333-3333-3333-3333-333333333333',
  'New Balance 990v6 "Grey"',
  'New Balance',
  'preorder',
  null,
  '美國代購，需等待海外出貨與運送時間。'
);

insert into variants (product_id, variant_type, size, price, quantity, status, images, batch_id, sort_order)
values
  ('33333333-3333-3333-3333-333333333333', 'preorder', 'US 8.5', 11500, 1, 'available', '{}', '11111111-1111-1111-1111-111111111111', 1),
  ('33333333-3333-3333-3333-333333333333', 'preorder', 'US 9', 11500, 1, 'available', '{}', '11111111-1111-1111-1111-111111111111', 2);

-- 配件
insert into products (id, name, brand, section, cover_image_url, description)
values (
  '44444444-4444-4444-4444-444444444444',
  '球鞋防塵收納盒（透明堆疊式）',
  null,
  'accessory',
  null,
  '可堆疊透明鞋盒，方便展示與收納。'
);

insert into variants (product_id, variant_type, price, quantity, status, images, sort_order)
values
  ('44444444-4444-4444-4444-444444444444', 'new_stock', 350, 10, 'available', '{}', 1);
