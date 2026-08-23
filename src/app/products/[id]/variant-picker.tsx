"use client";

import { useEffect, useState } from "react";
import { VARIANT_TYPE_LABEL, Variant, VariantType } from "@/lib/types";

const TYPE_ORDER: VariantType[] = ["new_stock", "used_stock", "preorder"];

export default function VariantPicker({
  productName,
  variants,
  fallbackImages,
  lineUrl,
}: {
  productName: string;
  variants: Variant[];
  fallbackImages?: string[];
  lineUrl?: string;
}) {
  const available = variants.filter((v) => v.status !== "hidden");
  const [selectedId, setSelectedId] = useState<string | null>(
    available[0]?.id ?? null,
  );

  const selected = available.find((v) => v.id === selectedId) ?? null;
  const displayImages =
    selected && selected.images.length > 0
      ? selected.images
      : (fallbackImages ?? []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [selectedId]);

  useEffect(() => {
    if (activeIndex >= displayImages.length) setActiveIndex(0);
  }, [displayImages.length, activeIndex]);

  useEffect(() => {
    if (!lightboxOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") {
        setActiveIndex((i) => (i + 1) % displayImages.length);
      }
      if (e.key === "ArrowLeft") {
        setActiveIndex(
          (i) => (i - 1 + displayImages.length) % displayImages.length,
        );
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, displayImages.length]);

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
        <div
          className={`aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 ${
            displayImages.length > 0 ? "cursor-zoom-in" : ""
          }`}
          onClick={() => displayImages.length > 0 && setLightboxOpen(true)}
        >
          {displayImages.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayImages[activeIndex]}
              alt={productName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
              尚無實品照片
            </div>
          )}
        </div>
        {displayImages.length > 1 && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {displayImages.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                  i === activeIndex
                    ? "border-brand"
                    : "border-transparent hover:border-black/20 dark:hover:border-white/30"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1">
        <h1 className="font-serif text-2xl font-medium">{productName}</h1>

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
                        ? "border-brand bg-brand text-brand-foreground"
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

        {selected && selected.condition_note && (
          <div className="mt-6 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                使用狀況：
              </span>
              {selected.condition_note}
            </p>
          </div>
        )}

        {selected && selected.status !== "sold" && inquiryHref && (
          <div className="mt-8">
            <a
              href={inquiryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full bg-brand px-8 text-base font-medium text-brand-foreground transition-opacity hover:opacity-90"
            >
              立即購買
            </a>
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              點擊「立即購買」將導向官方 LINE，後續溝通、確認與匯款均在 LINE 內進行。
            </p>
          </div>
        )}
      </div>

      {lightboxOpen && displayImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20"
            aria-label="關閉"
          >
            ×
          </button>

          {displayImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(
                    (i) => (i - 1 + displayImages.length) % displayImages.length,
                  );
                }}
                className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20"
                aria-label="上一張"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((i) => (i + 1) % displayImages.length);
                }}
                className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20"
                aria-label="下一張"
              >
                ›
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayImages[activeIndex]}
            alt={productName}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {displayImages.length > 1 && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/70">
              {activeIndex + 1} / {displayImages.length}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
