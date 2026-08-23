"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "後台", exact: true },
  { href: "/admin/sections", label: "分類管理" },
  { href: "/admin/inventory", label: "庫存管理" },
  { href: "/admin/products", label: "商品管理" },
  { href: "/admin/sales", label: "銷售管理" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 text-sm">
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg border px-2.5 py-1.5 transition-colors ${
              isActive
                ? "border-black/[.15] font-medium text-zinc-950 dark:border-white/[.25] dark:text-zinc-50"
                : "border-transparent text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
