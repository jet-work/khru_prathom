import { createClient } from "@/lib/supabase/server";
import EquipmentCard from "@/components/EquipmentCard";
import type { EquipmentWithAvailability } from "@/lib/types";

export default async function EquipmentListPage({
  searchParams,
}: PageProps<"/equipment">) {
  const { q } = await searchParams;
  const search = typeof q === "string" ? q : "";

  const supabase = await createClient();
  let query = supabase
    .from("equipment_with_availability")
    .select("*")
    .order("name");

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data: equipment } = await query;
  const items = (equipment ?? []) as EquipmentWithAvailability[];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">รายการอุปกรณ์</h1>
      </div>
      <form className="mb-6">
        <input
          type="text"
          name="q"
          defaultValue={search}
          placeholder="ค้นหาอุปกรณ์..."
          className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
      </form>
      {items.length === 0 ? (
        <p className="text-gray-500">ไม่พบอุปกรณ์</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <EquipmentCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
