import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 工作流小调查",
  description: "了解你的工作方式与 AI 学习需求"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
