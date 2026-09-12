"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function CartBadge() {
  const { totalCount } = useCart();

  return (
    <Link href="/cart" className="relative text-gray-600 hover:text-gray-900">
      ตะกร้า
      {totalCount > 0 && (
        <span className="ml-1 inline-flex items-center justify-center rounded-full bg-blue-600 text-white text-xs w-5 h-5">
          {totalCount}
        </span>
      )}
    </Link>
  );
}
