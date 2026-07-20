'use client'

import { useState } from 'react'
import { CheckIcon, CopyIcon } from '@phosphor-icons/react'
import { ActionButton } from '@/components/dashboard/ActionButton'

export function CopyCodeButton({ code }: { code: string }) {
  const [isCopied, setIsCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 1500)
    } catch {
      /* 클립보드를 막아 둔 브라우저도 있다. 코드는 화면에 이미 보이므로 조용히 넘어간다. */
    }
  }

  return (
    <ActionButton tone={isCopied ? 'lime' : 'quiet'} size="sm" onClick={copy}>
      {isCopied ? (
        <CheckIcon size={14} weight="bold" aria-hidden />
      ) : (
        <CopyIcon size={14} weight="bold" aria-hidden />
      )}
      {isCopied ? '복사됨' : '복사'}
    </ActionButton>
  )
}
