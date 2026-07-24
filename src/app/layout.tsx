import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_TC } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import HamburgerMenu from "@/components/hamburger-menu";
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

const brandSerif = Noto_Serif_TC({
  variable: "--font-brand-serif",
  weight: ["500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: "鞋槓青年",
  description: "鞋槓青年 — 預購代購、現貨球鞋（全新／二手）、配件",
  openGraph: {
    title: "鞋槓青年",
    description: "鞋槓青年 — 預購代購、現貨球鞋（全新／二手）、配件",
    images: ["/logo.jpg"],
    locale: "zh_TW",
    type: "website",
  },
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
      className={`${geistSans.variable} ${geistMono.variable} ${brandSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
        <header className="bg-brand text-brand-foreground">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.jpg"
                alt="鞋槓青年"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="font-serif text-lg font-medium tracking-tight">
                鞋槓青年
              </span>
            </Link>
            <HamburgerMenu sections={sections} igUrl={igUrl} lineUrl={lineUrl} />
          </div>
        </header>

        <main className="flex flex-1 flex-col">{children}</main>

        <footer className="bg-brand py-6 text-center text-sm text-brand-foreground/70">
          © {new Date().getFullYear()} 鞋槓青年
        </footer>
      </body>
    </html>
  );
}
