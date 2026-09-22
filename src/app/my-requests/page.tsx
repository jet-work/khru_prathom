"use client";

import { useState } from "react";
import MyRequestRow from "@/components/MyRequestRow";
import { Field, Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { BorrowRequest, Equipment } from "@/lib/types";

type Row = BorrowRequest & { equipment: Equipment };

export default function MyRequestsPage() {
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [requests, setRequests] = useState<Row[]>([]);
  const [nameMismatch, setNameMismatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(id: string) {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/my-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: id, name: name || undefined }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "ค้นหาไม่สำเร็จ");
      return;
    }
    const body = await res.json();
    setRequests(body.requests ?? []);
    setNameMismatch(!!body.nameMismatch);
    setSubmittedId(id);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId.trim()) return;
    search(studentId.trim());
  }

  if (submittedId) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">รายการยืมของฉัน</h1>
          <Button variant="secondary" onClick={() => setSubmittedId(null)}>
            ค้นหาใหม่
          </Button>
        </div>
        {nameMismatch && (
          <p className="text-sm text-amber-600 mb-4">
            ชื่อที่กรอกไม่ตรงกับรายการที่เจอ ลองเช็ครหัสนักศึกษาอีกครั้ง (ยังแสดงผลลัพธ์ตามรหัสที่ค้นหาให้อยู่)
          </p>
        )}
        {requests.length === 0 ? (
          <p className="text-gray-500">ไม่พบรายการยืมของรหัสนักศึกษานี้</p>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <MyRequestRow
                key={r.id}
                request={r}
                studentId={submittedId}
                onUpdated={() => search(submittedId)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h1 className="text-xl font-semibold mb-6 text-center">รายการยืมของฉัน</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="รหัสนักศึกษา">
          <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
        </Field>
        <Field label="ชื่อ-นามสกุล (ไม่บังคับ ช่วยเช็คว่าพิมพ์รหัสถูก)">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "กำลังค้นหา..." : "ค้นหา"}
        </Button>
      </form>
    </div>
  );
}
