import Link from "next/link";
import { Product, VARIANT_TYPE_LABEL, VariantType } from "@/lib/types";

function priceRangeLabel(product: Product) {
  const prices = (product.variants ?? [])
    .filter((v) => v.status === "available")
    .map((v) => v.price);
  if (prices.length === 0) return "暫無現貨";
  const min = Math.min(...prices);
  return `NT$ ${min.toLocaleString()} 起`;
}

function availableTypes(product: Product): VariantType[] {
  const types = new Set(
    (product.variants ?? [])
      .filter((v) => v.status === "available")
      .map((v) => v.variant_type),
  );
  return Array.from(types);
}

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-black/10 bg-black/[0.02] px-6 py-10 text-center text-sm text-zinc-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-zinc-400">
        目前尚無上架商品。
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className="group overflow-hidden rounded-2xl border border-black/[.08] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/[.145] dark:bg-zinc-950"
        >
          <div className="aspect-square w-full bg-zinc-100 dark:bg-zinc-900">
            {product.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.cover_image_url}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
                尚無圖片
              </div>
            )}
          </div>
          <div className="p-4">
            {product.brand && (
              <p className="text-xs font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
                {product.brand}
              </p>
            )}
            <h2 className="mt-1 line-clamp-2 font-medium">{product.name}</h2>
            <p className="mt-2 text-sm font-semibold text-brand dark:text-zinc-100">
              {priceRangeLabel(product)}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {availableTypes(product).map((type) => (
                <span
                  key={type}
                  className="rounded-full bg-brand/[0.06] px-2.5 py-0.5 text-xs text-zinc-600 dark:bg-white/[0.08] dark:text-zinc-300"
                >
                  {VARIANT_TYPE_LABEL[type]}
                </span>
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
