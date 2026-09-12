import type { BorrowStatus, DisplayStatus } from "./types";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function deriveStatus(request: {
  status: BorrowStatus;
  return_date: string;
}): DisplayStatus {
  if (request.status === "pending") return "pending";
  if (request.status === "returned") return "returned";
  if (request.status === "rejected") return "rejected";
  // status === "approved"
  return new Date(request.return_date) < startOfToday() ? "overdue" : "borrowed";
}
