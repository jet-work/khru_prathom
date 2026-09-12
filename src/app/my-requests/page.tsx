import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { deriveStatus } from "@/lib/status";
import type { BorrowRequest, Equipment } from "@/lib/types";

export default async function MyRequestsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase
    .from("borrow_requests")
    .select("*, equipment:equipment_id(*)")
    .eq("student_id", profile.id)
    .order("created_at", { ascending: false });

  const requests = (data ?? []) as (BorrowRequest & { equipment: Equipment })[];

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">รายการยืมของฉัน</h1>
      {requests.length === 0 ? (
        <p className="text-gray-500">ยังไม่มีรายการยืม</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="bg-white border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{r.equipment.name}</p>
                <p className="text-sm text-gray-500">
                  จำนวน {r.requested_quantity} · {r.borrow_date} ถึง {r.return_date}
                </p>
              </div>
              <StatusBadge status={deriveStatus(r)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
