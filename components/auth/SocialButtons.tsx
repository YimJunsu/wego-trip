/**
 * 카카오·구글 자리. OAuth 연동 전까지 비활성이다.
 * 브랜드 색은 "강조색은 라임 하나" 원칙의 예외다. (DESIGN_SYSTEM §7)
 */
export function SocialButtons() {
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled
        className="bg-kakao text-ink font-display flex items-center justify-center gap-2 rounded-full py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
      >
        카카오로 계속하기
        <span className="text-xs font-normal opacity-70">준비 중</span>
      </button>
      <button
        type="button"
        disabled
        className="border-line bg-surface text-ink font-display flex items-center justify-center gap-2 rounded-full border py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
      >
        구글로 계속하기
        <span className="text-xs font-normal opacity-70">준비 중</span>
      </button>
    </div>
  )
}
