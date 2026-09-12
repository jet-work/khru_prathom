// One-time script to create the 8 admin accounts (2 per year, years 1-4).
// Run locally with: npx tsx scripts/seed-admins.ts
// Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (never commit this key).
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Edit this list with real admin emails/names before running, or leave the
// generated placeholders and hand out the printed passwords afterward.
const admins: { email: string; full_name: string; student_id: string; year: number }[] = [
  { email: "admin1-y1@example.com", full_name: "แอดมิน 1 ปี 1", student_id: "ADMIN-1-1", year: 1 },
  { email: "admin2-y1@example.com", full_name: "แอดมิน 2 ปี 1", student_id: "ADMIN-1-2", year: 1 },
  { email: "admin1-y2@example.com", full_name: "แอดมิน 1 ปี 2", student_id: "ADMIN-2-1", year: 2 },
  { email: "admin2-y2@example.com", full_name: "แอดมิน 2 ปี 2", student_id: "ADMIN-2-2", year: 2 },
  { email: "admin1-y3@example.com", full_name: "แอดมิน 1 ปี 3", student_id: "ADMIN-3-1", year: 3 },
  { email: "admin2-y3@example.com", full_name: "แอดมิน 2 ปี 3", student_id: "ADMIN-3-2", year: 3 },
  { email: "admin1-y4@example.com", full_name: "แอดมิน 1 ปี 4", student_id: "ADMIN-4-1", year: 4 },
  { email: "admin2-y4@example.com", full_name: "แอดมิน 2 ปี 4", student_id: "ADMIN-4-2", year: 4 },
];

function randomPassword(): string {
  return Math.random().toString(36).slice(-10) + "A1!";
}

async function main() {
  for (const admin of admins) {
    const password = randomPassword();

    const { data, error } = await supabase.auth.admin.createUser({
      email: admin.email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: admin.full_name,
        student_id: admin.student_id,
        year: admin.year,
      },
    });

    if (error) {
      console.error(`Failed to create ${admin.email}:`, error.message);
      continue;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", data.user.id);

    if (profileError) {
      console.error(`Created ${admin.email} but failed to set role=admin:`, profileError.message);
      continue;
    }

    console.log(`Created admin ${admin.email} / password: ${password}`);
  }
}

main();
