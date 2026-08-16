"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Product, Section, VARIANT_TYPE_LABEL } from "@/lib/types";
import { updateProductManagement } from "@/app/admin/actions";

type SortMode = "recent" | "name-asc" | "name-desc";

const SORT_LABEL: Record<SortMode, string> = {
  recent: "最新登記在前",
  "name-asc": "型號 A → Z",
  "name-desc": "型號 Z → A",
};

export default function ProductsTable({
  products,
  sections,
}: {
  products: Product[];
  sections: Section[];
}) {
  const [sortMode, setSortMode] = useState<SortMode>("recent");

  const sorted = useMemo(() => {
    if (sortMode === "recent") return products;
    const collated = [...products].sort((a, b) =>
      a.name.localeCompare(b.name, "zh-Hant"),
    );
    return sortMode === "name-asc" ? collated : collated.reverse();
  }, [products, sortMode]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2 text-sm">
        <label className="text-zinc-500 dark:text-zinc-400" htmlFor="sort-mode">
          排序
        </label>
        <select
          id="sort-mode"
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          className="rounded-lg border border-black/[.12] px-3 py-1.5 dark:border-white/[.2] dark:bg-zinc-900"
        >
          {(Object.keys(SORT_LABEL) as SortMode[]).map((mode) => (
            <option key={mode} value={mode}>
              {SORT_LABEL[mode]}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-black/[.08] dark:border-white/[.145]">
        <table className="w-full text-left text-sm [&_tr:first-child_th:first-child]:rounded-tl-2xl [&_tr:first-child_th:last-child]:rounded-tr-2xl">
          <thead className="bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-2 font-medium">型號</th>
              <th className="px-4 py-2 font-medium">鞋況</th>
              <th className="px-4 py-2 font-medium">盒況配件</th>
              <th className="px-4 py-2 font-medium">尺寸</th>
              <th className="px-4 py-2 font-medium">分類</th>
              <th className="px-4 py-2 font-medium">上架</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((product) => (
              <ProductRow key={product.id} product={product} sections={sections} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductRow({
  product,
  sections,
}: {
  product: Product;
  sections: Section[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [sectionIds, setSectionIds] = useState<string[]>(
    (product.product_sections ?? []).map((ps) => ps.sections.id),
  );
  const [isActive, setIsActive] = useState(product.is_active);

  function save(nextSectionIds: string[], nextIsActive: boolean) {
    startTransition(async () => {
      await updateProductManagement(product.id, nextSectionIds, nextIsActive);
      router.refresh();
    });
  }

  function toggleSection(id: string) {
    const next = sectionIds.includes(id)
      ? sectionIds.filter((s) => s !== id)
      : [...sectionIds, id];
    setSectionIds(next);
    save(next, isActive);
  }

  function handleActiveChange(e: React.ChangeEvent<HTMLInputElement>) {
    const nextIsActive = e.target.checked;
    setIsActive(nextIsActive);
    save(sectionIds, nextIsActive);
  }

  const variant = product.variants?.[0];

  return (
    <tr className="border-t border-black/[.08] align-middle dark:border-white/[.145]">
      <td className="px-4 py-2">
        <p className="font-medium">{product.name}</p>
        {product.brand && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {product.brand}
          </p>
        )}
      </td>
      <td className="px-4 py-2">
        {variant ? VARIANT_TYPE_LABEL[variant.variant_type] : "—"}
      </td>
      <td className="px-4 py-2">{variant?.box_note ?? "—"}</td>
      <td className="px-4 py-2">{variant?.size ?? "—"}</td>
      <td className="px-4 py-2">
        <SectionsDropdown
          sections={sections}
          selectedIds={sectionIds}
          onToggle={toggleSection}
          disabled={isPending}
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="checkbox"
          checked={isActive}
          onChange={handleActiveChange}
          disabled={isPending}
          className="h-4 w-4 rounded border-black/[.3] accent-brand disabled:opacity-50 dark:border-white/[.3]"
        />
      </td>
    </tr>
  );
}

function SectionsDropdown({
  sections,
  selectedIds,
  onToggle,
  disabled,
}: {
  sections: Section[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
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

  const label =
    selectedIds.length > 0
      ? sections
          .filter((s) => selectedIds.includes(s.id))
          .map((s) => s.name)
          .join("、")
      : "選擇";

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        className="min-w-[5rem] max-w-[10rem] truncate rounded-lg border border-black/[.12] px-2 py-1 text-left text-sm disabled:opacity-50 dark:border-white/[.2] dark:bg-zinc-900"
      >
        {label}
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-44 rounded-lg border border-black/[.12] bg-white p-2 shadow-lg dark:border-white/[.2] dark:bg-zinc-900">
          {sections.length === 0 ? (
            <p className="px-2 py-1 text-xs text-zinc-400">尚無分類</p>
          ) : (
            sections.map((s) => (
              <label
                key={s.id}
                className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-black/[.03] dark:hover:bg-white/[.06]"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(s.id)}
                  onChange={() => onToggle(s.id)}
                />
                {s.name}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}
