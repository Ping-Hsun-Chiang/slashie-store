import { getInventoryVariants } from "@/lib/queries";
import InventoryManager from "./inventory-manager";

export default async function InventoryPage() {
  const items = await getInventoryVariants();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-semibold">庫存管理</h1>
      <InventoryManager initialItems={items} />
    </div>
  );
}
