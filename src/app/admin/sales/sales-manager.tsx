"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSale, deleteSale } from "@/app/admin/actions";
import {
  InventoryVariant,
  Sale,
  SHIPPING_CHANNELS,
  ShippingChannel,
  VARIANT_TYPE_LABEL,
} from "@/lib/types";

export default function SalesManager({
  initialSales,
  availableItems,
}: {
  initialSales: Sale[];
  availableItems: InventoryVariant[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [amount, setAmount] = useState<number | "">("");
  const [buyerName, setBuyerName] = useState("");
  const [shippingCode, setShippingCode] = useState("");
  const [shippingChannel, setShippingChannel] = useState<ShippingChannel>(
    SHIPPING_CHANNELS[0],
  );

  function startAdd() {
    setShowForm(true);
    setSelectedIds([]);
    setAmount("");
    setBuyerName("");
    setShippingCode("");
    setShippingChannel(SHIPPING_CHANNELS[0]);
    setError(null);
  }

  function cancel() {
    setShowForm(false);
  }

  function handleCreate() {
    setError(null);
    if (selectedIds.length === 0) {
      setError("請至少選擇一雙鞋");
      return;
    }
    if (!buyerName.trim()) {
      setError("請輸入買家姓名");
      return;
    }
    if (amount === "" || Number(amount) <= 0) {
      setError("請輸入銷售金額");
      return;
    }
    startTransition(async () => {
      try {
        await createSale(selectedIds, {
          amount: Number(amount),
          buyerName: buyerName.trim(),
          shippingCode: shippingCode.trim() || null,
          shippingChannel,
        });
        cancel();
        router.refresh();
      } catch {
        setError("儲存失敗，請稍後再試");
      }
    });
  }

  function handleDelete(saleId: string, label: string) {
    if (!confirm(`確定要刪除「${label}」這筆銷售紀錄嗎？相關品項會恢復為未售出。`))
      return;
    startTransition(async () => {
      await deleteSale(saleId);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!showForm && (
        <button
          type="button"
          onClick={startAdd}
          className="self-end rounded-full bg-brand px-5 py-2 text-sm font-medium text-brand-foreground hover:opacity-90"
        >
          + 新增銷售
        </button>
      )}

      {showForm && (
        <div className="flex flex-col gap-4 rounded-2xl border border-black/[.08] p-6 dark:border-white/[.145]">
          <div className="flex flex-col gap-1 text-sm">
            選擇售出品項
            <ItemPicker
              items={availableItems}
              selectedIds={selectedIds}
              onChange={setSelectedIds}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex flex-col gap-1 text-sm">
              銷售金額
              <input
                type="number"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value ? Number(e.target.value) : "")
                }
                className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              買家姓名
              <input
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              寄件管道
              <select
                value={shippingChannel}
                onChange={(e) =>
                  setShippingChannel(e.target.value as ShippingChannel)
                }
                className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
              >
                {SHIPPING_CHANNELS.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              寄件編碼
              <input
                value={shippingCode}
                onChange={(e) => setShippingCode(e.target.value)}
                className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
              />
            </label>
          </div>

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
              {isPending ? "儲存中…" : "儲存"}
            </button>
          </div>
        </div>
      )}

      {initialSales.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">目前尚無銷售紀錄。</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-black/[.08] dark:border-white/[.145]">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">售出品項</th>
                <th className="px-4 py-3 font-medium">日期</th>
                <th className="px-4 py-3 font-medium">買家</th>
                <th className="px-4 py-3 font-medium">寄件編碼</th>
                <th className="px-4 py-3 font-medium">銷售金額</th>
                <th className="px-4 py-3 font-medium">利潤</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {initialSales.map((sale) => {
                const totalCost = sale.sale_items.reduce(
                  (sum, item) => sum + (item.variants.cost_price ?? 0),
                  0,
                );
                const profit = sale.amount - totalCost;
                return (
                  <tr
                    key={sale.id}
                    className="border-t border-black/[.08] align-top dark:border-white/[.145]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {sale.sale_items.map((item) => (
                          <div key={item.id}>
                            <p className="font-medium">
                              {item.variants.products.name}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {VARIANT_TYPE_LABEL[item.variants.variant_type]}
                              {item.variants.size
                                ? `・${item.variants.size}`
                                : ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(sale.created_at).toLocaleDateString("zh-TW")}
                    </td>
                    <td className="px-4 py-3">{sale.buyer_name}</td>
                    <td className="px-4 py-3">{sale.shipping_code ?? "—"}</td>
                    <td className="px-4 py-3">
                      NT$ {sale.amount.toLocaleString()}
                    </td>
                    <td
                      className={`px-4 py-3 font-medium ${
                        profit >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      NT$ {profit.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(sale.id, sale.buyer_name)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        刪除
                      </button>
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

function ItemPicker({
  items,
  selectedIds,
  onChange,
}: {
  items: InventoryVariant[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const haystack = `${item.products.name} ${item.products.brand ?? ""} ${
        item.size ?? ""
      }`.toLowerCase();
      return haystack.includes(q);
    });
  }, [items, query]);

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));

  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((i) => i !== id)
        : [...selectedIds, id],
    );
  }

  function selectFromList(id: string) {
    toggle(id);
    setOpen(false);
  }

  return (
    <div className="relative flex flex-col gap-2" ref={ref}>
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <span
              key={item.id}
              className="flex items-center gap-1 rounded-full bg-brand/[0.08] px-3 py-1 text-xs text-zinc-700 dark:bg-white/[0.08] dark:text-zinc-200"
            >
              {item.products.name}
              {item.size ? `・${item.size}` : ""}
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="ml-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="搜尋型號、尺寸…"
        className="rounded-lg border border-black/[.12] px-3 py-2 text-sm dark:border-white/[.2] dark:bg-zinc-900"
      />

      {open && (
        <div className="absolute top-full z-10 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-black/[.12] bg-white shadow-lg dark:border-white/[.2] dark:bg-zinc-900">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-zinc-400">
              沒有符合的庫存品項
            </p>
          ) : (
            filtered.map((item) => (
              <label
                key={item.id}
                className="flex cursor-pointer items-center gap-3 border-b border-black/[.05] px-3 py-2 text-sm last:border-b-0 hover:bg-black/[.02] dark:border-white/[.05] dark:hover:bg-white/[.04]"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => selectFromList(item.id)}
                />
                <div className="flex flex-1 flex-col">
                  <span className="font-medium">{item.products.name}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {VARIANT_TYPE_LABEL[item.variant_type]}
                    {item.size ? `・${item.size}` : ""}
                    {item.cost_price != null
                      ? `・成本 NT$ ${item.cost_price.toLocaleString()}`
                      : ""}
                  </span>
                </div>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}
