import { getAllSales, getInventoryVariants } from "@/lib/queries";
import SalesManager from "./sales-manager";

export default async function SalesPage() {
  const [sales, inventoryItems] = await Promise.all([
    getAllSales(),
    getInventoryVariants(),
  ]);

  const availableItems = inventoryItems.filter((item) => item.status !== "sold");

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-semibold">銷售管理</h1>
      <SalesManager initialSales={sales} availableItems={availableItems} />
    </div>
  );
}
