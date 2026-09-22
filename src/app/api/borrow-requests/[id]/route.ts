import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/auth";
import { reviewActionSchema } from "@/lib/validations";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/borrow-requests/[id]">
) {
  const { id } = await ctx.params;

  const body = await request.json().catch(() => null);
  const parsed = reviewActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }
  const { action, photo_url, condition_note, borrower_student_id } = parsed.data;

  // Student-initiated: no session exists at all, so identity is proven by
  // re-supplying the student ID that must match the row (see the plan's
  // "accepted trade-off" note — this is a targeted-access check, not a
  // strong security boundary, matching how a paper sign-out sheet works).
  if (action === "request-return") {
    if (!borrower_student_id) {
      return NextResponse.json({ error: "กรุณากรอกรหัสนักศึกษา" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const { data: existing } = await adminSupabase
      .from("borrow_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "ไม่พบคำขอ" }, { status: 404 });
    }
    if (
      existing.borrower_student_id.trim().toLowerCase() !==
      borrower_student_id.trim().toLowerCase()
    ) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
    }
    if (existing.status !== "approved") {
      return NextResponse.json({ error: "คำขอนี้ยังไม่อยู่ในสถานะกำลังยืม" }, { status: 409 });
    }
    if (existing.checkin_photo_url) {
      return NextResponse.json({ error: "ส่งเรื่องคืนไปแล้ว รอแอดมินยืนยัน" }, { status: 409 });
    }
    if (!photo_url) {
      return NextResponse.json({ error: "กรุณาถ่ายรูปอุปกรณ์ตอนคืน" }, { status: 400 });
    }

    const { error } = await adminSupabase
      .from("borrow_requests")
      .update({
        checkin_photo_url: photo_url,
        checkin_condition_note: condition_note || null,
      })
      .eq("id", id);

    if (error) return NextResponse.json({ error: "บันทึกการคืนไม่สำเร็จ" }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // Everything else is admin-only, using the session client so the
  // is_admin() RLS policy stays a real database-level backstop behind
  // this role check.
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("borrow_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "ไม่พบคำขอ" }, { status: 404 });
  }

  if (action === "approve") {
    if (existing.status !== "pending") {
      return NextResponse.json({ error: "คำขอนี้ถูกดำเนินการแล้ว" }, { status: 409 });
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
        reviewed_by: profile.id,
        reviewed_at: new Date().toISOString(),
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
      .update({ status: "rejected", reviewed_by: profile.id, reviewed_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return NextResponse.json({ error: "ปฏิเสธไม่สำเร็จ" }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "confirm-return") {
    if (existing.status !== "approved") {
      return NextResponse.json({ error: "คำขอนี้ยังไม่อยู่ในสถานะกำลังยืม" }, { status: 409 });
    }
    if (!existing.checkin_photo_url) {
      return NextResponse.json({ error: "นักศึกษายังไม่ได้ถ่ายรูปตอนคืน" }, { status: 409 });
    }

    const { error } = await supabase
      .from("borrow_requests")
      .update({
        status: "returned",
        actual_return_date: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return NextResponse.json({ error: "บันทึกการคืนไม่สำเร็จ" }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "การกระทำไม่ถูกต้อง" }, { status: 400 });
}
