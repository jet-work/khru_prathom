"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";

export default function AddToCartButton({
  equipmentId,
  availableQuantity,
}: {
  equipmentId: string;
  availableQuantity: number;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (availableQuantity <= 0) {
    return <p className="text-xs text-red-600">ไม่ว่าง</p>;
  }

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(equipmentId, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
      <input
        type="number"
        min={1}
        max={availableQuantity}
        value={quantity}
        onChange={(e) => setQuantity(Math.max(1, Math.min(availableQuantity, Number(e.target.value) || 1)))}
        onClick={(e) => e.stopPropagation()}
        className="w-12 rounded border border-gray-300 px-1 py-0.5 text-xs"
      />
      <button
        onClick={handleAdd}
        className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        {added ? "เพิ่มแล้ว ✓" : "+ ตะกร้า"}
      </button>
    </div>
  );
}
