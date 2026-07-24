import Link from "next/link";
import { getActiveSections, isSupabaseConfigured } from "@/lib/queries";
import SupabaseNotConfigured from "@/components/supabase-not-configured";

// 注意事項：想自行修改文字，直接編輯這個陣列即可，每一行是一條。
const NOTICES = [
  "商品皆為代購／現貨，下單前請詳閱商品說明與尺寸資訊。",
  "二手商品已標示使用狀況，如有需要更多細圖，歡迎於購買前提出。",
  "預購商品約 2-4 週左右到貨，如有提前或延後皆會訊息通知。",
  "代購皆有砍單風險，若不幸遭遇砍單狀況，我們將會立即通知並退款。",
  "交易與付款皆透過官方 LINE 溝通確認，恕不提供其他下單管道。",
  "對商品有任何疑問，歡迎下單前先行詢問，避免後續爭議狀況發生。",
];

export default async function Home() {
  if (!isSupabaseConfigured()) return <SupabaseNotConfigured />;

  const sections = await getActiveSections();
  const lineUrl = process.env.NEXT_PUBLIC_LINE_URL;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-6 py-16">
      <h1 className="mb-2 font-serif text-3xl font-medium">鞋槓青年 Slashie Store</h1>

      <div className="mb-14 flex max-w-xl flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="font-serif text-base text-zinc-800 dark:text-zinc-200">
            Since 2016，因為熱愛，所以堅持
          </p>
          <div className="h-px w-full bg-brand/20 dark:bg-white/20" />
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            專攻 New Balance 商品，
            <br className="hidden sm:block" />
            提供限量款式、熱門鞋款代購與現貨服務，另有販售周邊配件。
          </p>
        </div>

        <blockquote className="w-full max-w-sm border-x-2 border-brand/20 px-4 text-center text-sm leading-relaxed text-zinc-600 dark:border-white/15 dark:text-zinc-400">
          買賣互相尊重，我們用心服務好每位顧客，
          <br />
          買賣不成仁義在，交易成功與否在於緣分，
          <br />
          若有任何球鞋相關疑問，都歡迎訊息聊聊。
        </blockquote>

        <div className="w-full rounded-2xl border border-brand/15 bg-brand/[0.04] px-6 py-6 text-center dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            許願池開放中，有想要但沒有看到的商品嗎？
          </p>
          {lineUrl && (
            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex rounded-full bg-brand px-5 py-2 text-sm font-medium text-brand-foreground hover:opacity-90"
            >
              加入官方 LINE 詢問
            </a>
          )}
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section, index) => (
          <Link
            key={section.id}
            href={`/${section.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-black/[.08] bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/[.145] dark:bg-zinc-950"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -top-3 right-3 font-serif text-7xl font-bold text-black/[0.04] transition-colors duration-300 group-hover:text-brand/10 dark:text-white/[0.06] dark:group-hover:text-white/10"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="relative">
              <h2 className="font-serif text-xl font-medium">
                {section.name}
              </h2>
              <div className="mt-3 h-px w-8 bg-brand transition-all duration-300 group-hover:w-14 dark:bg-white/40" />
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors duration-300 group-hover:text-brand dark:text-zinc-400 dark:group-hover:text-white">
                查看商品
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-16 w-full max-w-xl border-t border-black/[.08] pt-8 text-sm text-zinc-600 dark:border-white/[.145] dark:text-zinc-400">
        <h2 className="mb-4 font-serif text-lg font-medium text-zinc-900 dark:text-zinc-100">
          注意事項
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          {NOTICES.map((notice) => (
            <li key={notice}>{notice}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
