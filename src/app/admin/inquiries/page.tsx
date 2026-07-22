import { getAllInquiries } from "@/lib/queries";
import InquiryTable from "./inquiry-table";

export default async function InquiriesPage() {
  const inquiries = await getAllInquiries();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-semibold">詢問單</h1>
      <InquiryTable inquiries={inquiries} />
    </div>
  );
}
