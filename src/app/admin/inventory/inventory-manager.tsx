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
  ProductOption,
  VARIANT_TYPE_LABEL,
  VariantStatus,
  VariantType,
} from "@/lib/types";

const VARIANT_TYPES: Extract<VariantType, "new_stock" | "used_stock">[] = [
  "new_stock",
  "used_stock",
];
const STATUS_LABEL: Record<VariantStatus, string> = {
  available: "上架中",
  hidden: "已入庫（未上架）",
  sold: "已售出",
};

function emptyItem(): InventoryItemInput {
  return {
    variant_type: "new_stock",
    size: "",
    cost_price: null,
    price: 0,
    quantity: 1,
    status: "hidden",
  };
}

function marginLabel(price: number, cost: number | null) {
  if (!cost) return "—";
  const margin = ((price - cost) / cost) * 100;
  return `${margin.toFixed(0)}%`;
}

export default function InventoryManager({
  initialItems,
  products,
}: {
  initialItems: InventoryVariant[];
  products: ProductOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [showNewForm, setShowNewForm] = useState(false);
  const [newProductId, setNewProductId] = useState(products[0]?.id ?? "");
  const [newItem, setNewItem] = useState<InventoryItemInput>(emptyItem());

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<InventoryItemInput | null>(null);

  function startAdd() {
    setShowNewForm(true);
    setEditingId(null);
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
      cost_price: item.cost_price,
      price: item.price,
      quantity: item.quantity,
      status: item.status,
    });
  }

  function cancel() {
    setShowNewForm(false);
    setEditingId(null);
    setEditDraft(null);
  }

  function handleCreate() {
    setError(null);
    if (!newProductId) {
      setError("請選擇型號");
      return;
    }
    startTransition(async () => {
      try {
        await createInventoryItem(newProductId, newItem);
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
            <select
              value={newProductId}
              onChange={(e) => setNewProductId(e.target.value)}
              className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brand ? `${p.brand} — ${p.name}` : p.name}
                </option>
              ))}
            </select>
          </label>
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
                <th className="px-4 py-3 font-medium">類型</th>
                <th className="px-4 py-3 font-medium">尺寸</th>
                <th className="px-4 py-3 font-medium">數量</th>
                <th className="px-4 py-3 font-medium">成本</th>
                <th className="px-4 py-3 font-medium">售價</th>
                <th className="px-4 py-3 font-medium">報酬率</th>
                <th className="px-4 py-3 font-medium">狀態</th>
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
                      <td colSpan={7} className="px-4 py-3">
                        <ItemFields item={editDraft} onChange={setEditDraft} inline />
                      </td>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          {VARIANT_TYPE_LABEL[item.variant_type]}
                        </td>
                        <td className="px-4 py-3">{item.size ?? "—"}</td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">
                          {item.cost_price
                            ? `NT$ ${item.cost_price.toLocaleString()}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          NT$ {item.price.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          {marginLabel(item.price, item.cost_price)}
                        </td>
                        <td className="px-4 py-3">
                          {STATUS_LABEL[item.status]}
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
  inline,
}: {
  item: InventoryItemInput;
  onChange: (item: InventoryItemInput) => void;
  inline?: boolean;
}) {
  return (
    <div
      className={
        inline
          ? "grid grid-cols-2 gap-3 sm:grid-cols-4"
          : "grid grid-cols-2 gap-3 sm:grid-cols-3"
      }
    >
      <label className="flex flex-col gap-1 text-sm">
        類型
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
        尺寸
        <input
          value={item.size ?? ""}
          onChange={(e) => onChange({ ...item, size: e.target.value || null })}
          className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        數量
        <input
          type="number"
          min={1}
          disabled={item.variant_type !== "new_stock"}
          value={item.quantity}
          onChange={(e) =>
            onChange({ ...item, quantity: Number(e.target.value) })
          }
          className="rounded-lg border border-black/[.12] px-3 py-2 disabled:opacity-50 dark:border-white/[.2] dark:bg-zinc-900"
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
      <label className="flex flex-col gap-1 text-sm">
        售價
        <input
          type="number"
          value={item.price}
          onChange={(e) => onChange({ ...item, price: Number(e.target.value) })}
          className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        狀態
        <select
          value={item.status}
          onChange={(e) =>
            onChange({ ...item, status: e.target.value as VariantStatus })
          }
          className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
        >
          {(Object.keys(STATUS_LABEL) as VariantStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
