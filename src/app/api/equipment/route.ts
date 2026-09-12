import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { equipmentSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = equipmentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("equipment")
    .insert({
      name: parsed.data.name,
      total_quantity: parsed.data.total_quantity,
      category: parsed.data.category || null,
      room: parsed.data.room || null,
      photo_url: parsed.data.photo_url || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "เพิ่มอุปกรณ์ไม่สำเร็จ" }, { status: 500 });
  return NextResponse.json({ ok: true, equipment: data }, { status: 201 });
}
