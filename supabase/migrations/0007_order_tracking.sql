-- 把詢問單的狀態機拆成「預購」跟「現貨」兩條追蹤流程：
-- 預購：已付款 -> 已向店家下單 -> 抵達集運倉 -> 抵達台灣 -> 已出貨
-- 現貨：確定下單 -> 已出貨
-- 出貨時可填寄件編號，供產生罐頭訊息使用。

alter table inquiries add column order_type text;
alter table inquiries add column tracking_number text;

-- 根據當時關聯的品項類型回填既有資料，品項已被刪除的就當現貨處理
update inquiries i
set order_type = case
  when v.variant_type = 'preorder' then 'preorder'
  else 'stock'
end
from variants v
where i.variant_id = v.id;

update inquiries set order_type = 'stock' where order_type is null;

alter table inquiries alter column order_type set not null;
alter table inquiries add constraint inquiries_order_type_check
  check (order_type in ('preorder', 'stock'));

alter table inquiries drop constraint inquiries_status_check;
alter table inquiries add constraint inquiries_status_check check (
  status in (
    'new', 'paid', 'ordered', 'in_transit', 'arrived_tw',
    'confirmed', 'shipped', 'completed', 'cancelled'
  )
);
