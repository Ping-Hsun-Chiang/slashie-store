import { getProductsBySection, isSupabaseConfigured } from "@/lib/queries";
import ProductGrid from "@/components/product-grid";
import SupabaseNotConfigured from "@/components/supabase-not-configured";

export default async function PreorderPage() {
  if (!isSupabaseConfigured()) return <SupabaseNotConfigured />;

  const products = await getProductsBySection("preorder");

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-semibold">預購代購</h1>
      <ProductGrid products={products} />
    </div>
  );
}
