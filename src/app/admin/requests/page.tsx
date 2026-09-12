import { createClient } from "@/lib/supabase/server";
import AdminRequestRow from "@/components/AdminRequestRow";
import type { BorrowRequestWithRelations } from "@/lib/types";

export default async function AdminRequestsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("borrow_requests")
    .select("*, equipment:equipment_id(*), student:student_id(*)")
    .in("status", ["pending", "approved"])
    .order("created_at", { ascending: false });

  const requests = (data ?? []) as BorrowRequestWithRelations[];
  const pending = requests.filter((r) => r.status === "pending");
  const active = requests.filter((r) => r.status === "approved");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold mb-4">คำขอรออนุมัติ ({pending.length})</h1>
        {pending.length === 0 ? (
          <p className="text-gray-500">ไม่มีคำขอรออนุมัติ</p>
        ) : (
          <div className="space-y-3">
            {pending.map((r) => (
              <AdminRequestRow key={r.id} request={r} />
            ))}
          </div>
        )}
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">กำลังยืมอยู่ ({active.length})</h2>
        {active.length === 0 ? (
          <p className="text-gray-500">ไม่มีรายการที่กำลังยืม</p>
        ) : (
          <div className="space-y-3">
            {active.map((r) => (
              <AdminRequestRow key={r.id} request={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
