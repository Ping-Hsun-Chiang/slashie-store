"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { BatchStatus, VariantStatus, VariantType } from "@/lib/types";

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
  batch_id: string | null;
  images: string[];
  sort_order: number;
}

export interface InventoryItemInput {
  variant_type: VariantType;
  size: string | null;
  cost_price: number | null;
  price: number;
  quantity: number;
  status: VariantStatus;
}

export interface BatchInput {
  batch_name: string;
  order_deadline: string | null;
  expected_arrival: string | null;
  status: BatchStatus;
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

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/admin/products");
  revalidateStorefront();
}

export async function saveBatch(batchId: string | null, batch: BatchInput) {
  const supabase = await createClient();

  if (batchId) {
    const { error } = await supabase
      .from("preorder_batches")
      .update(batch)
      .eq("id", batchId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("preorder_batches").insert(batch);
    if (error) throw error;
  }

  revalidatePath("/admin/batches");
  revalidateStorefront();
}

export async function deleteBatch(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("preorder_batches")
    .delete()
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/admin/batches");
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
  productId: string,
  item: InventoryItemInput,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("variants")
    .insert({ ...item, product_id: productId, batch_id: null, images: [] });
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
  const { error } = await supabase.from("variants").delete().eq("id", variantId);
  if (error) throw error;

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidateStorefront();
}
