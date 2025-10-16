/**
 * 🎨 Root Layout (루트 레이아웃)
 *
 * 목적: 애플리케이션 전체의 기본 레이아웃 정의
 * 역할: 모든 페이지에 공통으로 적용되는 HTML 구조 및 스타일 설정
 *
 * 포함 요소:
 * - HTML 기본 구조 (html, body 태그)
 * - 전역 폰트 설정 (Geist Sans, Geist Mono)
 * - 전역 스타일시트 (globals.css)
 * - 공통 네비게이션 바 (Navigation 컴포넌트)
 * - 메타데이터 (title, description)
 *
 * 특징:
 * - 한글 언어 설정 (lang="ko")
 * - 슬레이트 배경색 (bg-slate-50)
 * - 모든 페이지에서 Navigation 바가 상단에 고정 표시
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "코인먹는AI v2.0",
  description: "AI 기반 암호화폐 자동매매 대시보드 - 실시간 모니터링 및 분석",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
      >
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
