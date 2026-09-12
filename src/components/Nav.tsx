import Link from "next/link";
import { getProfile } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";
import CartBadge from "@/components/CartBadge";

export default async function Nav() {
  const profile = await getProfile();

  return (
    <header className="bg-white border-b">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/equipment" className="font-semibold text-gray-900">
          ยืม-คืนอุปกรณ์
        </Link>
        {profile && (
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/equipment" className="text-gray-600 hover:text-gray-900">
              อุปกรณ์
            </Link>
            {profile.role === "student" && (
              <>
                <CartBadge />
                <Link href="/my-requests" className="text-gray-600 hover:text-gray-900">
                  รายการของฉัน
                </Link>
              </>
            )}
            {profile.role === "admin" && (
              <>
                <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                  แดชบอร์ด
                </Link>
                <Link href="/admin/requests" className="text-gray-600 hover:text-gray-900">
                  คำขอยืม
                </Link>
                <Link href="/admin/equipment" className="text-gray-600 hover:text-gray-900">
                  จัดการอุปกรณ์
                </Link>
                <Link href="/admin/history" className="text-gray-600 hover:text-gray-900">
                  ประวัติ
                </Link>
              </>
            )}
            <span className="text-gray-400">|</span>
            <span className="text-gray-500">{profile.full_name}</span>
            <SignOutButton />
          </nav>
        )}
      </div>
    </header>
  );
}
