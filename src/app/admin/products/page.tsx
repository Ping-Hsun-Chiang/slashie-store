import Link from "next/link";
import { getAllProductsForAdmin } from "@/lib/queries";
import DeleteProductButton from "./delete-product-button";

export default async function AdminProductsPage() {
  const products = await getAllProductsForAdmin();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">商品管理</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          + 新增商品
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">尚無商品，點右上角新增。</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-black/[.08] dark:border-white/[.145]">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">型號</th>
                <th className="px-4 py-3 font-medium">分類</th>
                <th className="px-4 py-3 font-medium">規格數</th>
                <th className="px-4 py-3 font-medium">狀態</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-t border-black/[.08] dark:border-white/[.145]"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{product.name}</p>
                    {product.brand && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {product.brand}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {(product.product_sections ?? [])
                      .map((ps) => ps.sections.name)
                      .join("、") || "—"}
                  </td>
                  <td className="px-4 py-3">{product.variants?.length ?? 0}</td>
                  <td className="px-4 py-3">
                    {product.is_active ? (
                      <span className="text-green-600">上架中</span>
                    ) : (
                      <span className="text-zinc-400">已下架</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-sm hover:underline"
                      >
                        編輯
                      </Link>
                      <DeleteProductButton
                        productId={product.id}
                        productName={product.name}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
