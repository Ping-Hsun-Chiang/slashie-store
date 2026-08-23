-- 銷售管理新增「寄件管道」欄位：面交、Shopee、7-11 店到店、7-11 賣貨便、郵局宅配，五選一。

alter table sales add column shipping_channel text not null default '面交'
  check (shipping_channel in ('面交', 'Shopee', '7-11 店到店', '7-11 賣貨便', '郵局宅配'));
