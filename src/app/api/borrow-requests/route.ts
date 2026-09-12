import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { borrowRequestSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = borrowRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }
  const { equipment_id, requested_quantity, borrow_date, return_date } = parsed.data;

  const { data: equipment } = await supabase
    .from("equipment_with_availability")
    .select("available_quantity")
    .eq("id", equipment_id)
    .single();

  if (!equipment || equipment.available_quantity < requested_quantity) {
    return NextResponse.json({ error: "จำนวนอุปกรณ์ที่ว่างไม่เพียงพอ" }, { status: 400 });
  }

  const { error } = await supabase.from("borrow_requests").insert({
    student_id: user.id,
    equipment_id,
    requested_quantity,
    borrow_date,
    return_date,
  });

  if (error) {
    return NextResponse.json({ error: "ส่งคำขอไม่สำเร็จ" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
