-- 移除預購批次功能：預購不再需要批次概念，直接用品項本身即可。

alter table variants drop constraint if exists variants_batch_only_for_preorder;
drop index if exists variants_batch_id_idx;
alter table variants drop column if exists batch_id;
drop table if exists preorder_batches;
