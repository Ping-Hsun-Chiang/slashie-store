"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PreorderBatch, BatchStatus } from "@/lib/types";
import { deleteBatch, saveBatch, BatchInput } from "@/app/admin/actions";

const STATUS_LABEL: Record<BatchStatus, string> = {
  open: "開放中",
  closed: "已截單",
  arrived: "已到貨",
  completed: "已完成",
};

function emptyBatch(): BatchInput {
  return {
    batch_name: "",
    order_deadline: null,
    expected_arrival: null,
    status: "open",
  };
}

export default function BatchManager({
  initialBatches,
}: {
  initialBatches: PreorderBatch[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [draft, setDraft] = useState<BatchInput>(emptyBatch());
  const [error, setError] = useState<string | null>(null);

  function startEdit(batch: PreorderBatch) {
    setEditingId(batch.id);
    setShowNewForm(false);
    setDraft({
      batch_name: batch.batch_name,
      order_deadline: batch.order_deadline,
      expected_arrival: batch.expected_arrival,
      status: batch.status,
    });
  }

  function startNew() {
    setEditingId(null);
    setShowNewForm(true);
    setDraft(emptyBatch());
  }

  function cancel() {
    setEditingId(null);
    setShowNewForm(false);
  }

  function handleSave() {
    setError(null);
    if (!draft.batch_name.trim()) {
      setError("請輸入批次名稱");
      return;
    }
    startTransition(async () => {
      try {
        await saveBatch(editingId, draft);
        cancel();
        router.refresh();
      } catch {
        setError("儲存失敗，請稍後再試");
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`確定要刪除批次「${name}」嗎？`)) return;
    startTransition(async () => {
      await deleteBatch(id);
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
          + 新增批次
        </button>
      )}

      {formOpen && (
        <div className="flex flex-col gap-3 rounded-2xl border border-black/[.08] p-6 dark:border-white/[.145]">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <label className="flex flex-col gap-1 text-sm">
            批次名稱
            <input
              value={draft.batch_name}
              onChange={(e) =>
                setDraft({ ...draft, batch_name: e.target.value })
              }
              className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              截單日
              <input
                type="date"
                value={draft.order_deadline ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, order_deadline: e.target.value || null })
                }
                className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              預計到貨日
              <input
                type="date"
                value={draft.expected_arrival ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    expected_arrival: e.target.value || null,
                  })
                }
                className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            狀態
            <select
              value={draft.status}
              onChange={(e) =>
                setDraft({ ...draft, status: e.target.value as BatchStatus })
              }
              className="rounded-lg border border-black/[.12] px-3 py-2 dark:border-white/[.2] dark:bg-zinc-900"
            >
              {(Object.keys(STATUS_LABEL) as BatchStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
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

      {initialBatches.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">尚無批次。</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-black/[.08] dark:border-white/[.145]">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">批次名稱</th>
                <th className="px-4 py-3 font-medium">截單日</th>
                <th className="px-4 py-3 font-medium">預計到貨</th>
                <th className="px-4 py-3 font-medium">狀態</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {initialBatches.map((batch) => (
                <tr
                  key={batch.id}
                  className="border-t border-black/[.08] dark:border-white/[.145]"
                >
                  <td className="px-4 py-3">{batch.batch_name}</td>
                  <td className="px-4 py-3">{batch.order_deadline ?? "—"}</td>
                  <td className="px-4 py-3">{batch.expected_arrival ?? "—"}</td>
                  <td className="px-4 py-3">{STATUS_LABEL[batch.status]}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        onClick={() => startEdit(batch)}
                        className="text-sm hover:underline"
                      >
                        編輯
                      </button>
                      <button
                        onClick={() => handleDelete(batch.id, batch.batch_name)}
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
