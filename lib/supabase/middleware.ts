import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Supabase Auth 세션 토큰을 요청마다 갱신한다. App Router에서 SSR 세션이
 * 만료되지 않게 하려면 middleware가 필요하다 (@supabase/ssr 공식 패턴).
 *
 * 환경변수가 없으면(=mock 단계) 아무것도 하지 않고 통과시킨다.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const enabled = process.env.NEXT_PUBLIC_DATA_SOURCE === 'supabase' && url && key
  if (!enabled) return NextResponse.next({ request })

  let response = NextResponse.next({ request })

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  // getUser()가 토큰을 검증하고, 필요하면 위 setAll을 통해 갱신 쿠키를 심는다.
  await supabase.auth.getUser()

  return response
}
