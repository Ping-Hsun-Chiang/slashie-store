import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Product, SECTION_LABEL, SECTION_PATH } from "@/lib/types";
import VariantPicker from "./variant-picker";

async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, variants(*, preorder_batches(*))")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data as Product;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <Link
        href={SECTION_PATH[product.section]}
        className="mb-2 inline-block text-sm text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        ← {SECTION_LABEL[product.section]}
      </Link>
      {product.brand && (
        <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
          {product.brand}
        </p>
      )}
      <VariantPicker
        productId={product.id}
        productName={product.name}
        variants={product.variants ?? []}
        lineUrl={process.env.NEXT_PUBLIC_LINE_URL}
      />
      {product.description && (
        <div className="mt-10 border-t border-black/[.08] pt-6 text-sm text-zinc-600 dark:border-white/[.145] dark:text-zinc-400">
          {product.description}
        </div>
      )}
    </div>
  );
}
