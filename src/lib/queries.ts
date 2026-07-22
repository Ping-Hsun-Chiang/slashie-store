import { createClient } from "@/lib/supabase/server";
import { Inquiry, PreorderBatch, Product, Section } from "@/lib/types";

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function getProductsBySection(
  section: Section,
): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, variants(*)")
    .eq("is_active", true)
    .eq("section", section)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function getAllProductsForAdmin(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, variants(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function getProductForAdmin(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, variants(*)")
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
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PreorderBatch[];
}

export async function getAllInquiries(): Promise<Inquiry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Inquiry[];
}
