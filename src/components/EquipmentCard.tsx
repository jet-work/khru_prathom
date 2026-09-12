import Link from "next/link";
import type { EquipmentWithAvailability } from "@/lib/types";

export default function EquipmentCard({ item }: { item: EquipmentWithAvailability }) {
  return (
    <Link
      href={`/equipment/${item.id}`}
      className="block bg-white rounded-lg border hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        {item.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400 text-sm">ไม่มีรูป</span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
        <p className="text-sm text-gray-500 mt-1">ทั้งหมด {item.total_quantity}</p>
        <p className="text-sm mt-0.5">
          <span className={item.available_quantity > 0 ? "text-green-600" : "text-red-600"}>
            ว่าง {item.available_quantity}
          </span>
          <span className="text-gray-400"> / ยืมอยู่ {item.currently_borrowed}</span>
        </p>
      </div>
    </Link>
  );
}
