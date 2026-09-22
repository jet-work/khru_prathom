import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { lookupSchema } from "@/lib/validations";

// Public lookup for a student's own requests — no session exists, so this
// is a name+ID search rather than an authenticated query. See the plan's
// accepted trade-off: knowing a student's ID is enough to see their own
// loans, but never the whole table (this route uses the service-role
// client precisely because RLS grants anon nothing on borrow_requests).
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = lookupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "กรุณากรอกรหัสนักศึกษา" }, { status: 400 });
  }
  const { student_id, name } = parsed.data;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("borrow_requests")
    .select("*, equipment:equipment_id(*)")
    .ilike("borrower_student_id", student_id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "ค้นหาไม่สำเร็จ กรุณาลองใหม่" }, { status: 500 });
  }

  const requests = data ?? [];
  const nameMismatch =
    !!name &&
    requests.length > 0 &&
    !requests.some((r) => r.borrower_name.trim().toLowerCase() === name.trim().toLowerCase());

  return NextResponse.json({ requests, nameMismatch });
}
