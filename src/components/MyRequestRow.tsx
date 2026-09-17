"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import PhotoUpload from "@/components/PhotoUpload";
import Button from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { deriveStatus } from "@/lib/status";
import type { BorrowRequest, Equipment } from "@/lib/types";

export default function MyRequestRow({
  request,
}: {
  request: BorrowRequest & { equipment: Equipment };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const status = deriveStatus(request);

  async function submitReturn() {
    if (!photoUrl) return;
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/borrow-requests/${request.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "request-return",
        photo_url: photoUrl,
        condition_note: note || undefined,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "บันทึกไม่สำเร็จ");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">{request.equipment.name}</p>
          <p className="text-sm text-gray-500">
            จำนวน {request.requested_quantity} · {request.borrow_date} ถึง {request.return_date}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {(status === "borrowed" || status === "overdue") && !open && (
        <div className="mt-3">
          <Button onClick={() => setOpen(true)}>คืนของ</Button>
        </div>
      )}

      {open && (
        <div className="mt-3 border-t pt-3 space-y-3">
          <p className="text-sm font-medium">ถ่ายรูปอุปกรณ์ตอนคืน</p>
          <PhotoUpload pathPrefix={`checkin/${request.id}`} onUploaded={setPhotoUrl} />
          <Textarea
            placeholder="บันทึกสภาพอุปกรณ์ (ถ้ามี)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={submitReturn} disabled={submitting || !photoUrl}>
              {submitting ? "กำลังบันทึก..." : "ยืนยันคืนของ"}
            </Button>
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={submitting}>
              ยกเลิก
            </Button>
          </div>
        </div>
      )}

      {status === "return_pending" && (
        <p className="mt-3 text-sm text-gray-500">ส่งรูปคืนของแล้ว รอแอดมินยืนยัน</p>
      )}
    </div>
  );
}
