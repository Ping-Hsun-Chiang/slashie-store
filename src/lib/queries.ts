import { createClient } from "@/lib/supabase/server";
import { Product, Section } from "@/lib/types";

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
