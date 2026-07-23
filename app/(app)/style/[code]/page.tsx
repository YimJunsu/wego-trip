import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr'
import { actionButtonClass } from '@/components/dashboard/ActionButton'
import { ShareButton } from '@/components/dashboard/ShareButton'
import { StyleMatchGrid } from '@/components/dashboard/StyleMatchGrid'
import {
  StyleAxisGrid,
  StyleNotes,
  StyleResultHero,
} from '@/components/dashboard/StyleResultCard'
import { travelStyleRepo } from '@/lib/data'
import { nearestCodes } from '@/lib/style/score'
import type { PageProps } from '@/lib/types/page'

type Params = { code: string }

const MATCH_COUNT = 3

export async function generateMetadata({
  params,
}: PageProps<Params>): Promise<Metadata> {
  const { code } = await params
  const style = await travelStyleRepo.get(code)
  if (!style) return { title: '없는 결과 · 위고트립' }

  const title = `나는 ${style.name} 여행이다 (${style.code})`
  const description = `${style.tagline} · 위고트립 여행 성향 분석`
  const image = `/images/style/${style.code}.webp`

  // 공유 링크를 카카오톡·메시지에 붙였을 때 카드가 뜨도록 og·twitter를 함께 채운다.
  return {
    title: `${title} · 위고트립`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [{ url: image, width: 768, height: 768, alt: style.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function StyleResultPage({ params }: PageProps<Params>) {
  const { code } = await params
  const style = await travelStyleRepo.get(code)
  if (!style) notFound()

  const all = await travelStyleRepo.list()
  const matchCodes = nearestCodes(
    style.code,
    style.matchCode,
    all.map((s) => s.code),
    MATCH_COUNT,
  )
  const matches = matchCodes
    .map((c) => all.find((s) => s.code === c))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))

  return (
    <div className="flex flex-col gap-8">
      <StyleResultHero style={style} />

      <div className="flex flex-col gap-3">
        <ShareButton
          title={`나는 ${style.name} 여행이다`}
          text={`${style.tagline} · 내 여행 성향은 ${style.code}. 너도 해 봐.`}
        />
        <Link
          href="/style"
          className={actionButtonClass({ tone: 'quiet', className: 'w-full' })}
        >
          <ArrowClockwiseIcon size={16} weight="bold" aria-hidden />
          다시 해보기
        </Link>
      </div>

      <StyleAxisGrid style={style} />
      <StyleNotes style={style} />
      <StyleMatchGrid styles={matches} />
    </div>
  )
}
