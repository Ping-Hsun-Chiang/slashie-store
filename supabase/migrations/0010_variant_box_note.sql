-- 庫存管理新增「盒況配件」欄位，記錄鞋盒狀況與附贈配件（鞋帶、鞋墊等）

alter table variants add column box_note text;
