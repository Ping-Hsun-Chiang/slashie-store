import { createClient } from "@/lib/supabase/server";
import {
  Inquiry,
  InventoryVariant,
  PreorderBatch,
  Product,
  ProductOption,
  Section,
} from "@/lib/types";

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function getActiveSections(): Promise<Section[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Section[];
}

export async function getAllSectionsForAdmin(): Promise<Section[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Section[];
}

export async function getSectionBySlug(slug: string): Promise<Section | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data as Section;
}

export async function getProductsBySectionSlug(
  slug: string,
): Promise<Product[]> {
  const section = await getSectionBySlug(slug);
  if (!section) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, variants(*), product_sections!inner(section_id)")
    .eq("is_active", true)
    .eq("product_sections.section_id", section.id)
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function getAllProductsForAdmin(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, variants(*), product_sections(sections(*))")
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function getProductForAdmin(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, variants(*), product_sections(sections(*))")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Product;
}

export async function getAllBatches(): Promise<PreorderBatch[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("preorder_batches")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PreorderBatch[];
}

export async function getAllInquiries(): Promise<Inquiry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Inquiry[];
}

export async function getInventoryVariants(): Promise<InventoryVariant[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("variants")
    .select("*, products!inner(id, name, brand)")
    .in("variant_type", ["new_stock", "used_stock"])
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (error) throw error;
  return (data ?? []) as InventoryVariant[];
}

export async function getProductOptions(): Promise<ProductOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, brand")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ProductOption[];
}
