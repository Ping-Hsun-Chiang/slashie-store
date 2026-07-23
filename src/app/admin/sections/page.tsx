import { getAllSectionsForAdmin } from "@/lib/queries";
import SectionManager from "./section-manager";

export default async function SectionsPage() {
  const sections = await getAllSectionsForAdmin();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-semibold">分類管理</h1>
      <SectionManager initialSections={sections} />
    </div>
  );
}
