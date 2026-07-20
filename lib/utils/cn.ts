type ClassValue = string | false | null | undefined

/** 조건부 클래스 결합. 의존성을 늘리지 않으려고 clsx 대신 직접 둔다. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}
