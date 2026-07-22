export default function SupabaseNotConfigured() {
  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold">鞋槓青年 — 尚未連接資料庫</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        請建立 Supabase 專案，並將 URL 與 anon key 填入 <code>.env.local</code>
        （可參考 <code>.env.local.example</code>），重新啟動後即可看到商品列表。
      </p>
    </div>
  );
}
