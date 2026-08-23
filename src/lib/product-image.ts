import { Product } from "@/lib/types";

function firstVariantImages(product: Product): string[] {
  const withImages = (product.variants ?? [])
    .filter((v) => v.images.length > 0)
    .sort((a, b) => a.sort_order - b.sort_order);
  return withImages[0]?.images ?? [];
}

export function productCoverImage(product: Product): string | null {
  if (product.cover_image_url) return product.cover_image_url;
  return firstVariantImages(product)[0] ?? null;
}

export function productGalleryImages(product: Product): string[] {
  if (product.cover_image_url) return [product.cover_image_url];
  return firstVariantImages(product);
}
