/**
 * 가입 입력 검증. 브라우저의 required·type 검증은 우회 가능하므로
 * Server Action이 같은 함수를 다시 호출한다. 규칙은 여기 한 곳에만 둔다.
 */

export type SignUpFields = {
  name: string
  email: string
  password: string
  /** 화면 전용 확인 입력. 저장소로는 넘어가지 않는다. */
  passwordConfirm: string
  phone: string
  birthDate: string
}

export type FieldErrors = Partial<Record<keyof SignUpFields, string>>

export const MIN_PASSWORD_LENGTH = 8

/** 공백 없는 로컬@도메인.최상위. 실제 도달 여부는 이메일 인증이 볼 일이다. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** 하이픈·공백을 걷어내고 숫자만 남긴다. 저장 형식은 숫자열이다. */
export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, '')
}

/**
 * `Date.parse`는 '1995-02-30'을 3월 2일로 넘겨 준다.
 * 되돌려 찍어 보고 입력과 같을 때만 실재하는 날짜로 본다.
 */
function isRealDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false
  const t = Date.parse(`${iso}T00:00:00Z`)
  if (Number.isNaN(t)) return false
  return new Date(t).toISOString().slice(0, 10) === iso
}

export function validateSignUp(
  fields: SignUpFields,
  today: Date,
): FieldErrors {
  const errors: FieldErrors = {}

  if (!fields.name.trim()) errors.name = '이름을 입력하세요.'

  if (!EMAIL.test(fields.email.trim())) {
    errors.email = '이메일 형식이 아닙니다.'
  }

  if (fields.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`
  }

  if (fields.password !== fields.passwordConfirm) {
    errors.passwordConfirm = '비밀번호가 일치하지 않습니다.'
  }

  const phone = normalizePhone(fields.phone)
  if (phone.length < 10 || phone.length > 11) {
    errors.phone = '전화번호는 숫자 10~11자리입니다.'
  }

  if (!isRealDate(fields.birthDate)) {
    errors.birthDate = '생년월일을 정확히 입력하세요.'
  } else if (fields.birthDate > today.toISOString().slice(0, 10)) {
    errors.birthDate = '생년월일이 오늘보다 뒤입니다.'
  }

  return errors
}
