import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { equipmentSchema } from "@/lib/validations";

export async function PATCH(request: Request, ctx: RouteContext<"/api/equipment/[id]">) {
  const { id } = await ctx.params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = equipmentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase
    .from("equipment")
    .update({
      name: parsed.data.name,
      total_quantity: parsed.data.total_quantity,
      category: parsed.data.category || null,
      room: parsed.data.room || null,
      photo_url: parsed.data.photo_url || null,
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: "แก้ไขอุปกรณ์ไม่สำเร็จ" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/equipment/[id]">) {
  const { id } = await ctx.params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });

  const supabase = await createClient();
  const { error } = await supabase.from("equipment").delete().eq("id", id);

  if (error) return NextResponse.json({ error: "ลบอุปกรณ์ไม่สำเร็จ (อาจมีประวัติการยืมอยู่)" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
