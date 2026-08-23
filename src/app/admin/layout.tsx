import { createClient } from "@/lib/supabase/server";
import AdminNav from "./admin-nav";
import LogoutButton from "./logout-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="flex flex-1 flex-col">{children}</div>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-black/[.08] bg-white dark:border-white/[.145] dark:bg-zinc-950">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <AdminNav />
          <LogoutButton />
        </div>
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
