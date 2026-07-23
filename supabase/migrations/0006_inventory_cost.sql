-- 庫存管理：現貨/配件（variant_type = new_stock / used_stock）需要記錄成本，
-- 才能算報酬率。「已上架」沿用 status=available，「已入庫未上架」沿用 status=hidden，
-- 不新增狀態欄位，維持既有的上架/隱藏邏輯。

alter table variants add column cost_price numeric(10, 2);
