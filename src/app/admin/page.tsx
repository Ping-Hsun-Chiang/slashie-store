import Link from "next/link";

export default function AdminHome() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-semibold">後台管理</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/products"
          className="rounded-2xl border border-black/[.08] bg-white p-8 transition-shadow hover:shadow-md dark:border-white/[.145] dark:bg-zinc-950"
        >
          <h2 className="text-lg font-semibold">商品管理</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            新增/編輯型號、規格與圖片，勾選分類
          </p>
        </Link>
        <Link
          href="/admin/sections"
          className="rounded-2xl border border-black/[.08] bg-white p-8 transition-shadow hover:shadow-md dark:border-white/[.145] dark:bg-zinc-950"
        >
          <h2 className="text-lg font-semibold">分類管理</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            新增/排序/開關前台主選項，例如活動分類
          </p>
        </Link>
        <Link
          href="/admin/inventory"
          className="rounded-2xl border border-black/[.08] bg-white p-8 transition-shadow hover:shadow-md dark:border-white/[.145] dark:bg-zinc-950"
        >
          <h2 className="text-lg font-semibold">庫存管理</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            現貨/配件快速入庫、成本與報酬率
          </p>
        </Link>
        <Link
          href="/admin/batches"
          className="rounded-2xl border border-black/[.08] bg-white p-8 transition-shadow hover:shadow-md dark:border-white/[.145] dark:bg-zinc-950"
        >
          <h2 className="text-lg font-semibold">預購批次</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            管理截單日、預計到貨日與批次狀態
          </p>
        </Link>
        <Link
          href="/admin/inquiries"
          className="rounded-2xl border border-black/[.08] bg-white p-8 transition-shadow hover:shadow-md dark:border-white/[.145] dark:bg-zinc-950"
        >
          <h2 className="text-lg font-semibold">詢問單</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            追蹤顧客透過 LINE 詢問的商品與處理狀態
          </p>
        </Link>
      </div>
    </div>
  );
}
