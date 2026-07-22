import Link from "next/link";

const CATEGORIES = [
  {
    href: "/preorder",
    title: "預購代購",
    description: "海外代購、預購批次，需等待到貨時間",
  },
  {
    href: "/stock",
    title: "現貨",
    description: "全新與二手現貨球鞋，付款後即可出貨",
  },
  {
    href: "/accessories",
    title: "配件",
    description: "鞋盒收納、清潔保養等周邊商品",
  },
] as const;

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-16">
      <h1 className="mb-2 text-3xl font-semibold">鞋槓青年</h1>
      <p className="mb-10 text-zinc-500 dark:text-zinc-400">
        預購代購・現貨球鞋・配件
      </p>

      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
        {CATEGORIES.map((category) => (
          <Link
            key={category.href}
            href={category.href}
            className="group rounded-2xl border border-black/[.08] bg-white p-8 text-center transition-shadow hover:shadow-md dark:border-white/[.145] dark:bg-zinc-950"
          >
            <h2 className="text-xl font-semibold">{category.title}</h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {category.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
