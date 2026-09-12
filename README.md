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

โปรเจกต์นี้ไม่มีไฟล์ `.html` นะครับ — เขียนด้วย Next.js ซึ่งแต่ละ "หน้าเว็บ" คือไฟล์ `.tsx` (TypeScript + JSX) หนึ่งไฟล์ ชื่อไฟล์คือ `page.tsx` เสมอ และ **ที่อยู่ของไฟล์ = URL ของหน้านั้น** เช่น `src/app/equipment/page.tsx` คือหน้า `/equipment`

### อยากแก้หน้าไหน ไปที่ไฟล์ไหน

| หน้าเว็บ (URL) | ไฟล์ |
|---|---|
| `/login` | `src/app/login/page.tsx` |
| `/register` | `src/app/register/page.tsx` |
| `/equipment` (รายการอุปกรณ์ + ตัวกรองหมวดหมู่) | `src/app/equipment/page.tsx` |
| `/equipment/[id]` (หน้ารายละเอียด + ฟอร์มขอยืม) | `src/app/equipment/[id]/page.tsx` |
| `/cart` (ตะกร้า) | `src/app/cart/page.tsx` |
| `/my-requests` (รายการยืมของฉัน) | `src/app/my-requests/page.tsx` |
| `/admin` (แดชบอร์ด) | `src/app/admin/page.tsx` |
| `/admin/requests` (อนุมัติ/ปฏิเสธ/บันทึกคืน) | `src/app/admin/requests/page.tsx` |
| `/admin/equipment` (จัดการอุปกรณ์) | `src/app/admin/equipment/page.tsx` |
| `/admin/equipment/new` (เพิ่มอุปกรณ์ใหม่) | `src/app/admin/equipment/new/page.tsx` |
| `/admin/equipment/[id]/edit` (แก้ไข/ใส่รูปอุปกรณ์) | `src/app/admin/equipment/[id]/edit/page.tsx` |
| `/admin/history` (ประวัติทั้งหมด) | `src/app/admin/history/page.tsx` |
| แถบเมนูด้านบนของทุกหน้า | `src/components/Nav.tsx` |

### อยากแก้ชิ้นส่วนย่อย (component) ไปที่ไฟล์ไหน

| ชิ้นส่วน | ไฟล์ |
|---|---|
| การ์ดอุปกรณ์แต่ละใบ (รูป, ชื่อ, จำนวน) | `src/components/EquipmentCard.tsx` |
| ปุ่ม "+ ตะกร้า" บนการ์ด | `src/components/AddToCartButton.tsx` |
| ไอคอนตะกร้า + ตัวเลขบน Nav | `src/components/CartBadge.tsx` |
| ระบบตะกร้า (เก็บ/ลบ/แก้จำนวน) | `src/lib/cart-context.tsx` |
| ฟอร์มขอยืม (หน้ารายละเอียดอุปกรณ์) | `src/components/BorrowRequestForm.tsx` |
| แถวคำขอในหน้าแอดมิน (ปุ่มอนุมัติ/ถ่ายรูป) | `src/components/AdminRequestRow.tsx` |
| ป้ายสถานะ (รออนุมัติ/กำลังยืม/ฯลฯ) | `src/components/StatusBadge.tsx` — ข้อความ/สีอยู่ที่ `src/lib/constants.ts` |
| ตัวอัปโหลดรูป | `src/components/PhotoUpload.tsx` |
| ปุ่ม, กล่องข้อความ ทั่วไป | `src/components/ui/Button.tsx`, `src/components/ui/Input.tsx` |

### โครงสร้างอื่นๆ
- `src/app/api` — โค้ดฝั่งเซิร์ฟเวอร์ (ไม่มี UI) รับคำขอจากหน้าเว็บ เช่น ตอนกดส่งคำขอยืม/อนุมัติ/เพิ่มอุปกรณ์
- `src/lib` — ฟังก์ชันช่วยเหลือ, การเชื่อมต่อ Supabase, กฎการตรวจสอบข้อมูล (validation)
- `src/lib/status.ts` — สูตรคำนวณสถานะ "เกินกำหนด"
- `src/proxy.ts` — ตรวจสอบว่า login แล้วหรือยัง ก่อนเข้าหน้าที่ต้องมีสิทธิ์
- `src/app/globals.css` — สี/ฟอนต์พื้นฐานทั้งเว็บ
- `supabase/migrations` — คำสั่งสร้างตาราง/สิทธิ์การเข้าถึงในฐานข้อมูล
- `supabase/seed` — ข้อมูลอุปกรณ์เริ่มต้น 80 รายการ
- `scripts/seed-admins.ts` — สคริปต์สร้างบัญชีแอดมิน 8 คน (รันครั้งเดียว)

**เคล็ดลับ:** ถ้าอยากรู้ว่าข้อความ/ปุ่มที่เห็นบนหน้าเว็บอยู่ไฟล์ไหน ให้จำคำในหน้านั้นแล้วค้นหาคำนั้นในโปรเจกต์ (VS Code กด Ctrl+Shift+F แล้วพิมพ์คำที่เห็นบนเว็บ) จะเจอไฟล์ที่เกี่ยวข้องทันที

## หมายเหตุการออกแบบ
- สถานะ "เกินกำหนด" ไม่ได้เก็บในฐานข้อมูล แต่คำนวณจาก `return_date` เทียบกับวันปัจจุบันตอนแสดงผล (ดู `src/lib/status.ts`)
- จำนวนอุปกรณ์ที่ว่าง (`available_quantity`) คำนวณจาก view `equipment_with_availability` ไม่ได้เก็บเป็นตัวเลขแยก เพื่อป้องกันข้อมูลไม่ตรงกัน
- แอดมินทุกคนอนุมัติ/ปฏิเสธ/บันทึกการคืนคำขอของนักศึกษาได้ทุกชั้นปี (ชั้นปีของแอดมินเป็นข้อมูลแสดงผลเท่านั้น ไม่ใช่ตัวจำกัดสิทธิ์)
