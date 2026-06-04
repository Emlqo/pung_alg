import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pung Algorithm",
  description: "알고리즘 순서도 빈칸 채우기 학습 사이트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
