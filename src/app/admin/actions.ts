"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  BatchStatus,
  Section,
  VariantStatus,
  VariantType,
} from "@/lib/types";

export interface ProductInput {
  name: string;
  brand: string | null;
  section: Section;
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
  quantity: number;
  status: VariantStatus;
  batch_id: string | null;
  images: string[];
  sort_order: number;
}

export interface BatchInput {
  batch_name: string;
  order_deadline: string | null;
  expected_arrival: string | null;
  status: BatchStatus;
}

function revalidateStorefront() {
  revalidatePath("/stock");
  revalidatePath("/preorder");
  revalidatePath("/accessories");
}

export async function saveProduct(
  productId: string | null,
  product: ProductInput,
  variants: VariantInput[],
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
  revalidatePath("/preorder");
}

export async function deleteBatch(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("preorder_batches")
    .delete()
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/admin/batches");
  revalidatePath("/preorder");
}
