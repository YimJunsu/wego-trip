// 브랜드 이미지(파비콘/마스코트 1:1 + 카톡·OG 공유 16:9) 후보를 Vertex(나노바나나 프로)로 N장씩 생성.
// 카드 파이프라인(generate-card-assets)과 별개 — 정사각/가로 브랜드 자산 전용.
// 후보를 public/images/brand/_candidates/{mascot|og}_{i}.png 로 저장 → 눈으로 비교 후 채택.
// 채택하면 아래 변환으로 실제 자산에 반영:
//   ffmpeg -i _candidates/mascot_3.png -vf scale=512:512 -q:v 90 public/images/brand/mascot.webp
//   ffmpeg -i _candidates/mascot_3.png -vf scale=512:512 app/icon.png
//   ffmpeg -i _candidates/mascot_3.png -vf scale=180:180 app/apple-icon.png
//   ffmpeg -i _candidates/og_1.png -vf "scale=1200:675,crop=1200:630" -q:v 90 public/images/brand/og.webp
//
// 사용:
//   node scripts/generate-brand-assets.mjs --key <sa.json>                       # dry-run(계획·비용)
//   node scripts/generate-brand-assets.mjs --key <sa.json> --go                  # mascot+og 각 4장
//   옵션: --count 6 · --only mascot|og · --ref <치치사진...> (색·개체 참조 강력 권장)
import { existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const P = (...p) => join(ROOT, ...p);

const SQUARE_PREFIX = P('docs/image-prompts/_prefix-nanobanana-square.txt');
const MASCOT_PROMPT = P('docs/image-prompts/brand-mascot.txt');
const OG_PROMPT = P('docs/image-prompts/brand-og.txt');
// 현재 마스코트 = 화풍(웹툰 톤) 앵커. 치치 색/무늬는 프롬프트 + --ref 사진이 강제.
const STYLE_ANCHOR = P('public/images/brand/mascot.webp');
const OUT_DIR = P('public/images/brand/_candidates');
const COST_PER_IMAGE = 0.24; // gemini-3-pro-image-preview 2K 상한

// mascot = square 프리픽스와 결합(참조 첨부 전제 화풍 강제), og = 자족형 프롬프트(스타일 포함).
const ASSETS = {
  mascot: { prompts: [SQUARE_PREFIX, MASCOT_PROMPT], aspect: '1:1' },
  og: { prompts: [OG_PROMPT], aspect: '16:9' },
};

function parseArgs(argv) {
  const args = { ref: [], count: '4' };
  let cur = null;
  for (const a of argv) {
    if (a.startsWith('--')) { cur = a.slice(2); args[cur] ??= true; continue; }
    if (cur === 'ref') { if (args.ref === true) args.ref = []; args.ref.push(a); }
    else if (cur) args[cur] = a;
  }
  if (!args.key) { console.error('필수: --key <sa.json>'); process.exit(1); }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const count = Math.max(1, Number(args.count) || 4);
  const which = args.only ? [args.only] : ['mascot', 'og'];
  for (const w of which) {
    if (!ASSETS[w]) { console.error(`--only 는 mascot|og 만: ${w}`); process.exit(1); }
  }

  const refs = [STYLE_ANCHOR, ...args.ref].filter((p) => existsSync(p));
  const total = which.length * count;
  console.log(`브랜드 후보 생성: ${which.join('+')} 각 ${count}장 (총 ${total}장) · 레퍼런스 ${refs.length}장`);
  if (!args.ref.length) console.log('  ⚠ 치치 사진을 --ref 로 주면 색/무늬가 훨씬 정확해짐 (없으면 화풍 앵커만 사용).');
  console.log(`예상 비용: ~$${(total * COST_PER_IMAGE).toFixed(2)}`);
  if (args.go !== true) {
    console.log('\ndry-run. 실제 생성하려면 --go 추가.');
    return;
  }

  mkdirSync(OUT_DIR, { recursive: true });
  for (const asset of which) {
    const { prompts, aspect } = ASSETS[asset];
    for (let i = 1; i <= count; i++) {
      const out = join(OUT_DIR, `${asset}_${i}.png`);
      console.log(`\n=== ${asset} ${i}/${count} (${aspect}) ===`);
      const promptArgs = prompts.flatMap((p) => ['--prompt', p]);
      const refArgs = refs.flatMap((r) => ['--ref', r]);
      execFileSync('node', [
        join(ROOT, 'scripts', 'generate-image.mjs'),
        '--key', args.key,
        ...promptArgs,
        ...refArgs,
        '--out', out,
        '--aspect', aspect,
      ], { stdio: 'inherit' });
    }
  }

  console.log(`\n완료 → ${OUT_DIR}`);
  console.log('후보 비교 후 채택할 파일명(예: mascot_3, og_1)을 알려주면 실제 자산에 반영해줄게.');
}

main();
