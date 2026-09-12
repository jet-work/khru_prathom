import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { count: pendingCount } = await supabase
    .from("borrow_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { data: approved } = await supabase
    .from("borrow_requests")
    .select("return_date")
    .eq("status", "approved");

  const todayStr = new Date().toISOString().slice(0, 10);
  const overdueCount = (approved ?? []).filter((r) => r.return_date < todayStr).length;

  const { count: equipmentCount } = await supabase
    .from("equipment")
    .select("*", { count: "exact", head: true });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">แดชบอร์ดแอดมิน</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Link href="/admin/requests" className="bg-white border rounded-lg p-4 hover:shadow-md">
          <p className="text-2xl font-semibold text-amber-600">{pendingCount ?? 0}</p>
          <p className="text-sm text-gray-500">คำขอรออนุมัติ</p>
        </Link>
        <Link href="/admin/requests" className="bg-white border rounded-lg p-4 hover:shadow-md">
          <p className="text-2xl font-semibold text-red-600">{overdueCount}</p>
          <p className="text-sm text-gray-500">รายการเกินกำหนด</p>
        </Link>
        <Link href="/admin/equipment" className="bg-white border rounded-lg p-4 hover:shadow-md">
          <p className="text-2xl font-semibold text-gray-900">{equipmentCount ?? 0}</p>
          <p className="text-sm text-gray-500">รายการอุปกรณ์ทั้งหมด</p>
        </Link>
      </div>
    </div>
  );
}
