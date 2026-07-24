import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Supabase Auth 세션 갱신만 한다. mock 단계에서는 updateSession이 그냥 통과시킨다.
 * (Next.js 16에서 middleware 파일 규약이 proxy로 바뀌었다.)
 */
export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  // 정적 자산·이미지 최적화 경로는 제외한다.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
