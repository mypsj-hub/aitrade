/**
 * 🏠 Root Page (루트 페이지)
 *
 * 목적: 애플리케이션의 진입점 (/)
 * 역할: 사용자가 루트 경로로 접속 시 자동으로 /dashboard로 리다이렉트
 *
 * 동작:
 * - Next.js redirect() 함수를 사용하여 즉시 /dashboard로 이동
 * - 별도의 UI 렌더링 없음
 *
 * 사용 예시:
 * - 사용자가 https://aitrade-liard.vercel.app/ 접속 시
 * - 자동으로 https://aitrade-liard.vercel.app/dashboard로 이동
 */
import { redirect } from 'next/navigation';

export default function Home() {
  // 루트 경로 접속 시 /dashboard로 리다이렉트
  redirect('/dashboard');
}
