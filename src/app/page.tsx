import Link from "next/link";
import { getActiveSections, isSupabaseConfigured } from "@/lib/queries";
import SupabaseNotConfigured from "@/components/supabase-not-configured";

export default async function Home() {
  if (!isSupabaseConfigured()) return <SupabaseNotConfigured />;

  const sections = await getActiveSections();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-16">
      <h1 className="mb-2 font-serif text-3xl font-medium">鞋槓青年</h1>
      <p className="mb-10 text-zinc-500 dark:text-zinc-400">
        {sections.map((s) => s.name).join("・")}
      </p>

      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.id}
            href={`/${section.slug}`}
            className="group rounded-2xl border border-black/[.08] bg-white p-8 text-center transition-shadow hover:shadow-md dark:border-white/[.145] dark:bg-zinc-950"
          >
            <h2 className="font-serif text-xl font-medium">{section.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
