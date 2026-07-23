"use client";

import { Fragment, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Inquiry,
  INQUIRY_STATUS_LABEL,
  InquiryStatus,
  ORDER_TYPE_LABEL,
  ORDER_TYPE_STAGES,
} from "@/lib/types";
import { deleteInquiry, updateInquiryStatus } from "@/app/admin/actions";
import { buildCannedMessage } from "@/lib/messages";

export default function InquiryTable({
  inquiries,
}: {
  inquiries: Inquiry[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<InquiryStatus>("new");
  const [draftTracking, setDraftTracking] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fallbackMessage, setFallbackMessage] = useState<{
    id: string;
    text: string;
  } | null>(null);

  function startEdit(inquiry: Inquiry) {
    setEditingId(inquiry.id);
    setDraftStatus(inquiry.status);
    setDraftTracking(inquiry.tracking_number ?? "");
  }

  function cancel() {
    setEditingId(null);
  }

  function handleSave(id: string) {
    startTransition(async () => {
      await updateInquiryStatus(id, draftStatus, draftTracking || null);
      cancel();
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("確定要刪除這筆詢問單嗎？")) return;
    startTransition(async () => {
      await deleteInquiry(id);
      router.refresh();
    });
  }

  async function handleCopyMessage(inquiry: Inquiry) {
    const message = buildCannedMessage(inquiry);
    if (!message) return;

    // navigator.clipboard 在某些情況下（權限被封鎖、不安全的 context…）
    // 不會 reject，而是永遠不 resolve，所以額外加逾時保護避免按鈕卡死。
    const timeout = new Promise<"timeout">((resolve) =>
      setTimeout(() => resolve("timeout"), 1500),
    );

    try {
      const result = await Promise.race([
        navigator.clipboard.writeText(message).then(() => "ok" as const),
        timeout,
      ]);

      if (result === "timeout") throw new Error("clipboard timed out");

      setCopiedId(inquiry.id);
      setTimeout(
        () => setCopiedId((current) => (current === inquiry.id ? null : current)),
        2000,
      );
    } catch {
      // 剪貼簿寫入失敗或逾時，改成把文字顯示出來讓你手動選取複製
      setFallbackMessage({ id: inquiry.id, text: message });
    }
  }

  if (inquiries.length === 0) {
    return (
      <p className="text-zinc-500 dark:text-zinc-400">
        目前還沒有顧客詢問，前台商品頁的「LINE 詢問」按鈕會自動記錄在這裡。
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-black/[.08] dark:border-white/[.145]">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-3 font-medium">時間</th>
            <th className="px-4 py-3 font-medium">商品</th>
            <th className="px-4 py-3 font-medium">類型</th>
            <th className="px-4 py-3 font-medium">價格</th>
            <th className="px-4 py-3 font-medium">狀態</th>
            <th className="px-4 py-3 font-medium">寄件編號</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {inquiries.map((inquiry) => {
            const isEditing = editingId === inquiry.id;
            const stages = ORDER_TYPE_STAGES[inquiry.order_type];
            const canned = buildCannedMessage(inquiry);

            return (
              <Fragment key={inquiry.id}>
              <tr
                className="border-t border-black/[.08] align-top dark:border-white/[.145]"
              >
                <td
                  className="px-4 py-3 text-zinc-500 dark:text-zinc-400"
                  suppressHydrationWarning
                >
                  {new Date(inquiry.created_at).toLocaleString("zh-TW")}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{inquiry.product_name}</p>
                  {inquiry.variant_label && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {inquiry.variant_label}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  {ORDER_TYPE_LABEL[inquiry.order_type]}
                </td>
                <td className="px-4 py-3">
                  NT$ {inquiry.price.toLocaleString()}
                </td>

                {isEditing ? (
                  <>
                    <td className="px-4 py-3">
                      <select
                        value={draftStatus}
                        onChange={(e) =>
                          setDraftStatus(e.target.value as InquiryStatus)
                        }
                        className="rounded-lg border border-black/[.12] px-2 py-1 text-sm dark:border-white/[.2] dark:bg-zinc-900"
                      >
                        {[...stages, "cancelled" as InquiryStatus].map((s) => (
                          <option key={s} value={s}>
                            {INQUIRY_STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={draftTracking}
                        onChange={(e) => setDraftTracking(e.target.value)}
                        placeholder="出貨後填寫"
                        className="w-32 rounded-lg border border-black/[.12] px-2 py-1 text-sm dark:border-white/[.2] dark:bg-zinc-900"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={cancel}
                          className="text-sm text-zinc-500 hover:underline"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => handleSave(inquiry.id)}
                          disabled={isPending}
                          className="text-sm font-medium hover:underline disabled:opacity-50"
                        >
                          {isPending ? "儲存中…" : "儲存"}
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3">
                      {INQUIRY_STATUS_LABEL[inquiry.status]}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {inquiry.tracking_number ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-4">
                        {canned && (
                          <button
                            onClick={() => handleCopyMessage(inquiry)}
                            className="text-sm hover:underline"
                          >
                            {copiedId === inquiry.id ? "已複製" : "複製訊息"}
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(inquiry)}
                          className="text-sm hover:underline"
                        >
                          編輯
                        </button>
                        <button
                          onClick={() => handleDelete(inquiry.id)}
                          disabled={isPending}
                          className="text-sm text-red-600 hover:underline disabled:opacity-50"
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
              {fallbackMessage?.id === inquiry.id && (
                <tr className="border-t border-black/[.08] dark:border-white/[.145]">
                  <td colSpan={7} className="px-4 py-3">
                    <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
                      瀏覽器不支援自動複製，請手動選取以下文字：
                    </p>
                    <textarea
                      readOnly
                      value={fallbackMessage.text}
                      rows={2}
                      onFocus={(e) => e.target.select()}
                      className="w-full rounded-lg border border-black/[.12] px-3 py-2 text-sm dark:border-white/[.2] dark:bg-zinc-900"
                    />
                    <button
                      onClick={() => setFallbackMessage(null)}
                      className="mt-2 text-sm text-zinc-500 hover:underline"
                    >
                      關閉
                    </button>
                  </td>
                </tr>
              )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
