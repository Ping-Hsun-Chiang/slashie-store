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
      <div className="mb-14 flex max-w-xl flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="flex flex-col items-center gap-1.5">
            <span className="font-serif text-4xl font-medium">鞋槓青年</span>
            <span className="text-[11px] font-medium tracking-[0.4em] text-zinc-500 dark:text-zinc-400">
              SLASHIE STORE
            </span>
          </h1>

          <div className="mt-1 inline-flex items-center rounded-full border border-brand/15 bg-brand/[0.04] px-4 py-1.5 dark:border-white/10 dark:bg-white/[0.05]">
            <span className="font-serif text-sm text-zinc-800 dark:text-zinc-200">
              Since 2016，因為熱愛，所以堅持
            </span>
          </div>

          <div className="flex items-center gap-2 text-brand/30 dark:text-white/25">
            <span className="h-px w-8 bg-current" />
            <span className="h-1 w-1 rotate-45 bg-current" />
            <span className="h-px w-8 bg-current" />
          </div>

          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            專攻 New Balance 商品，
            <br className="hidden sm:block" />
            提供限量款式、熱門鞋款代購與現貨服務，另有販售周邊配件。
          </p>
        </div>

        <blockquote className="relative w-full max-w-sm px-8 py-3 text-center text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-2 left-0 select-none font-serif text-6xl font-bold leading-none text-brand/10 dark:text-white/10"
          >
            &ldquo;
          </span>
          買賣互相尊重，我們用心服務好每位顧客，
          <br />
          買賣不成仁義在，交易成功與否在於緣分，
          <br />
          若有任何球鞋相關疑問，都歡迎訊息聊聊。
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-6 right-0 select-none rotate-180 font-serif text-6xl font-bold leading-none text-brand/10 dark:text-white/10"
          >
            &ldquo;
          </span>
        </blockquote>

        <div className="relative w-full overflow-hidden rounded-2xl border border-brand/15 bg-brand/[0.04] px-6 py-6 text-center dark:border-white/10 dark:bg-white/[0.04]">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="pointer-events-none absolute -top-3 -right-3 h-20 w-20 text-brand/[0.06] dark:text-white/[0.06]"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
          </svg>

          <div className="relative flex items-center justify-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/60 dark:bg-white/60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand dark:bg-white/80" />
            </span>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              許願池開放中，有想要但沒有看到的商品嗎？
            </p>
          </div>

          {lineUrl && (
            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2 text-sm font-medium text-brand-foreground hover:opacity-90"
            >
              <svg
                aria-hidden
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
              </svg>
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

      <section className="mt-16 w-full max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
        <div className="mb-5 flex items-center gap-2">
          <svg
            aria-hidden
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-brand dark:text-white/70"
          >
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12" y2="8.01" />
            <line x1="12" y1="11" x2="12" y2="16" />
          </svg>
          <h2 className="font-serif text-lg font-medium text-zinc-900 dark:text-zinc-100">
            注意事項
          </h2>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-brand/25 via-brand/5 to-transparent dark:from-white/25 dark:via-white/5" />
        <ul className="mt-6 space-y-3">
          {NOTICES.map((notice, index) => (
            <li key={notice} className="flex gap-3">
              <span className="mt-0.5 shrink-0 font-serif text-xs font-semibold text-brand/50 dark:text-white/40">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="leading-relaxed">{notice}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
