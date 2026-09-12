import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { registerSchema } from "@/lib/validations";

// Creates the auth user with email_confirm already set, so students can log
// in immediately without needing a working inbox. Supabase's free-tier
// mailer is rate-limited and not meant for ~200 signups, so we skip email
// verification entirely rather than depend on it (see registerSchema for
// what's still validated: real-looking email format, password length, etc).
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }
  const { full_name, student_id, year, email, password } = parsed.data;

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, student_id, year },
  });

  if (error) {
    const message = error.message.includes("already been registered")
      ? "อีเมลนี้ถูกใช้งานแล้ว"
      : "สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
