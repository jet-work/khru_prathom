import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EquipmentForm from "@/components/EquipmentForm";
import type { Equipment } from "@/lib/types";

export default async function EditEquipmentPage({
  params,
}: PageProps<"/admin/equipment/[id]/edit">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("equipment").select("*").eq("id", id).single();

  if (!data) notFound();

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">แก้ไขอุปกรณ์</h1>
      <EquipmentForm equipment={data as Equipment} />
    </div>
  );
}
