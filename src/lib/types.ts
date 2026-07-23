export type VariantType = "new_stock" | "used_stock" | "preorder";
export type VariantStatus = "available" | "sold" | "hidden";
export type BatchStatus = "open" | "closed" | "arrived" | "completed";
export type OrderType = "preorder" | "stock";

export type InquiryStatus =
  | "new"
  | "paid"
  | "ordered"
  | "in_transit"
  | "arrived_tw"
  | "confirmed"
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
  cost_price: number | null;
  quantity: number;
  status: VariantStatus;
  batch_id: string | null;
  images: string[];
  sort_order: number;
  preorder_batches?: PreorderBatch | null;
}

export interface InventoryVariant extends Variant {
  products: { id: string; name: string; brand: string | null };
}

export interface ProductOption {
  id: string;
  name: string;
  brand: string | null;
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

export const VARIANT_TYPE_LABEL: Record<VariantType, string> = {
  new_stock: "現貨新品",
  used_stock: "現貨二手",
  preorder: "預購代購",
};

export interface Inquiry {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_label: string | null;
  price: number;
  order_type: OrderType;
  status: InquiryStatus;
  tracking_number: string | null;
  note: string | null;
  created_at: string;
}

export const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = {
  new: "新詢問",
  paid: "已付款",
  ordered: "已向店家下單",
  in_transit: "抵達集運倉",
  arrived_tw: "抵達台灣",
  confirmed: "確定下單",
  shipped: "已出貨",
  completed: "已完成",
  cancelled: "已取消",
};

// 每種訂單類型可用的狀態流程（依序）；「已取消」任何狀態都能選，不放進流程裡。
export const ORDER_TYPE_STAGES: Record<OrderType, InquiryStatus[]> = {
  preorder: [
    "new",
    "paid",
    "ordered",
    "in_transit",
    "arrived_tw",
    "shipped",
    "completed",
  ],
  stock: ["new", "confirmed", "shipped", "completed"],
};

export const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  preorder: "預購",
  stock: "現貨",
};
