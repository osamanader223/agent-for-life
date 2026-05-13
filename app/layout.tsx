// [Person 2 - UI]
import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  weight: ["400", "500", "700", "800"],
  subsets: ["arabic"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "محاسبة بالذكاء الاصطناعي للمطاعم",
  description:
    "نظام محاسبة ذكي مصمم خصيصاً للمطاعم والمقاهي في السعودية. وفّر 50 ضعف الوقت مقارنة بالإكسل.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={tajawal.variable}
    >
      <body className="min-h-full bg-cream font-sans text-[#1a1a1a] antialiased">
        {children}
      </body>
    </html>
  );
}
