"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ShippingChannel, VariantStatus, VariantType } from "@/lib/types";

export interface ProductInput {
  name: string;
  brand: string | null;
  cover_image_url: string | null;
  description: string | null;
  is_active: boolean;
}

export interface VariantInput {
  id?: string;
  variant_type: VariantType;
  size: string | null;
  condition_note: string | null;
  price: number;
  cost_price: number | null;
  quantity: number;
  status: VariantStatus;
  images: string[];
  sort_order: number;
}

export interface InventoryItemInput {
  variant_type: VariantType;
  size: string | null;
  condition_note: string | null;
  box_note: string | null;
  cost_price: number | null;
  quantity: number;
  images: string[];
}

export interface SectionInput {
  slug: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

function revalidateStorefront() {
  revalidatePath("/");
  revalidatePath("/[slug]", "page");
}

export async function saveProduct(
  productId: string | null,
  product: ProductInput,
  variants: VariantInput[],
  sectionIds: string[],
) {
  const supabase = await createClient();

  let id = productId;

  if (id) {
    const { error } = await supabase
      .from("products")
      .update(product)
      .eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select("id")
      .single();
    if (error) throw error;
    id = data.id as string;
  }

  const { data: existing, error: existingError } = await supabase
    .from("variants")
    .select("id")
    .eq("product_id", id);
  if (existingError) throw existingError;

  const existingIds = new Set((existing ?? []).map((v) => v.id as string));
  const keepIds = new Set(variants.filter((v) => v.id).map((v) => v.id!));
  const toDelete = [...existingIds].filter((eid) => !keepIds.has(eid));

  if (toDelete.length > 0) {
    const { error } = await supabase
      .from("variants")
      .delete()
      .in("id", toDelete);
    if (error) throw error;
  }

  for (const variant of variants) {
    const { id: variantId, ...rest } = variant;
    const payload = { ...rest, product_id: id };

    if (variantId) {
      const { error } = await supabase
        .from("variants")
        .update(payload)
        .eq("id", variantId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("variants").insert(payload);
      if (error) throw error;
    }
  }

  const { error: clearSectionsError } = await supabase
    .from("product_sections")
    .delete()
    .eq("product_id", id);
  if (clearSectionsError) throw clearSectionsError;

  if (sectionIds.length > 0) {
    const { error: sectionsError } = await supabase
      .from("product_sections")
      .insert(sectionIds.map((sectionId) => ({ product_id: id, section_id: sectionId })));
    if (sectionsError) throw sectionsError;
  }

  revalidatePath("/admin/products");
  revalidatePath(`/products/${id}`);
  revalidateStorefront();

  return id;
}

export async function updateProductManagement(
  productId: string,
  sectionIds: string[],
  isActive: boolean,
) {
  const supabase = await createClient();

  const { error: activeError } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId);
  if (activeError) throw activeError;

  const { error: clearSectionsError } = await supabase
    .from("product_sections")
    .delete()
    .eq("product_id", productId);
  if (clearSectionsError) throw clearSectionsError;

  if (sectionIds.length > 0) {
    const { error: sectionsError } = await supabase
      .from("product_sections")
      .insert(sectionIds.map((sectionId) => ({ product_id: productId, section_id: sectionId })));
    if (sectionsError) throw sectionsError;
  }

  revalidatePath("/admin/products");
  revalidateStorefront();
}

export async function saveSection(
  sectionId: string | null,
  section: SectionInput,
) {
  const supabase = await createClient();

  if (sectionId) {
    const { error } = await supabase
      .from("sections")
      .update(section)
      .eq("id", sectionId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("sections").insert(section);
    if (error) throw error;
  }

  revalidatePath("/admin/sections");
  revalidateStorefront();
}

export async function deleteSection(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("sections").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/admin/sections");
  revalidateStorefront();
}

export async function createInventoryItem(
  product: { name: string },
  item: InventoryItemInput,
) {
  const supabase = await createClient();

  const { data: newProduct, error: productError } = await supabase
    .from("products")
    .insert({
      name: product.name,
      brand: null,
      cover_image_url: null,
      description: null,
      is_active: false,
    })
    .select("id")
    .single();
  if (productError) throw productError;

  const { error } = await supabase.from("variants").insert({
    ...item,
    product_id: newProduct.id as string,
    price: 0,
    status: "hidden" satisfies VariantStatus,
  });
  if (error) throw error;

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidateStorefront();
}

export async function updateInventoryItem(
  variantId: string,
  item: InventoryItemInput,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("variants")
    .update(item)
    .eq("id", variantId);
  if (error) throw error;

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidateStorefront();
}

export async function deleteInventoryItem(variantId: string) {
  const supabase = await createClient();

  // 每次入庫都會建立專屬的新商品（1 對 1），所以刪除庫存等同刪除整筆商品，
  // product 的 on delete cascade 會一併清掉這筆 variant，商品管理不會留下空殼商品。
  const { data: variant, error: fetchError } = await supabase
    .from("variants")
    .select("product_id")
    .eq("id", variantId)
    .single();
  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", variant.product_id as string);
  if (error) throw error;

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidateStorefront();
}

export interface SaleInput {
  amount: number;
  buyerName: string;
  shippingCode: string | null;
  shippingChannel: ShippingChannel;
}

function revalidateSales() {
  revalidatePath("/admin/sales");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidateStorefront();
}

export async function createSale(variantIds: string[], sale: SaleInput) {
  if (variantIds.length === 0) throw new Error("請選擇至少一筆庫存品項");

  const supabase = await createClient();

  const { data: newSale, error: saleError } = await supabase
    .from("sales")
    .insert({
      amount: sale.amount,
      buyer_name: sale.buyerName,
      shipping_code: sale.shippingCode,
      shipping_channel: sale.shippingChannel,
    })
    .select("id")
    .single();
  if (saleError) throw saleError;

  const { error: itemsError } = await supabase.from("sale_items").insert(
    variantIds.map((variantId) => ({
      sale_id: newSale.id as string,
      variant_id: variantId,
    })),
  );
  if (itemsError) throw itemsError;

  const { error: statusError } = await supabase
    .from("variants")
    .update({ status: "sold" satisfies VariantStatus })
    .in("id", variantIds);
  if (statusError) throw statusError;

  await setProductsActiveForVariants(supabase, variantIds, false);

  revalidateSales();
}

async function setProductsActiveForVariants(
  supabase: Awaited<ReturnType<typeof createClient>>,
  variantIds: string[],
  isActive: boolean,
) {
  if (variantIds.length === 0) return;

  const { data: variantRows, error: fetchError } = await supabase
    .from("variants")
    .select("product_id")
    .in("id", variantIds);
  if (fetchError) throw fetchError;

  const productIds = [
    ...new Set((variantRows ?? []).map((v) => v.product_id as string)),
  ];
  if (productIds.length === 0) return;

  const { error: productError } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .in("id", productIds);
  if (productError) throw productError;
}

export async function deleteSale(saleId: string) {
  const supabase = await createClient();

  const { data: items, error: itemsError } = await supabase
    .from("sale_items")
    .select("variant_id")
    .eq("sale_id", saleId);
  if (itemsError) throw itemsError;

  const { error: deleteError } = await supabase
    .from("sales")
    .delete()
    .eq("id", saleId);
  if (deleteError) throw deleteError;

  const variantIds = (items ?? []).map((item) => item.variant_id as string);
  if (variantIds.length > 0) {
    const { error: statusError } = await supabase
      .from("variants")
      .update({ status: "hidden" satisfies VariantStatus })
      .in("id", variantIds);
    if (statusError) throw statusError;

    await setProductsActiveForVariants(supabase, variantIds, true);
  }

  revalidateSales();
}
