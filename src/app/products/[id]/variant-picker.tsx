"use client";

import { useState } from "react";
import { VARIANT_TYPE_LABEL, Variant, VariantType } from "@/lib/types";

const TYPE_ORDER: VariantType[] = ["new_stock", "used_stock", "preorder"];

function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("zh-TW");
}

export default function VariantPicker({
  productName,
  variants,
  lineUrl,
}: {
  productName: string;
  variants: Variant[];
  lineUrl?: string;
}) {
  const available = variants.filter((v) => v.status !== "hidden");
  const [selectedId, setSelectedId] = useState<string | null>(
    available[0]?.id ?? null,
  );

  const selected = available.find((v) => v.id === selectedId) ?? null;

  const grouped = TYPE_ORDER.map((type) => ({
    type,
    items: available
      .filter((v) => v.variant_type === type)
      .sort((a, b) => a.sort_order - b.sort_order),
  })).filter((group) => group.items.length > 0);

  const inquiryHref =
    lineUrl && selected
      ? `${lineUrl}?text=${encodeURIComponent(
          `您好，我想詢問「${productName}」${
            selected.size ? `尺寸 ${selected.size}` : ""
          }（${VARIANT_TYPE_LABEL[selected.variant_type]}）`,
        )}`
      : lineUrl;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1">
        <div className="aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900">
          {selected && selected.images.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selected.images[0]}
              alt={productName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
              尚無實品照片
            </div>
          )}
        </div>
        {selected && selected.images.length > 1 && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {selected.images.slice(1).map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt=""
                className="aspect-square rounded-lg object-cover"
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex-1">
        <h1 className="text-2xl font-semibold">{productName}</h1>

        {selected && (
          <p className="mt-2 text-xl font-semibold">
            NT$ {selected.price.toLocaleString()}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-5">
          {grouped.map((group) => (
            <div key={group.type}>
              <h3 className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {VARIANT_TYPE_LABEL[group.type]}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    disabled={item.status === "sold"}
                    className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                      selectedId === item.id
                        ? "border-foreground bg-foreground text-background"
                        : "border-black/[.12] hover:border-black/[.3] dark:border-white/[.2] dark:hover:border-white/[.4]"
                    } ${
                      item.status === "sold"
                        ? "cursor-not-allowed opacity-40"
                        : ""
                    }`}
                  >
                    {item.size ?? "單一規格"}
                    {item.status === "sold" && "（已售出）"}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="mt-6 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            {selected.condition_note && (
              <p>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  使用狀況：
                </span>
                {selected.condition_note}
              </p>
            )}
            {selected.preorder_batches && (
              <>
                <p>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    批次：
                  </span>
                  {selected.preorder_batches.batch_name}
                </p>
                {selected.preorder_batches.order_deadline && (
                  <p>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      截單日：
                    </span>
                    {formatDate(selected.preorder_batches.order_deadline)}
                  </p>
                )}
                {selected.preorder_batches.expected_arrival && (
                  <p>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      預計到貨：
                    </span>
                    {formatDate(selected.preorder_batches.expected_arrival)}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {selected && selected.status !== "sold" && inquiryHref && (
          <a
            href={inquiryHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-base font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            透過 LINE 詢問這個品項
          </a>
        )}
      </div>
    </div>
  );
}
