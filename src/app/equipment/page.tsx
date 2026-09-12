import Link from "next/link";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/server";
import EquipmentCard from "@/components/EquipmentCard";
import type { EquipmentWithAvailability } from "@/lib/types";

export default async function EquipmentListPage({
  searchParams,
}: PageProps<"/equipment">) {
  const sp = await searchParams;
  const search = typeof sp.q === "string" ? sp.q : "";
  const category = typeof sp.category === "string" ? sp.category : "";

  const supabase = await createClient();

  const [{ data: categoryRows }, equipmentQuery] = await Promise.all([
    supabase.from("equipment").select("category").not("category", "is", null),
    (() => {
      let query = supabase.from("equipment_with_availability").select("*").order("name");
      if (search) query = query.ilike("name", `%${search}%`);
      if (category) query = query.eq("category", category);
      return query;
    })(),
  ]);

  const categories = Array.from(
    new Set((categoryRows ?? []).map((r) => r.category as string))
  ).sort();

  const { data: equipment } = equipmentQuery;
  const items = (equipment ?? []) as EquipmentWithAvailability[];

  function tabHref(cat: string) {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (cat) params.set("category", cat);
    const qs = params.toString();
    return qs ? `/equipment?${qs}` : "/equipment";
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">รายการอุปกรณ์</h1>
      </div>
      <form className="mb-4">
        {category && <input type="hidden" name="category" value={category} />}
        <input
          type="text"
          name="q"
          defaultValue={search}
          placeholder="ค้นหาอุปกรณ์..."
          className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
      </form>
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href={tabHref("")}
          className={clsx(
            "px-3 py-1 rounded-full text-sm border",
            !category ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"
          )}
        >
          ทั้งหมด
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat}
            href={tabHref(cat)}
            className={clsx(
              "px-3 py-1 rounded-full text-sm border",
              category === cat
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300"
            )}
          >
            {cat}
          </Link>
        ))}
      </div>
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
