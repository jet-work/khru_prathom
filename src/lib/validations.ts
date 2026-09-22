import { z } from "zod";

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
    borrower_name: z.string().trim().min(1, "กรุณากรอกชื่อ-นามสกุล"),
    borrower_student_id: z.string().trim().min(1, "กรุณากรอกรหัสนักศึกษา"),
    equipment_id: z.string().uuid(),
    requested_quantity: z.coerce.number().int().min(1, "ต้องยืมอย่างน้อย 1 ชิ้น"),
    borrow_date: z.string().min(1, "กรุณาเลือกวันที่ยืม"),
    return_date: z.string().min(1, "กรุณาเลือกวันที่คืน"),
    checkout_photo_url: z.string().optional(),
    checkout_condition_note: z.string().optional(),
  })
  .refine((data) => data.return_date >= data.borrow_date, {
    message: "วันที่คืนต้องไม่ก่อนวันที่ยืม",
    path: ["return_date"],
  });
export type BorrowRequestFormValues = z.input<typeof borrowRequestSchema>;
export type BorrowRequestInput = z.output<typeof borrowRequestSchema>;

// Admin actions (no photo needed — evidence already came from the student):
//   "approve" | "reject" transition a pending request; "confirm-return"
//   finalizes a request the student already marked as returned.
// Student action: "request-return" attaches the checkin photo/note to their
// own approved request without changing its status (see 0005 migration).
export const reviewActionSchema = z.object({
  action: z.enum(["approve", "reject", "confirm-return", "request-return"]),
  photo_url: z.string().optional(),
  condition_note: z.string().optional(),
  // Required only for "request-return" (no session to authenticate the
  // caller, so the student re-supplies the ID that must match the row).
  borrower_student_id: z.string().optional(),
});
export type ReviewActionInput = z.infer<typeof reviewActionSchema>;

export const lookupSchema = z.object({
  student_id: z.string().trim().min(1, "กรุณากรอกรหัสนักศึกษา"),
  name: z.string().trim().optional(),
});
export type LookupInput = z.infer<typeof lookupSchema>;
