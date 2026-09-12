import { z } from "zod";

export const registerSchema = z.object({
  full_name: z.string().min(2, "กรุณากรอกชื่อ-นามสกุล"),
  student_id: z.string().min(1, "กรุณากรอกรหัสนักศึกษา"),
  year: z.coerce.number().int().min(1).max(4),
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});
export type RegisterFormValues = z.input<typeof registerSchema>;
export type RegisterInput = z.output<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const equipmentSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่ออุปกรณ์"),
  total_quantity: z.coerce.number().int().min(0, "จำนวนต้องไม่ติดลบ"),
  category: z.string().optional(),
  room: z.string().optional(),
  photo_url: z.string().optional(),
});
export type EquipmentFormValues = z.input<typeof equipmentSchema>;
export type EquipmentInput = z.output<typeof equipmentSchema>;

export const borrowRequestSchema = z
  .object({
    equipment_id: z.string().uuid(),
    requested_quantity: z.coerce.number().int().min(1, "ต้องยืมอย่างน้อย 1 ชิ้น"),
    borrow_date: z.string().min(1, "กรุณาเลือกวันที่ยืม"),
    return_date: z.string().min(1, "กรุณาเลือกวันที่คืน"),
  })
  .refine((data) => data.return_date >= data.borrow_date, {
    message: "วันที่คืนต้องไม่ก่อนวันที่ยืม",
    path: ["return_date"],
  });
export type BorrowRequestFormValues = z.input<typeof borrowRequestSchema>;
export type BorrowRequestInput = z.output<typeof borrowRequestSchema>;

export const reviewActionSchema = z.object({
  action: z.enum(["approve", "reject", "return"]),
  photo_url: z.string().optional(),
  condition_note: z.string().optional(),
});
export type ReviewActionInput = z.infer<typeof reviewActionSchema>;
