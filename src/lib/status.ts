import type { BorrowStatus, DisplayStatus } from "./types";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function deriveStatus(request: {
  status: BorrowStatus;
  return_date: string;
  checkin_photo_url?: string | null;
}): DisplayStatus {
  if (request.status === "pending") return "pending";
  if (request.status === "returned") return "returned";
  if (request.status === "rejected") return "rejected";
  // status === "approved"
  if (request.checkin_photo_url) return "return_pending";
  return new Date(request.return_date) < startOfToday() ? "overdue" : "borrowed";
}
