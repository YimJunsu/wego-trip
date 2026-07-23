import Image from 'next/image'
import Link from 'next/link'
import type { TravelStyle } from '@/lib/data/types'

/** 잘 맞는 유형 3종. 이미지가 먼저 눈에 들어오고 이름이 뒤를 받친다. */
export function StyleMatchGrid({ styles }: { styles: TravelStyle[] }) {
  if (styles.length === 0) return null

  return (
    <section>
      <h2 className="font-display mb-3 text-lg font-semibold tracking-tight">
        잘 맞는 유형
      </h2>
      {/* 이름 길이가 제각각이라 카드 높이를 맞춰 둔다. 안 그러면 아래쪽이 들쭉날쭉해진다. */}
      <ul className="grid grid-cols-3 items-stretch gap-3">
        {styles.map((style, i) => (
          <li
            key={style.code}
            style={{ animationDelay: `${i * 70}ms` }}
            className="animate-rise flex"
          >
            <Link
              href={`/style/${style.code}`}
              className="rounded-inner border-line bg-surface hover:shadow-soft flex w-full flex-col overflow-hidden border transition duration-300 ease-out hover:-translate-y-[3px]"
            >
              <span className="bg-paper relative block aspect-square">
                <Image
                  src={`/images/style/${style.code}.webp`}
                  alt={`${style.name} 여행 유형을 표현한 쿼카 일러스트`}
                  fill
                  sizes="(max-width: 640px) 30vw, 200px"
                  className="object-cover"
                />
              </span>
              <span className="flex flex-1 flex-col justify-center p-2.5 text-center">
                <span className="block text-xs leading-snug font-semibold text-balance">
                  {style.name}
                </span>
                <span className="text-muted mt-1 block font-mono text-[0.65rem] tracking-widest">
                  {style.code}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
