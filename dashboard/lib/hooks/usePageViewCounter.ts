/**
 * 페이지 방문자 카운터 훅
 *
 * 목적: 대시보드 방문 시 카운트를 증가시키고 총 방문 횟수를 표시
 * 기능:
 * - 페이지 로드 시 자동으로 방문 카운트 증가
 * - 현재 총 방문 횟수 조회
 * - 중복 카운트 방지 (세션 기반)
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function usePageViewCounter() {
  const [viewCount, setViewCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function trackPageView() {
      try {
        // 세션 스토리지로 중복 카운트 방지 (같은 세션에서는 1회만 카운트)
        const sessionKey = 'dashboard_visited';
        const hasVisited = sessionStorage.getItem(sessionKey);

        if (!hasVisited) {
          // 방문 카운트 증가
          const { data, error } = await supabase.rpc('increment_page_view');

          if (error) {
            console.error('[usePageViewCounter] increment error:', error);
          } else {
            setViewCount(data || 0);
            sessionStorage.setItem(sessionKey, 'true');
          }
        } else {
          // 이미 방문한 세션이면 조회만
          const { data, error } = await supabase.rpc('get_page_view_count');

          if (error) {
            console.error('[usePageViewCounter] get count error:', error);
          } else {
            setViewCount(data || 0);
          }
        }
      } catch (err) {
        console.error('[usePageViewCounter] unexpected error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    trackPageView();
  }, []);

  return { viewCount, isLoading };
}
