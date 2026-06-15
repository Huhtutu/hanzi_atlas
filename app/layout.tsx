import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "汉字图志 Hanzi Atlas",
  description: "搜索任意常用汉字,查看从甲骨文到楷书的字形演化。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hans">
      <body className="min-h-screen flex flex-col bg-paper text-ink">
        <Header />
        <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
