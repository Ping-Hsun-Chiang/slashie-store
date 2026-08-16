import { notFound } from "next/navigation";
import {
  getProductsBySectionSlug,
  getSectionBySlug,
  isSupabaseConfigured,
} from "@/lib/queries";
import ProductGrid from "@/components/product-grid";
import SupabaseNotConfigured from "@/components/supabase-not-configured";

export default async function SectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!isSupabaseConfigured()) return <SupabaseNotConfigured />;

  const section = await getSectionBySlug(slug);
  if (!section) notFound();

  const products = await getProductsBySectionSlug(slug);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="relative mb-14">
        <span
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 -z-10 select-none font-serif text-7xl font-bold leading-none text-brand/[0.05] dark:text-white/[0.05]"
        >
          {section.name}
        </span>
        <div className="flex flex-col gap-2 py-2">
          <h1 className="font-serif text-2xl font-medium">{section.name}</h1>
          <div className="h-px w-10 bg-brand dark:bg-white/40" />
        </div>
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
