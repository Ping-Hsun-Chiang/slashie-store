import { getAllBatches } from "@/lib/queries";
import BatchManager from "./batch-manager";

export default async function BatchesPage() {
  const batches = await getAllBatches();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-semibold">預購批次</h1>
      <BatchManager initialBatches={batches} />
    </div>
  );
}
