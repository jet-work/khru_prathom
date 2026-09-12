# ระบบยืม-คืนอุปกรณ์ ครูประถม มช.

เว็บแอประบบยืม-คืนอุปกรณ์สำหรับนักศึกษาครูประถม มหาวิทยาลัยเชียงใหม่ สร้างด้วย Next.js (App Router) + TypeScript + Tailwind CSS + Supabase (Postgres, Auth, Storage)

## เริ่มต้นใช้งาน (Setup)

### 1. สร้างโปรเจกต์ Supabase
1. ไปที่ https://supabase.com สร้างโปรเจกต์ใหม่ (ฟรี)
2. ไปที่ Project Settings → API เพื่อคัดลอกค่า `Project URL`, `anon public key`, และ `service_role key`
3. คัดลอกไฟล์ `.env.example` เป็น `.env.local` แล้วใส่ค่าทั้งสาม:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

### 2. รันไฟล์ migration
เปิด Supabase SQL Editor แล้วรันไฟล์เหล่านี้ตามลำดับ (หรือใช้ Supabase CLI: `supabase db push`):
1. `supabase/migrations/0001_init.sql` — ตารางหลักและ trigger
2. `supabase/migrations/0002_rls_policies.sql` — Row Level Security
3. `supabase/migrations/0003_storage.sql` — Storage bucket สำหรับรูปภาพ
4. `supabase/seed/equipment_seed.sql` — ข้อมูลอุปกรณ์เริ่มต้น (~80 รายการ)

### 3. สร้างบัญชีแอดมิน (8 บัญชี)
แก้ไขรายชื่อ/อีเมลแอดมินใน `scripts/seed-admins.ts` ให้ตรงกับของจริง แล้วรัน:
```bash
npx tsx scripts/seed-admins.ts
```
สคริปต์จะสร้างบัญชีและพิมพ์รหัสผ่านที่สุ่มไว้ในเทอร์มินัล — เก็บไว้แล้วส่งให้แอดมินแต่ละคน

### 4. ติดตั้งและรันโปรเจกต์
```bash
npm install
npm run dev
```
เปิด http://localhost:3000

### 5. Deploy ขึ้น Vercel
1. Push โค้ดขึ้น GitHub
2. เชื่อมต่อ repo กับ Vercel แล้วตั้งค่า Environment Variables (3 ตัวด้านบน) ในหน้า Project Settings
3. Deploy — ฐานข้อมูลและ Storage ใช้ Supabase project เดียวกับตอน dev ได้เลย ไม่ต้องตั้งอะไรเพิ่ม

## โครงสร้างโปรเจกต์
- `src/app/(pages)` — หน้าเว็บทั้งหมด (login, register, equipment, my-requests, admin/*)
- `src/app/api` — API routes (borrow-requests, equipment)
- `src/components` — React components ที่ใช้ร่วมกัน
- `src/lib` — helper functions, Supabase client, validation schemas
- `src/proxy.ts` — ตรวจสอบ session และป้องกันหน้าที่ต้อง login (เทียบเท่า middleware เดิมใน Next.js รุ่นก่อน)
- `supabase/migrations` — SQL schema และ RLS policies
- `supabase/seed` — ข้อมูลอุปกรณ์เริ่มต้น
- `scripts/seed-admins.ts` — สคริปต์สร้างบัญชีแอดมิน 8 คน (รันครั้งเดียว)

## หมายเหตุการออกแบบ
- สถานะ "เกินกำหนด" ไม่ได้เก็บในฐานข้อมูล แต่คำนวณจาก `return_date` เทียบกับวันปัจจุบันตอนแสดงผล (ดู `src/lib/status.ts`)
- จำนวนอุปกรณ์ที่ว่าง (`available_quantity`) คำนวณจาก view `equipment_with_availability` ไม่ได้เก็บเป็นตัวเลขแยก เพื่อป้องกันข้อมูลไม่ตรงกัน
- แอดมินทุกคนอนุมัติ/ปฏิเสธ/บันทึกการคืนคำขอของนักศึกษาได้ทุกชั้นปี (ชั้นปีของแอดมินเป็นข้อมูลแสดงผลเท่านั้น ไม่ใช่ตัวจำกัดสิทธิ์)
