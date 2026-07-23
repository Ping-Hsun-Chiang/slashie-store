import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { getActiveSections, isSupabaseConfigured } from "@/lib/queries";
import { Section } from "@/lib/types";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "鞋槓青年",
  description: "鞋槓青年 — 預購代購、現貨球鞋（全新／二手）、配件",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const igUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
  const lineUrl = process.env.NEXT_PUBLIC_LINE_URL;

  let sections: Section[] = [];
  if (isSupabaseConfigured()) {
    try {
      sections = await getActiveSections();
    } catch {
      sections = [];
    }
  }

  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
        <header className="border-b border-black/[.08] dark:border-white/[.145]">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              鞋槓青年
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              {sections.map((section) => (
                <Link
                  key={section.id}
                  href={`/${section.slug}`}
                  className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  {section.name}
                </Link>
              ))}
              {igUrl && (
                <a
                  href={igUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Instagram
                </a>
              )}
              {lineUrl && (
                <a
                  href={lineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-foreground px-4 py-1.5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
                >
                  加入 LINE
                </a>
              )}
            </nav>
          </div>
        </header>

        <main className="flex flex-1 flex-col">{children}</main>

        <footer className="border-t border-black/[.08] py-6 text-center text-sm text-zinc-500 dark:border-white/[.145] dark:text-zinc-400">
          © {new Date().getFullYear()} 鞋槓青年
        </footer>
      </body>
    </html>
  );
}
