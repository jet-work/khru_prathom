"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import PhotoUpload from "@/components/PhotoUpload";
import Button from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { deriveStatus } from "@/lib/status";
import type { BorrowRequestWithRelations } from "@/lib/types";

export default function AdminRequestRow({ request }: { request: BorrowRequestWithRelations }) {
  const router = useRouter();
  const [openAction, setOpenAction] = useState<"approve" | "return" | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const status = deriveStatus(request);

  async function sendAction(action: "approve" | "reject" | "return") {
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/borrow-requests/${request.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, photo_url: photoUrl ?? undefined, condition_note: note || undefined }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "ดำเนินการไม่สำเร็จ");
      return;
    }
    setOpenAction(null);
    setPhotoUrl(null);
    setNote("");
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

      {status === "pending" && openAction !== "approve" && (
        <div className="mt-3 flex gap-2">
          <Button onClick={() => setOpenAction("approve")}>อนุมัติ</Button>
          <Button variant="danger" onClick={() => sendAction("reject")} disabled={submitting}>
            ไม่อนุมัติ
          </Button>
        </div>
      )}

      {(status === "borrowed" || status === "overdue") && openAction !== "return" && (
        <div className="mt-3">
          <Button onClick={() => setOpenAction("return")}>บันทึกการคืน</Button>
        </div>
      )}

      {openAction && (
        <div className="mt-3 border-t pt-3 space-y-3">
          <p className="text-sm font-medium">
            {openAction === "approve" ? "ถ่ายรูปตอนส่งมอบอุปกรณ์" : "ถ่ายรูปตอนรับคืนอุปกรณ์"}
          </p>
          <PhotoUpload pathPrefix={`${openAction}/${request.id}`} onUploaded={setPhotoUrl} />
          <Textarea
            placeholder="บันทึกสภาพอุปกรณ์ (ถ้ามี)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={() => sendAction(openAction)} disabled={submitting || !photoUrl}>
              {submitting ? "กำลังบันทึก..." : "ยืนยัน"}
            </Button>
            <Button variant="secondary" onClick={() => setOpenAction(null)} disabled={submitting}>
              ยกเลิก
            </Button>
          </div>
        </div>
      )}

      {(request.checkout_photo_url || request.checkin_photo_url) && (
        <div className="mt-3 flex gap-3">
          {request.checkout_photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={request.checkout_photo_url} alt="ตอนส่งมอบ" className="h-16 w-16 object-cover rounded border" />
          )}
          {request.checkin_photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={request.checkin_photo_url} alt="ตอนรับคืน" className="h-16 w-16 object-cover rounded border" />
          )}
        </div>
      )}
    </div>
  );
}
