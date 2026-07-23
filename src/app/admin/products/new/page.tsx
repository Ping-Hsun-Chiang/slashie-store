import { getAllBatches, getAllSectionsForAdmin } from "@/lib/queries";
import ProductForm from "../product-form";

export default async function NewProductPage() {
  const [batches, sections] = await Promise.all([
    getAllBatches(),
    getAllSectionsForAdmin(),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-semibold">新增商品</h1>
      <ProductForm
        productId={null}
        initialProduct={{
          name: "",
          brand: null,
          cover_image_url: null,
          description: null,
          is_active: true,
        }}
        initialVariants={[]}
        initialSectionIds={[]}
        batches={batches}
        sections={sections}
      />
    </div>
  );
}
