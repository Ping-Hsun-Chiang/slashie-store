"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  InventoryItemInput,
  createInventoryItem,
  deleteInventoryItem,
  updateInventoryItem,
} from "@/app/admin/actions";
import {
  InventoryVariant,
  VARIANT_TYPE_LABEL,
  VariantType,
} from "@/lib/types";
import { uploadProductImage } from "@/lib/supabase/storage";

const VARIANT_TYPES: Extract<VariantType, "new_stock" | "used_stock">[] = [
  "new_stock",
  "used_stock",
];

function emptyItem(): InventoryItemInput {
  return {
    variant_type: "new_stock",
    size: "",
    condition_note: null,
    box_note: null,
    cost_price: null,
    quantity: 1,
    images: [],
  };
}

export default function InventoryManager({
  initialItems,
}: {
  initialItems: InventoryVariant[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [showNewForm, setShowNewForm] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newItem, setNewItem] = useState<InventoryItemInput>(emptyItem());

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<InventoryItemInput | null>(null);

  function startAdd() {
    setShowNewForm(true);
    setEditingId(null);
    setNewProductName("");
    setNewItem(emptyItem());
    setError(null);
  }

  function startEdit(item: InventoryVariant) {
    setEditingId(item.id);
    setShowNewForm(false);
    setError(null);
    setEditDraft({
      variant_type: item.variant_type as "new_stock" | "used_stock",
      size: item.size,
      condition_note: item.condition_note,
      box_note: item.box_note,
      cost_price: item.cost_price,
      quantity: item.quantity,
      images: item.images,
    });
  }

  function cancel() {
    setShowNewForm(false);
    setEditingId(null);
    setEditDraft(null);
  }

  function handleCreate() {
    setError(null);
    if (!newProductName.trim()) {
      setError("請輸入型號");
      return;
    }
    startTransition(async () => {
      try {
        await createInventoryItem({ name: newProductName.trim() }, newItem);
        cancel();
        router.refresh();
      } catch {
        setError("新增失敗，請稍後再試");
      }
    });
  }

  function handleUpdate(variantId: string) {
    if (!editDraft) return;
    setError(null);
    startTransition(async () => {
      try {
        await updateInventoryItem(variantId, editDraft);
        cancel();
        router.refresh();
      } catch {
        setError("儲存失敗，請稍後再試");
      }
    });
  }

  function handleDelete(id: string, label: string) {
    if (!confirm(`確定要刪除「${label}」這筆庫存嗎？`)) return;
    startTransition(async () => {
      await deleteInventoryItem(id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!showNewForm && editingId === null && (
        <button
          type="button"
          onClick={startAdd}
          className="self-end rounded-full bg-brand px-5 py-2 text-sm font-medium text-brand-foreground hover:opacity-90"
        >
          + 新增入庫
        </button>
      )}

      {showNewForm && (
        <div className="flex flex-col gap-3 rounded-2xl border border-black/[.08] p-6 dark:border-white/[.145]">
          <label className="flex flex-col gap-1 text-sm">
            型號
            <input
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              placeholder="例如：New Balance 990v6 Grey"
              className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
            />
          </label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            每次入庫都會建立一筆新商品，就算型號名稱重複也沒關係；品牌與分類之後可以到「商品管理」補上。
          </p>
          <ItemFields item={newItem} onChange={setNewItem} />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={cancel}
              className="text-sm text-zinc-500 hover:underline"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={isPending}
              className="rounded-full bg-brand px-5 py-2 text-sm font-medium text-brand-foreground hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "儲存中…" : "新增"}
            </button>
          </div>
        </div>
      )}

      {initialItems.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">
          目前尚無庫存資料，點右上角「新增入庫」開始登記。
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-black/[.08] dark:border-white/[.145]">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">型號</th>
                <th className="px-4 py-3 font-medium">鞋況</th>
                <th className="px-4 py-3 font-medium">盒況配件</th>
                <th className="px-4 py-3 font-medium">尺寸</th>
                <th className="px-4 py-3 font-medium">成本</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {initialItems.map((item) => {
                const isEditing = editingId === item.id;
                return (
                  <tr
                    key={item.id}
                    className="border-t border-black/[.08] align-top dark:border-white/[.145]"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.products.name}</p>
                      {item.products.brand && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {item.products.brand}
                        </p>
                      )}
                    </td>
                    {isEditing && editDraft ? (
                      <td colSpan={4} className="px-4 py-3">
                        <ItemFields item={editDraft} onChange={setEditDraft} inline />
                      </td>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          {VARIANT_TYPE_LABEL[item.variant_type]}
                        </td>
                        <td className="px-4 py-3">{item.box_note ?? "—"}</td>
                        <td className="px-4 py-3">{item.size ?? "—"}</td>
                        <td className="px-4 py-3">
                          {item.cost_price
                            ? `NT$ ${item.cost_price.toLocaleString()}`
                            : "—"}
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={cancel}
                            className="text-sm text-zinc-500 hover:underline"
                          >
                            取消
                          </button>
                          <button
                            onClick={() => handleUpdate(item.id)}
                            disabled={isPending}
                            className="text-sm font-medium hover:underline disabled:opacity-50"
                          >
                            {isPending ? "儲存中…" : "儲存"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-4">
                          <button
                            onClick={() => startEdit(item)}
                            className="text-sm hover:underline"
                          >
                            編輯
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(item.id, item.products.name)
                            }
                            className="text-sm text-red-600 hover:underline"
                          >
                            刪除
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ItemFields({
  item,
  onChange,
}: {
  item: InventoryItemInput;
  onChange: (item: InventoryItemInput) => void;
  inline?: boolean;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(files: FileList) {
    setUploading(true);
    try {
      const urls = await Promise.all(
        Array.from(files).map((file) => uploadProductImage(file)),
      );
      onChange({ ...item, images: [...item.images, ...urls] });
    } catch {
      // 上傳失敗時使用者可以重新選檔再試一次
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    onChange({ ...item, images: item.images.filter((u) => u !== url) });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          鞋況
          <select
            value={item.variant_type}
            onChange={(e) =>
              onChange({ ...item, variant_type: e.target.value as VariantType })
            }
            className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
          >
            {VARIANT_TYPES.map((t) => (
              <option key={t} value={t}>
                {VARIANT_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          盒況配件
          <input
            value={item.box_note ?? ""}
            onChange={(e) =>
              onChange({ ...item, box_note: e.target.value || null })
            }
            placeholder="例如：全新原盒、缺盒、附備用鞋帶"
            className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          尺寸
          <input
            value={item.size ?? ""}
            onChange={(e) => onChange({ ...item, size: e.target.value || null })}
            className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          成本
          <input
            type="number"
            value={item.cost_price ?? ""}
            onChange={(e) =>
              onChange({
                ...item,
                cost_price: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
          />
        </label>
      </div>

      {item.variant_type === "used_stock" && (
        <label className="flex flex-col gap-1 text-sm">
          使用狀況說明
          <textarea
            value={item.condition_note ?? ""}
            onChange={(e) =>
              onChange({ ...item, condition_note: e.target.value || null })
            }
            rows={2}
            className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
          />
        </label>
      )}

      <div className="flex flex-col gap-2 text-sm">
        實品照片
        {item.images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.images.map((url) => (
              <div key={url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleImageUpload(e.target.files);
            }
          }}
          className="file:rounded-lg file:border file:border-black/20 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium dark:file:border-white/20 dark:file:bg-zinc-900 dark:file:text-zinc-100"
        />
        {uploading && <p className="text-xs text-zinc-500">上傳中…</p>}
      </div>
    </div>
  );
}
