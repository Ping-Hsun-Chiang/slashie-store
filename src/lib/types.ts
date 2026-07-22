export type VariantType = "new_stock" | "used_stock" | "preorder";
export type VariantStatus = "available" | "sold" | "hidden";
export type Section = "preorder" | "in_stock" | "accessory";
export type BatchStatus = "open" | "closed" | "arrived" | "completed";
export type InquiryStatus =
  | "new"
  | "confirmed"
  | "deposit_paid"
  | "shipped"
  | "completed"
  | "cancelled";

export interface PreorderBatch {
  id: string;
  batch_name: string;
  order_deadline: string | null;
  expected_arrival: string | null;
  status: BatchStatus;
}

export interface Variant {
  id: string;
  product_id: string;
  variant_type: VariantType;
  size: string | null;
  condition_note: string | null;
  price: number;
  quantity: number;
  status: VariantStatus;
  batch_id: string | null;
  images: string[];
  sort_order: number;
  preorder_batches?: PreorderBatch | null;
}

export interface Product {
  id: string;
  name: string;
  brand: string | null;
  section: Section;
  cover_image_url: string | null;
  description: string | null;
  is_active: boolean;
  variants?: Variant[];
}

export const VARIANT_TYPE_LABEL: Record<VariantType, string> = {
  new_stock: "現貨新品",
  used_stock: "現貨二手",
  preorder: "預購代購",
};

export const SECTION_LABEL: Record<Section, string> = {
  preorder: "預購代購",
  in_stock: "現貨",
  accessory: "配件",
};

export const SECTION_PATH: Record<Section, string> = {
  preorder: "/preorder",
  in_stock: "/stock",
  accessory: "/accessories",
};

export interface Inquiry {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_label: string | null;
  price: number;
  status: InquiryStatus;
  note: string | null;
  created_at: string;
}

export const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = {
  new: "新詢問",
  confirmed: "已確認",
  deposit_paid: "已付訂金",
  shipped: "已出貨",
  completed: "已完成",
  cancelled: "已取消",
};
