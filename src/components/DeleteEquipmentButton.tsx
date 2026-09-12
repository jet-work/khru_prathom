"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteEquipmentButton({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("ยืนยันการลบอุปกรณ์นี้?")) return;
    const res = await fetch(`/api/equipment/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "ลบไม่สำเร็จ");
      return;
    }
    router.refresh();
  }

  return (
    <>
      <button onClick={handleDelete} className="text-red-600 hover:underline">
        ลบ
      </button>
      {error && <span className="block text-xs text-red-600">{error}</span>}
    </>
  );
}
