"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("帳號或密碼錯誤");
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-24">
      <h1 className="mb-6 text-xl font-semibold">後台登入</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="rounded-lg border border-black/[.12] px-3 py-2 text-sm dark:border-white/[.2] dark:bg-zinc-900"
        />
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密碼"
          className="rounded-lg border border-black/[.12] px-3 py-2 text-sm dark:border-white/[.2] dark:bg-zinc-900"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="h-11 rounded-full bg-brand text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "登入中…" : "登入"}
        </button>
      </form>
    </div>
  );
}
