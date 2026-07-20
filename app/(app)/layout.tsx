import { Suspense } from 'react'
import Link from 'next/link'
import { MockStateBar } from '@/components/dashboard/MockStateBar'

const NAV = [
  { href: '/', label: '홈' },
  { href: '/random', label: '뽑기' },
  { href: '/join', label: '참여' },
  { href: '/compat', label: '궁합' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-line bg-paper/80 sticky top-0 z-30 border-b backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3">
          <Link
            href="/"
            className="font-display text-lg font-semibold tracking-tight"
          >
            위고트립
          </Link>
          <nav>
            <ul className="flex gap-1">
              {NAV.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-muted hover:text-ink block rounded-full px-3 py-1.5 text-sm font-medium transition duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* 하단 mock 상태바에 가리지 않도록 여백을 준다. */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-8 pb-24">
        {children}
      </main>

      <Suspense fallback={null}>
        <MockStateBar />
      </Suspense>
    </>
  )
}
