import { randomBytes, scrypt, scryptSync, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

/**
 * 비밀번호 해싱. bcrypt·argon2를 붙이면 네이티브 빌드가 따라오는데,
 * scrypt는 Node에 이미 있고 같은 일을 한다. (의존성 0)
 */

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>

const SALT_BYTES = 16
const KEY_BYTES = 64

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES).toString('hex')
  const key = await scryptAsync(password, salt, KEY_BYTES)
  return `${salt}:${key.toString('hex')}`
}

/**
 * mock seed 로딩 전용. 모듈이 로드되는 시점에 동기로 채워야 하는 곳에서만 쓴다.
 * 요청 경로에서는 이벤트 루프를 막으므로 쓰지 않는다 — 그쪽은 hashPassword다.
 */
export function hashPasswordSync(password: string): string {
  const salt = randomBytes(SALT_BYTES).toString('hex')
  return `${salt}:${scryptSync(password, salt, KEY_BYTES).toString('hex')}`
}

/** 저장값이 망가져 있어도 던지지 않는다. 호출부는 "맞다/아니다"만 알면 된다. */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [salt, hashHex] = stored.split(':')
  if (!salt || !hashHex) return false

  const expected = Buffer.from(hashHex, 'hex')
  if (expected.length !== KEY_BYTES) return false

  const actual = await scryptAsync(password, salt, KEY_BYTES)
  // 길이가 같음을 위에서 보장했으므로 timingSafeEqual이 던지지 않는다.
  return timingSafeEqual(actual, expected)
}
