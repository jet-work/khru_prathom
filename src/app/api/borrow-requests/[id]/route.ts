import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { reviewActionSchema } from "@/lib/validations";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/borrow-requests/[id]">
) {
  const { id } = await ctx.params;
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = reviewActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }
  const { action, photo_url, condition_note } = parsed.data;

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("borrow_requests")
    .select("*, equipment:equipment_id(id, total_quantity)")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "ไม่พบคำขอ" }, { status: 404 });
  }

  if (action === "approve") {
    if (existing.status !== "pending") {
      return NextResponse.json({ error: "คำขอนี้ถูกดำเนินการแล้ว" }, { status: 409 });
    }
    if (!photo_url) {
      return NextResponse.json({ error: "กรุณาถ่ายรูปหลักฐานตอนส่งมอบ" }, { status: 400 });
    }

    const { data: avail } = await supabase
      .from("equipment_with_availability")
      .select("available_quantity")
      .eq("id", existing.equipment_id)
      .single();

    if (!avail || avail.available_quantity < existing.requested_quantity) {
      return NextResponse.json({ error: "จำนวนอุปกรณ์ที่ว่างไม่เพียงพอแล้ว" }, { status: 409 });
    }

    const { error } = await supabase
      .from("borrow_requests")
      .update({
        status: "approved",
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
        checkout_photo_url: photo_url,
        checkout_condition_note: condition_note ?? null,
      })
      .eq("id", id);

    if (error) return NextResponse.json({ error: "อนุมัติไม่สำเร็จ" }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "reject") {
    if (existing.status !== "pending") {
      return NextResponse.json({ error: "คำขอนี้ถูกดำเนินการแล้ว" }, { status: 409 });
    }
    const { error } = await supabase
      .from("borrow_requests")
      .update({ status: "rejected", reviewed_by: admin.id, reviewed_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return NextResponse.json({ error: "ปฏิเสธไม่สำเร็จ" }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "return") {
    if (existing.status !== "approved") {
      return NextResponse.json({ error: "คำขอนี้ยังไม่อยู่ในสถานะกำลังยืม" }, { status: 409 });
    }
    if (!photo_url) {
      return NextResponse.json({ error: "กรุณาถ่ายรูปหลักฐานตอนรับคืน" }, { status: 400 });
    }

    const { error } = await supabase
      .from("borrow_requests")
      .update({
        status: "returned",
        actual_return_date: new Date().toISOString(),
        checkin_photo_url: photo_url,
        checkin_condition_note: condition_note ?? null,
      })
      .eq("id", id);

    if (error) return NextResponse.json({ error: "บันทึกการคืนไม่สำเร็จ" }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "การกระทำไม่ถูกต้อง" }, { status: 400 });
}
