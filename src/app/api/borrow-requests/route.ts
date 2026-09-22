import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { borrowRequestSchema } from "@/lib/validations";

// Students have no account/session at all — this route is the only way
// borrow_requests gets written for them, using the service-role client
// since RLS deliberately grants the anon role nothing on this table
// (see supabase/migrations/0008_public_read_access.sql).
export async function POST(request: Request) {
  const supabase = createAdminClient();

  const body = await request.json().catch(() => null);
  const parsed = borrowRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }
  const {
    borrower_name,
    borrower_student_id,
    equipment_id,
    requested_quantity,
    borrow_date,
    return_date,
    checkout_photo_url,
    checkout_condition_note,
  } = parsed.data;

  const { data: equipment } = await supabase
    .from("equipment_with_availability")
    .select("available_quantity")
    .eq("id", equipment_id)
    .single();

  if (!equipment || equipment.available_quantity < requested_quantity) {
    return NextResponse.json({ error: "จำนวนอุปกรณ์ที่ว่างไม่เพียงพอ" }, { status: 400 });
  }

  const { error } = await supabase.from("borrow_requests").insert({
    borrower_name,
    borrower_student_id,
    equipment_id,
    requested_quantity,
    borrow_date,
    return_date,
    checkout_photo_url,
    checkout_condition_note: checkout_condition_note || null,
  });

  if (error) {
    return NextResponse.json({ error: "ส่งคำขอไม่สำเร็จ" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
