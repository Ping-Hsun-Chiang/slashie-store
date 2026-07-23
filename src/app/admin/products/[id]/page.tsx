import { notFound } from "next/navigation";
import {
  getAllBatches,
  getAllSectionsForAdmin,
  getProductForAdmin,
} from "@/lib/queries";
import ProductForm from "../product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, batches, sections] = await Promise.all([
    getProductForAdmin(id),
    getAllBatches(),
    getAllSectionsForAdmin(),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-semibold">編輯商品</h1>
      <ProductForm
        productId={product.id}
        initialProduct={{
          name: product.name,
          brand: product.brand,
          cover_image_url: product.cover_image_url,
          description: product.description,
          is_active: product.is_active,
        }}
        initialVariants={(product.variants ?? [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((v) => ({
            id: v.id,
            variant_type: v.variant_type,
            size: v.size,
            condition_note: v.condition_note,
            price: v.price,
            cost_price: v.cost_price,
            quantity: v.quantity,
            status: v.status,
            batch_id: v.batch_id,
            images: v.images,
            sort_order: v.sort_order,
          }))}
        initialSectionIds={(product.product_sections ?? []).map(
          (ps) => ps.sections.id,
        )}
        batches={batches}
        sections={sections}
      />
    </div>
  );
}
