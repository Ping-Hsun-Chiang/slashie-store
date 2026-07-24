"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Section } from "@/lib/types";

export default function HamburgerMenu({
  sections,
  igUrl,
  lineUrl,
}: {
  sections: Section[];
  igUrl?: string;
  lineUrl?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  // 後台（含登入頁）用自己的導覽列，不需要前台這個漢堡選單
  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "關閉選單" : "開啟選單"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-md text-brand-foreground/80 hover:text-brand-foreground"
      >
        {open ? (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        ) : (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="關閉選單"
            onClick={close}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-brand shadow-lg">
            <nav className="flex flex-col py-2 text-sm">
              {sections.map((section) => (
                <Link
                  key={section.id}
                  href={`/${section.slug}`}
                  onClick={close}
                  className="px-4 py-2.5 text-brand-foreground/80 hover:bg-white/5 hover:text-brand-foreground"
                >
                  {section.name}
                </Link>
              ))}
              {igUrl && (
                <a
                  href={igUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className="px-4 py-2.5 text-brand-foreground/80 hover:bg-white/5 hover:text-brand-foreground"
                >
                  Instagram
                </a>
              )}
              {lineUrl && (
                <a
                  href={lineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className="mx-4 mt-2 rounded-full bg-brand-foreground px-4 py-1.5 text-center text-brand hover:opacity-90"
                >
                  加入 LINE
                </a>
              )}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
