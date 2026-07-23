'use client'

import { useState } from 'react'
import { CheckIcon, ShareNetworkIcon } from '@phosphor-icons/react'
import { ActionButton } from '@/components/dashboard/ActionButton'

type State = 'idle' | 'copied' | 'failed'

/**
 * 결과 공유. 카카오톡·메시지로 바로 넘기는 건 브라우저의 공유 시트(Web Share)에 맡기고,
 * 그게 없는 데스크톱에서는 링크 복사로 떨어진다. 주소는 지금 보고 있는 페이지 그대로다.
 */
export function ShareButton({ title, text }: { title: string; text: string }) {
  const [state, setState] = useState<State>('idle')

  async function share() {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
        return
      } catch {
        // 사용자가 공유 시트를 닫은 경우도 여기로 온다. 복사로 넘어간다.
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setState('copied')
      setTimeout(() => setState('idle'), 1800)
    } catch {
      setState('failed')
    }
  }

  return (
    <div>
      <ActionButton
        tone="lime"
        size="lg"
        className="w-full"
        onClick={share}
        aria-live="polite"
      >
        {state === 'copied' ? (
          <CheckIcon size={20} weight="bold" aria-hidden />
        ) : (
          <ShareNetworkIcon size={20} weight="bold" aria-hidden />
        )}
        {state === 'copied' ? '링크 복사됨' : '결과 공유하기'}
      </ActionButton>
      {state === 'failed' && (
        <p className="text-danger mt-2 text-center text-sm">
          공유에 실패했습니다. 주소창을 복사해 주세요.
        </p>
      )}
    </div>
  )
}
