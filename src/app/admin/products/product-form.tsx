"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Section,
  VARIANT_TYPE_LABEL,
  VariantStatus,
  VariantType,
} from "@/lib/types";
import { saveProduct, ProductInput, VariantInput } from "@/app/admin/actions";
import { uploadProductImage } from "@/lib/supabase/storage";

const VARIANT_TYPES: VariantType[] = ["new_stock", "used_stock", "preorder"];
const VARIANT_STATUSES: VariantStatus[] = ["available", "sold", "hidden"];

function emptyVariant(): VariantInput {
  return {
    variant_type: "new_stock",
    size: "",
    condition_note: "",
    price: 0,
    cost_price: null,
    quantity: 1,
    status: "available",
    images: [],
    sort_order: 0,
  };
}

export default function ProductForm({
  productId,
  initialProduct,
  initialVariants,
  initialSectionIds,
  sections,
}: {
  productId: string | null;
  initialProduct: ProductInput;
  initialVariants: VariantInput[];
  initialSectionIds: string[];
  sections: Section[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [product, setProduct] = useState<ProductInput>(initialProduct);
  const [variants, setVariants] = useState<VariantInput[]>(
    initialVariants.length > 0 ? initialVariants : [emptyVariant()],
  );
  const [sectionIds, setSectionIds] = useState<string[]>(initialSectionIds);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingVariantIdx, setUploadingVariantIdx] = useState<number | null>(
    null,
  );

  function updateVariant(index: number, patch: Partial<VariantInput>) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    );
  }

  function handleVariantTypeChange(index: number, type: VariantType) {
    updateVariant(index, {
      variant_type: type,
      quantity: type === "new_stock" ? variants[index].quantity || 1 : 1,
    });
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCoverUpload(file: File) {
    setUploadingCover(true);
    try {
      const url = await uploadProductImage(file);
      setProduct((p) => ({ ...p, cover_image_url: url }));
    } catch {
      setError("封面圖片上傳失敗");
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleVariantImageUpload(index: number, files: FileList) {
    setUploadingVariantIdx(index);
    try {
      const urls = await Promise.all(
        Array.from(files).map((file) => uploadProductImage(file)),
      );
      updateVariant(index, { images: [...variants[index].images, ...urls] });
    } catch {
      setError("品項圖片上傳失敗");
    } finally {
      setUploadingVariantIdx(null);
    }
  }

  function removeVariantImage(index: number, imageUrl: string) {
    updateVariant(index, {
      images: variants[index].images.filter((url) => url !== imageUrl),
    });
  }

  function toggleSection(sectionId: string) {
    setSectionIds((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  }

  function handleSubmit() {
    setError(null);

    if (!product.name.trim()) {
      setError("請輸入型號名稱");
      return;
    }

    startTransition(async () => {
      try {
        const id = await saveProduct(productId, product, variants, sectionIds);
        router.replace(`/admin/products/${id}`);
        router.refresh();
      } catch {
        setError("儲存失敗，請稍後再試");
      }
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-950/40">
          {error}
        </p>
      )}

      <section className="flex flex-col gap-4 rounded-2xl border border-black/[.08] p-6 dark:border-white/[.145]">
        <h2 className="font-medium">型號基本資料</h2>

        <label className="flex flex-col gap-1 text-sm">
          型號名稱
          <input
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          品牌
          <input
            value={product.brand ?? ""}
            onChange={(e) =>
              setProduct({ ...product, brand: e.target.value || null })
            }
            className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
          />
        </label>

        <div className="flex flex-col gap-2 text-sm">
          分類（可複選）
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <label
                key={s.id}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                  sectionIds.includes(s.id)
                    ? "border-foreground"
                    : "border-black/[.12] dark:border-white/[.2]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={sectionIds.includes(s.id)}
                  onChange={() => toggleSection(s.id)}
                />
                {s.name}
              </label>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          描述
          <textarea
            value={product.description ?? ""}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value || null })
            }
            rows={3}
            className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
          />
        </label>

        <div className="flex flex-col gap-2 text-sm">
          封面圖片
          {product.cover_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.cover_image_url}
              alt=""
              className="h-32 w-32 rounded-lg object-cover"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleCoverUpload(file);
            }}
          />
          {uploadingCover && (
            <p className="text-xs text-zinc-500">上傳中…</p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={product.is_active}
            onChange={(e) =>
              setProduct({ ...product, is_active: e.target.checked })
            }
          />
          上架中（顧客可在前台看到）
        </label>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">規格 / 品項</h2>
          <button
            type="button"
            onClick={() => setVariants((prev) => [...prev, emptyVariant()])}
            className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
          >
            + 新增規格
          </button>
        </div>

        {variants.map((variant, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-2xl border border-black/[.08] p-6 dark:border-white/[.145]"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                規格 #{index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeVariant(index)}
                className="text-sm text-red-600 hover:underline"
              >
                移除
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <label className="flex flex-col gap-1 text-sm">
                類型
                <select
                  value={variant.variant_type}
                  onChange={(e) =>
                    handleVariantTypeChange(index, e.target.value as VariantType)
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
                  value={variant.size ?? ""}
                  onChange={(e) =>
                    updateVariant(index, { size: e.target.value || null })
                  }
                  className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                狀態
                <select
                  value={variant.status}
                  onChange={(e) =>
                    updateVariant(index, {
                      status: e.target.value as VariantStatus,
                    })
                  }
                  className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
                >
                  {VARIANT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s === "available"
                        ? "上架中"
                        : s === "sold"
                          ? "已售出"
                          : "隱藏"}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm">
                價格
                <input
                  type="number"
                  value={variant.price}
                  onChange={(e) =>
                    updateVariant(index, { price: Number(e.target.value) })
                  }
                  className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                成本（選填）
                <input
                  type="number"
                  value={variant.cost_price ?? ""}
                  onChange={(e) =>
                    updateVariant(index, {
                      cost_price: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                數量
                <input
                  type="number"
                  min={1}
                  disabled={variant.variant_type !== "new_stock"}
                  value={variant.quantity}
                  onChange={(e) =>
                    updateVariant(index, { quantity: Number(e.target.value) })
                  }
                  className="rounded-lg border border-black/[.12] px-3 py-2 disabled:opacity-50 dark:border-white/[.2] dark:bg-zinc-900"
                />
              </label>
            </div>

            {variant.variant_type === "used_stock" && (
              <label className="flex flex-col gap-1 text-sm">
                使用狀況說明
                <textarea
                  value={variant.condition_note ?? ""}
                  onChange={(e) =>
                    updateVariant(index, {
                      condition_note: e.target.value || null,
                    })
                  }
                  rows={2}
                  className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
                />
              </label>
            )}

            <div className="flex flex-col gap-2 text-sm">
              實品照片
              {variant.images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {variant.images.map((url) => (
                    <div key={url} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeVariantImage(index, url)}
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
                    handleVariantImageUpload(index, e.target.files);
                  }
                }}
              />
              {uploadingVariantIdx === index && (
                <p className="text-xs text-zinc-500">上傳中…</p>
              )}
            </div>
          </div>
        ))}
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="h-11 rounded-full bg-brand px-8 text-sm font-medium text-brand-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "儲存中…" : "儲存"}
        </button>
      </div>
    </div>
  );
}
