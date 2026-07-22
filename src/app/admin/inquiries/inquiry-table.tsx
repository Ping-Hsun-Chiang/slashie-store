"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Inquiry, INQUIRY_STATUS_LABEL, InquiryStatus } from "@/lib/types";
import { deleteInquiry, updateInquiryStatus } from "@/app/admin/actions";

const STATUSES = Object.keys(INQUIRY_STATUS_LABEL) as InquiryStatus[];

export default function InquiryTable({
  inquiries,
}: {
  inquiries: Inquiry[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(id: string, status: InquiryStatus) {
    startTransition(async () => {
      await updateInquiryStatus(id, status);
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

  if (inquiries.length === 0) {
    return (
      <p className="text-zinc-500 dark:text-zinc-400">
        目前還沒有顧客詢問，前台商品頁的「LINE 詢問」按鈕會自動記錄在這裡。
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-black/[.08] dark:border-white/[.145]">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-3 font-medium">時間</th>
            <th className="px-4 py-3 font-medium">商品</th>
            <th className="px-4 py-3 font-medium">價格</th>
            <th className="px-4 py-3 font-medium">狀態</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {inquiries.map((inquiry) => (
            <tr
              key={inquiry.id}
              className="border-t border-black/[.08] dark:border-white/[.145]"
            >
              <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
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
                NT$ {inquiry.price.toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <select
                  value={inquiry.status}
                  disabled={isPending}
                  onChange={(e) =>
                    handleStatusChange(
                      inquiry.id,
                      e.target.value as InquiryStatus,
                    )
                  }
                  className="rounded-lg border border-black/[.12] px-2 py-1 text-sm disabled:opacity-50 dark:border-white/[.2] dark:bg-zinc-900"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {INQUIRY_STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => handleDelete(inquiry.id)}
                  disabled={isPending}
                  className="text-sm text-red-600 hover:underline disabled:opacity-50"
                >
                  刪除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
