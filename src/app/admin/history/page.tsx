import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/StatusBadge";
import { deriveStatus } from "@/lib/status";
import { Input, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { BorrowRequestWithRelations } from "@/lib/types";

export default async function AdminHistoryPage({
  searchParams,
}: PageProps<"/admin/history">) {
  const sp = await searchParams;
  const room = typeof sp.room === "string" ? sp.room : "";
  const student = typeof sp.student === "string" ? sp.student : "";
  const status = typeof sp.status === "string" ? sp.status : "";

  const supabase = await createClient();

  const [{ data: rows }, { data: rooms }] = await Promise.all([
    supabase
      .from("borrow_requests")
      .select("*, equipment:equipment_id(*), student:student_id(*)")
      .order("created_at", { ascending: false }),
    supabase.from("equipment").select("room").not("room", "is", null),
  ]);

  let requests = (rows ?? []) as BorrowRequestWithRelations[];

  if (room) requests = requests.filter((r) => r.equipment.room === room);
  if (student) {
    const needle = student.toLowerCase();
    requests = requests.filter(
      (r) =>
        r.student.full_name.toLowerCase().includes(needle) ||
        r.student.student_id.toLowerCase().includes(needle)
    );
  }
  if (status) requests = requests.filter((r) => deriveStatus(r) === status);

  const roomOptions = Array.from(new Set((rooms ?? []).map((r) => r.room).filter(Boolean)));

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">ประวัติการยืม-คืน</h1>
      <form className="flex flex-wrap gap-3 mb-6 items-end">
        <div className="w-40">
          <Select name="room" defaultValue={room}>
            <option value="">ทุกห้อง/สาขา</option>
            {roomOptions.map((r) => (
              <option key={r} value={r as string}>
                {r}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-48">
          <Input name="student" defaultValue={student} placeholder="ค้นหาผู้ยืม/รหัสนักศึกษา" />
        </div>
        <div className="w-40">
          <Select name="status" defaultValue={status}>
            <option value="">ทุกสถานะ</option>
            <option value="pending">รออนุมัติ</option>
            <option value="borrowed">กำลังยืม</option>
            <option value="overdue">เกินกำหนด</option>
            <option value="returned">คืนแล้ว</option>
            <option value="rejected">ถูกปฏิเสธ</option>
          </Select>
        </div>
        <Button type="submit">กรอง</Button>
      </form>

      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="p-3">ผู้ยืม</th>
              <th className="p-3">อุปกรณ์</th>
              <th className="p-3">ห้อง/สาขา</th>
              <th className="p-3">จำนวน</th>
              <th className="p-3">วันยืม-คืน</th>
              <th className="p-3">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">
                  {r.student.full_name}
                  <span className="block text-xs text-gray-500">
                    รหัส {r.student.student_id} · ปี {r.student.year}
                  </span>
                </td>
                <td className="p-3">{r.equipment.name}</td>
                <td className="p-3">{r.equipment.room ?? "-"}</td>
                <td className="p-3">{r.requested_quantity}</td>
                <td className="p-3">
                  {r.borrow_date} ถึง {r.return_date}
                </td>
                <td className="p-3">
                  <StatusBadge status={deriveStatus(r)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && <p className="p-4 text-gray-500">ไม่พบข้อมูล</p>}
      </div>
    </div>
  );
}
