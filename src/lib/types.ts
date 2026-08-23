export type VariantType = "new_stock" | "used_stock" | "preorder";
export type VariantStatus = "available" | "sold" | "hidden";

export interface Variant {
  id: string;
  product_id: string;
  variant_type: VariantType;
  size: string | null;
  condition_note: string | null;
  box_note: string | null;
  price: number;
  cost_price: number | null;
  quantity: number;
  status: VariantStatus;
  images: string[];
  sort_order: number;
}

export interface InventoryVariant extends Variant {
  products: { id: string; name: string; brand: string | null };
}

export interface Section {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string | null;
  cover_image_url: string | null;
  description: string | null;
  is_active: boolean;
  variants?: Variant[];
  product_sections?: { sections: Section }[];
}

export const SHIPPING_CHANNELS = [
  "面交",
  "Shopee",
  "7-11 店到店",
  "7-11 賣貨便",
  "郵局宅配",
] as const;
export type ShippingChannel = (typeof SHIPPING_CHANNELS)[number];

export interface SaleItem {
  id: string;
  sale_id: string;
  variant_id: string;
  variants: InventoryVariant;
}

export interface Sale {
  id: string;
  amount: number;
  buyer_name: string;
  shipping_code: string | null;
  shipping_channel: ShippingChannel;
  created_at: string;
  sale_items: SaleItem[];
}

export const VARIANT_TYPE_LABEL: Record<VariantType, string> = {
  new_stock: "現貨新品",
  used_stock: "現貨二手",
  preorder: "預購代購",
};
