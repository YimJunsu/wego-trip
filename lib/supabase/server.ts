import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * 서버용 Supabase 클라이언트. 요청마다 새로 만든다 (쿠키가 요청에 묶여 있으므로).
 *
 * @supabase/ssr 공식 패턴: setAll이 Server Component에서 호출되면 Next가 던진다
 * (렌더 중엔 쿠키를 못 쓴다). 그건 middleware가 세션을 갱신하므로 무시해도 된다.
 */
export async function createSupabaseServerClient() {
  const store = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll()
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              store.set(name, value, options)
            }
          } catch {
            // Server Component에서 호출됨. middleware가 갱신을 맡으므로 무시한다.
          }
        },
      },
    },
  )
}
