export const YEARS = [1, 2, 3, 4] as const;

export const STORAGE_BUCKET = "loan-photos";

export const STATUS_LABELS: Record<string, string> = {
  pending: "รออนุมัติ",
  borrowed: "กำลังยืม",
  overdue: "เกินกำหนด",
  returned: "คืนแล้ว",
  rejected: "ถูกปฏิเสธ",
};

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  borrowed: "bg-blue-100 text-blue-800",
  overdue: "bg-red-100 text-red-800",
  returned: "bg-green-100 text-green-800",
  rejected: "bg-gray-200 text-gray-700",
};
