export type UserRole = "admin" | "student";

export type BorrowStatus = "pending" | "approved" | "returned" | "rejected";

export type DisplayStatus = "pending" | "borrowed" | "overdue" | "returned" | "rejected";

export interface Profile {
  id: string;
  full_name: string;
  student_id: string;
  year: number;
  role: UserRole;
  created_at: string;
}

export interface Equipment {
  id: string;
  name: string;
  total_quantity: number;
  photo_url: string | null;
  category: string | null;
  room: string | null;
  created_at: string;
  updated_at: string;
}

export interface EquipmentWithAvailability extends Equipment {
  currently_borrowed: number;
  available_quantity: number;
}

export interface BorrowRequest {
  id: string;
  student_id: string;
  equipment_id: string;
  requested_quantity: number;
  borrow_date: string;
  return_date: string;
  status: BorrowStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  actual_return_date: string | null;
  checkout_photo_url: string | null;
  checkout_condition_note: string | null;
  checkin_photo_url: string | null;
  checkin_condition_note: string | null;
  created_at: string;
}

export interface BorrowRequestWithRelations extends BorrowRequest {
  equipment: Equipment;
  student: Profile;
}
