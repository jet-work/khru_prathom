import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Button from "@/components/ui/Button";
import DeleteEquipmentButton from "@/components/DeleteEquipmentButton";
import type { EquipmentWithAvailability } from "@/lib/types";

export default async function AdminEquipmentPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("equipment_with_availability")
    .select("*")
    .order("name");

  const items = (data ?? []) as EquipmentWithAvailability[];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">จัดการอุปกรณ์</h1>
        <Link href="/admin/equipment/new">
          <Button>+ เพิ่มอุปกรณ์</Button>
        </Link>
      </div>
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="p-3">ชื่อ</th>
              <th className="p-3">ทั้งหมด</th>
              <th className="p-3">ว่าง</th>
              <th className="p-3">ถูกยืม</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3 font-medium text-gray-900">{item.name}</td>
                <td className="p-3">{item.total_quantity}</td>
                <td className="p-3 text-green-600">{item.available_quantity}</td>
                <td className="p-3 text-blue-600">{item.currently_borrowed}</td>
                <td className="p-3 text-right space-x-2">
                  <Link href={`/admin/equipment/${item.id}/edit`} className="text-blue-600 hover:underline">
                    แก้ไข
                  </Link>
                  <DeleteEquipmentButton id={item.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
