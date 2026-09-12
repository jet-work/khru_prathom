import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import { CartProvider } from "@/lib/cart-context";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: "ระบบยืม-คืนอุปกรณ์ ครูประถม มช.",
  description: "ระบบยืม-คืนอุปกรณ์สำหรับนักศึกษาครูประถม มหาวิทยาลัยเชียงใหม่",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${notoSansThai.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <CartProvider>
          <Nav />
          <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
