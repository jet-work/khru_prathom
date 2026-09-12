import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BorrowRequestForm from "@/components/BorrowRequestForm";
import type { EquipmentWithAvailability } from "@/lib/types";

export default async function EquipmentDetailPage({ params }: PageProps<"/equipment/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("equipment_with_availability")
    .select("*")
    .eq("id", id)
    .single();

  if (!item) notFound();

  const equipment = item as EquipmentWithAvailability;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
          {equipment.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={equipment.photo_url} alt={equipment.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400">ไม่มีรูป</span>
          )}
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{equipment.name}</h1>
        {equipment.room && <p className="text-sm text-gray-500 mt-1">ห้อง: {equipment.room}</p>}
        {equipment.category && (
          <p className="text-sm text-gray-500">หมวดหมู่: {equipment.category}</p>
        )}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-50 rounded-md p-3">
            <p className="text-lg font-semibold">{equipment.total_quantity}</p>
            <p className="text-xs text-gray-500">ทั้งหมด</p>
          </div>
          <div className="bg-gray-50 rounded-md p-3">
            <p className="text-lg font-semibold text-green-600">{equipment.available_quantity}</p>
            <p className="text-xs text-gray-500">ว่าง</p>
          </div>
          <div className="bg-gray-50 rounded-md p-3">
            <p className="text-lg font-semibold text-blue-600">{equipment.currently_borrowed}</p>
            <p className="text-xs text-gray-500">ถูกยืม</p>
          </div>
        </div>
        <div className="mt-6">
          <h2 className="font-medium mb-3">ขอยืมอุปกรณ์</h2>
          <BorrowRequestForm
            equipmentId={equipment.id}
            availableQuantity={equipment.available_quantity}
          />
        </div>
      </div>
    </div>
  );
}
