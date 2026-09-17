"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/ui/Button";
import { deriveStatus } from "@/lib/status";
import type { BorrowRequestWithRelations } from "@/lib/types";

export default function AdminRequestRow({ request }: { request: BorrowRequestWithRelations }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const status = deriveStatus(request);

  async function sendAction(action: "approve" | "reject" | "confirm-return") {
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/borrow-requests/${request.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "ดำเนินการไม่สำเร็จ");
      return;
    }
    router.refresh();
  }

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">{request.equipment.name}</p>
          <p className="text-sm text-gray-500">
            {request.student.full_name} (รหัส {request.student.student_id}, ปี {request.student.year}) ·
            จำนวน {request.requested_quantity} · {request.borrow_date} ถึง {request.return_date}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {status === "pending" && (
        <div className="mt-3 flex gap-2">
          <Button onClick={() => sendAction("approve")} disabled={submitting}>
            อนุมัติ
          </Button>
          <Button variant="danger" onClick={() => sendAction("reject")} disabled={submitting}>
            ไม่อนุมัติ
          </Button>
        </div>
      )}

      {(status === "borrowed" || status === "overdue") && (
        <p className="mt-3 text-sm text-gray-500">รอนักศึกษาถ่ายรูปและกดคืนของในระบบ</p>
      )}

      {status === "return_pending" && (
        <div className="mt-3">
          <Button onClick={() => sendAction("confirm-return")} disabled={submitting}>
            {submitting ? "กำลังบันทึก..." : "ยืนยันการคืน"}
          </Button>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {(request.checkout_photo_url || request.checkin_photo_url) && (
        <div className="mt-3 flex gap-3">
          {request.checkout_photo_url && (
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={request.checkout_photo_url}
                alt="ตอนส่งมอบ"
                className="h-16 w-16 object-cover rounded border"
              />
              <p className="text-xs text-gray-500 mt-0.5">ตอนยืม</p>
            </div>
          )}
          {request.checkin_photo_url && (
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={request.checkin_photo_url}
                alt="ตอนรับคืน"
                className="h-16 w-16 object-cover rounded border"
              />
              <p className="text-xs text-gray-500 mt-0.5">ตอนคืน</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
