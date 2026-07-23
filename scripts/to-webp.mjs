// PNG/JPG → webp 변환. 화면에서 쓰는 크기에 맞춰 줄이고 webp로 다시 쓴다.
//
// 사용법:
//   node scripts/to-webp.mjs <src> <dest> [width] [quality]
//
// width를 주면 그 가로폭으로 줄인다(원본보다 크게 늘리지는 않는다). 0이면 크기 유지.
// sharp는 비동기라 별도 스크립트로 뒀다 — 부모 스크립트가 execFileSync로 순서를 지키며 부른다.
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import sharp from 'sharp'

const [src, dest, width = '0', quality = '80'] = process.argv.slice(2)

if (!src || !dest) {
  console.error('필수: <src> <dest> [width] [quality]')
  process.exit(1)
}

const pipeline = sharp(src)
if (Number(width) > 0) {
  pipeline.resize({ width: Number(width), withoutEnlargement: true })
}

const info = await pipeline
  .webp({ quality: Number(quality) })
  .toFile((mkdirSync(dirname(dest), { recursive: true }), dest))

console.log(
  `  webp: ${dest} (${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)}KB)`,
)
