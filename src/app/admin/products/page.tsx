import { getAllProductsForAdmin, getAllSectionsForAdmin } from "@/lib/queries";
import ProductsTable from "./products-table";

export default async function AdminProductsPage() {
  const [products, sections] = await Promise.all([
    getAllProductsForAdmin(),
    getAllSectionsForAdmin(),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-semibold">商品管理</h1>

      {products.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">
          尚無商品，先到「庫存管理」登記入庫後才會出現在這裡。
        </p>
      ) : (
        <ProductsTable products={products} sections={sections} />
      )}
    </div>
  );
}
