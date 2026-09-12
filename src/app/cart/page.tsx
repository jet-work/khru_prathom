"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import type { EquipmentWithAvailability } from "@/lib/types";

interface CartRow {
  equipmentId: string;
  quantity: number;
  equipment: EquipmentWithAvailability | null;
}

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clear } = useCart();
  const [rows, setRows] = useState<CartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [borrowDate, setBorrowDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<{ name: string; ok: boolean; error?: string }[] | null>(
    null
  );

  useEffect(() => {
    async function load() {
      if (items.length === 0) {
        setRows([]);
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase
        .from("equipment_with_availability")
        .select("*")
        .in(
          "id",
          items.map((i) => i.equipmentId)
        );
      const byId = new Map((data ?? []).map((e) => [e.id, e as EquipmentWithAvailability]));
      setRows(items.map((i) => ({ ...i, equipment: byId.get(i.equipmentId) ?? null })));
      setLoading(false);
    }
    load();
  }, [items]);

  async function handleCheckout() {
    if (!borrowDate || !returnDate) return;
    setSubmitting(true);
    setResults(null);

    const outcomes: { name: string; ok: boolean; error?: string }[] = [];
    for (const row of rows) {
      if (!row.equipment) continue;
      const res = await fetch("/api/borrow-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipment_id: row.equipmentId,
          requested_quantity: row.quantity,
          borrow_date: borrowDate,
          return_date: returnDate,
        }),
      });
      if (res.ok) {
        outcomes.push({ name: row.equipment.name, ok: true });
        removeItem(row.equipmentId);
      } else {
        const body = await res.json().catch(() => ({}));
        outcomes.push({ name: row.equipment.name, ok: false, error: body.error });
      }
    }
    setResults(outcomes);
    setSubmitting(false);
  }

  if (loading) return <p className="text-gray-500">กำลังโหลด...</p>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">ตะกร้ายืมอุปกรณ์</h1>

      {results && (
        <div className="mb-6 space-y-1">
          {results.map((r) => (
            <p key={r.name} className={r.ok ? "text-green-600 text-sm" : "text-red-600 text-sm"}>
              {r.name}: {r.ok ? "ส่งคำขอสำเร็จ" : `ล้มเหลว (${r.error ?? "ไม่ทราบสาเหตุ"})`}
            </p>
          ))}
        </div>
      )}

      {rows.length === 0 ? (
        <p className="text-gray-500">
          ตะกร้าว่างเปล่า — ไปที่{" "}
          <Link href="/equipment" className="text-blue-600 hover:underline">
            รายการอุปกรณ์
          </Link>{" "}
          เพื่อเลือกของที่จะยืม
        </p>
      ) : (
        <div className="space-y-6 max-w-lg">
          <div className="space-y-3">
            {rows.map((row) => (
              <div
                key={row.equipmentId}
                className="bg-white border rounded-lg p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {row.equipment?.name ?? "ไม่พบอุปกรณ์นี้แล้ว"}
                  </p>
                  {row.equipment && (
                    <p className="text-xs text-gray-500">ว่าง {row.equipment.available_quantity}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min={1}
                    max={row.equipment?.available_quantity ?? 999}
                    value={row.quantity}
                    onChange={(e) => updateQuantity(row.equipmentId, Number(e.target.value) || 1)}
                    className="w-16 rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => removeItem(row.equipmentId)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border rounded-lg p-4 space-y-4">
            <p className="font-medium text-sm">กำหนดวันยืม-คืน (ใช้ร่วมกันทุกชิ้น)</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="วันที่ยืม">
                <Input type="date" value={borrowDate} onChange={(e) => setBorrowDate(e.target.value)} />
              </Field>
              <Field label="วันที่คืน">
                <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
              </Field>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCheckout}
                disabled={submitting || !borrowDate || !returnDate}
                className="flex-1"
              >
                {submitting ? "กำลังส่งคำขอ..." : `ส่งคำขอยืมทั้งหมด (${rows.length} ชิ้น)`}
              </Button>
              <Button variant="secondary" onClick={clear} disabled={submitting}>
                ล้างตะกร้า
              </Button>
            </div>
          </div>
        </div>
      )}

      {results && results.some((r) => r.ok) && (
        <div className="mt-4">
          <Button variant="secondary" onClick={() => router.push("/my-requests")}>
            ไปดูรายการยืมของฉัน
          </Button>
        </div>
      )}
    </div>
  );
}
