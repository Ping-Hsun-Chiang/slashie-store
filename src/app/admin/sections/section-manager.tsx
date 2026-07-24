"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Section } from "@/lib/types";
import { deleteSection, saveSection, SectionInput } from "@/app/admin/actions";

// 只取英數字轉成網址代號；名稱是純中文等無法轉換時留空，
// 讓使用者自己填一個英文代號（欄位說明也是要求英文/數字/連字號）。
function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function emptySection(nextSortOrder: number): SectionInput {
  return { slug: "", name: "", sort_order: nextSortOrder, is_active: true };
}

export default function SectionManager({
  initialSections,
}: {
  initialSections: Section[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [draft, setDraft] = useState<SectionInput>(
    emptySection(initialSections.length + 1),
  );
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(section: Section) {
    setEditingId(section.id);
    setShowNewForm(false);
    setSlugTouched(true);
    setDraft({
      slug: section.slug,
      name: section.name,
      sort_order: section.sort_order,
      is_active: section.is_active,
    });
  }

  function startNew() {
    setEditingId(null);
    setShowNewForm(true);
    setSlugTouched(false);
    setDraft(emptySection(initialSections.length + 1));
  }

  function cancel() {
    setEditingId(null);
    setShowNewForm(false);
  }

  function handleNameChange(name: string) {
    setDraft((prev) => ({
      ...prev,
      name,
      slug: slugTouched ? prev.slug : slugify(name),
    }));
  }

  function handleSave() {
    setError(null);
    if (!draft.name.trim()) {
      setError("請輸入分類名稱");
      return;
    }
    if (!draft.slug.trim()) {
      setError("請輸入網址代號");
      return;
    }
    startTransition(async () => {
      try {
        await saveSection(editingId, draft);
        cancel();
        router.refresh();
      } catch {
        setError("儲存失敗，網址代號可能已經被使用");
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (
      !confirm(
        `確定要刪除分類「${name}」嗎？這個分類底下的商品不會被刪除，只會移除分類標籤。`,
      )
    )
      return;
    startTransition(async () => {
      await deleteSection(id);
      router.refresh();
    });
  }

  const formOpen = showNewForm || editingId !== null;

  return (
    <div className="flex flex-col gap-6">
      {!formOpen && (
        <button
          type="button"
          onClick={startNew}
          className="self-end rounded-full bg-brand px-5 py-2 text-sm font-medium text-brand-foreground hover:opacity-90"
        >
          + 新增分類
        </button>
      )}

      {formOpen && (
        <div className="flex flex-col gap-3 rounded-2xl border border-black/[.08] p-6 dark:border-white/[.145]">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <label className="flex flex-col gap-1 text-sm">
            分類名稱
            <input
              value={draft.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="例：中秋活動"
              className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            網址代號（英文/數字/連字號）
            <input
              value={draft.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setDraft({ ...draft, slug: e.target.value });
              }}
              placeholder="例：mid-autumn"
              className="rounded-lg border border-black/[.12] px-3 py-2 font-mono text-xs dark:border-white/[.2] dark:bg-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            排序（數字小的排前面）
            <input
              type="number"
              value={draft.sort_order}
              onChange={(e) =>
                setDraft({ ...draft, sort_order: Number(e.target.value) })
              }
              className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(e) =>
                setDraft({ ...draft, is_active: e.target.checked })
              }
            />
            啟用中（顯示在前台導覽列）
          </label>
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
              onClick={handleSave}
              disabled={isPending}
              className="rounded-full bg-brand px-5 py-2 text-sm font-medium text-brand-foreground hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "儲存中…" : "儲存"}
            </button>
          </div>
        </div>
      )}

      {initialSections.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">尚無分類。</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-black/[.08] dark:border-white/[.145]">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">名稱</th>
                <th className="px-4 py-3 font-medium">網址</th>
                <th className="px-4 py-3 font-medium">排序</th>
                <th className="px-4 py-3 font-medium">狀態</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {initialSections.map((section) => (
                <tr
                  key={section.id}
                  className="border-t border-black/[.08] dark:border-white/[.145]"
                >
                  <td className="px-4 py-3">{section.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                    /{section.slug}
                  </td>
                  <td className="px-4 py-3">{section.sort_order}</td>
                  <td className="px-4 py-3">
                    {section.is_active ? (
                      <span className="text-green-600">啟用中</span>
                    ) : (
                      <span className="text-zinc-400">已停用</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        onClick={() => startEdit(section)}
                        className="text-sm hover:underline"
                      >
                        編輯
                      </button>
                      <button
                        onClick={() => handleDelete(section.id, section.name)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        刪除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
