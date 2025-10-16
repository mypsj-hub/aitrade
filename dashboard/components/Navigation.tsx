'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Navigation() {
  const pathname = usePathname();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // 1분마다 업데이트 시간 갱신
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { href: '/dashboard', label: '대시보드', icon: '📊' },
    { href: '/analysis', label: '분석', icon: '🔬' },
    { href: '/portfolio', label: '포트폴리오', icon: '💼' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 좌측: Logo + 프로젝트명 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">AI</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-slate-900">코인먹는AI</h1>
              <p className="text-xs text-slate-500">v2.0</p>
            </div>
          </div>

          {/* 중앙: 네비게이션 탭 */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative px-4 py-2 rounded-lg
                  text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </span>

                {/* 활성 탭 하단 밑줄 */}
                {isActive(item.href) && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </Link>
            ))}
          </div>

          {/* 우측: 마지막 업데이트 */}
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs text-slate-500">마지막 업데이트</span>
            <span className="text-xs font-medium text-slate-700">
              {lastUpdate.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
