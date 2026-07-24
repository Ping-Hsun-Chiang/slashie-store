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
      <h1 className="mb-8 font-serif text-2xl font-medium">{section.name}</h1>
      <ProductGrid products={products} />
    </div>
  );
}
