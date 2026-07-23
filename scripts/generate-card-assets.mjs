// 신규 테스트 카드 에셋 일괄 생성 파이프라인.
// docs/image-prompts/{slug}/{key}.txt (카드별 이미지 프롬프트) 를 순회하며
//   이미지: 나노바나나 프로 → public/images/cards/{slug}/{key}.webp (784px, 2:3)
//   영상:   Veo 3.1 image-to-video → 2:3 크롭 → public/images/cards/{slug}/{key}.mp4 (480x720, 무음)
// 이미 존재하는 에셋은 건너뜀 (--force 로 재생성).
//
// 사용법:
//   node scripts/generate-card-assets.mjs --key <sa.json> --slug <slug>            # dry-run (계획+비용만 출력)
//   node scripts/generate-card-assets.mjs --key <sa.json> --slug <slug> --go       # 실제 생성
//   옵션: --only <key> · --skip-video · --force · --ref <이미지...> (스타일 레퍼런스 직접 지정)
//
// 신규 테스트 전체 흐름은 docs/image-prompts/README.md 참고.
import { readdirSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, basename } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const PROMPTS_DIR = (slug) => join(ROOT, 'docs', 'image-prompts', slug);
const CARDS_DIR = (slug) => join(ROOT, 'public', 'images', 'cards', slug);
const IMAGE_PREFIX = join(ROOT, 'docs', 'image-prompts', '_prefix-nanobanana.txt');
const VIDEO_PREFIX = join(ROOT, 'docs', 'image-prompts', '_video-prompt.txt');
// 신규 팩이라 같은 팩 레퍼런스가 없을 때 쓰는 기본 스타일 앵커
const DEFAULT_REFS = [
  'public/images/cards/past-life/king.webp',
  'public/images/cards/cat-personality/zoomies.webp',
  'public/images/cards/romance/cafe.webp',
].map((p) => join(ROOT, p));

const COST_PER_IMAGE = 0.24; // gemini-3-pro-image-preview 2K 기준 상한
const COST_PER_VIDEO = 1.2; // veo-3.1-fast 8초 기준

function parseArgs(argv) {
  const args = { ref: [] };
  let cur = null;
  for (const a of argv) {
    if (a.startsWith('--')) { cur = a.slice(2); args[cur] ??= true; continue; }
    if (cur === 'ref') { if (args.ref === true) args.ref = []; args.ref.push(a); }
    else if (cur) args[cur] = a;
  }
  if (!args.key || !args.slug) {
    console.error('필수: --key <sa.json> --slug <slug>');
    process.exit(1);
  }
  return args;
}

function run(script, params) {
  execFileSync('node', [join(ROOT, 'scripts', script), ...params], { stdio: 'inherit' });
}

function ffmpeg(params) {
  execFileSync('ffmpeg', ['-y', '-v', 'error', ...params], { stdio: 'inherit' });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const promptsDir = PROMPTS_DIR(args.slug);
  const cardsDir = CARDS_DIR(args.slug);
  if (!existsSync(promptsDir)) {
    console.error(`프롬프트 폴더 없음: ${promptsDir}\n카드별 프롬프트를 {key}.txt 로 먼저 작성할 것.`);
    process.exit(1);
  }

  // {key}.txt = 이미지 프롬프트, {key}.video.txt = 카드별 영상 연출(선택)
  const keys = readdirSync(promptsDir)
    .filter((f) => f.endsWith('.txt') && !f.endsWith('.video.txt'))
    .map((f) => basename(f, '.txt'));

  const jobs = keys.map((key) => ({
    key,
    image: args.force === true || !existsSync(join(cardsDir, `${key}.webp`)),
    video: args['skip-video'] !== true && (args.force === true || !existsSync(join(cardsDir, `${key}.mp4`))),
  })).filter((j) => (args.only ? j.key === args.only : true) && (j.image || j.video));

  const nImg = jobs.filter((j) => j.image).length;
  const nVid = jobs.filter((j) => j.video).length;
  console.log(`[${args.slug}] 프롬프트 ${keys.length}개 · 생성 대상: 이미지 ${nImg}, 영상 ${nVid}`);
  console.log(`예상 비용: ~$${(nImg * COST_PER_IMAGE + nVid * COST_PER_VIDEO).toFixed(2)}`);
  if (!jobs.length) { console.log('생성할 것 없음.'); return; }
  if (args.go !== true) {
    for (const j of jobs) console.log(`  ${j.key}: ${[j.image && 'webp', j.video && 'mp4'].filter(Boolean).join(' + ')}`);
    console.log('\ndry-run. 실제 생성하려면 --go 추가.');
    return;
  }

  mkdirSync(cardsDir, { recursive: true });
  const tmp = join(tmpdir(), `nyang-assets-${args.slug}`);
  mkdirSync(tmp, { recursive: true });

  for (const job of jobs) {
    const promptFile = join(promptsDir, `${job.key}.txt`);
    const rawPng = join(tmp, `${job.key}.png`);
    const webp = join(cardsDir, `${job.key}.webp`);
    const mp4 = join(cardsDir, `${job.key}.mp4`);

    if (job.image) {
      // 같은 팩에 이미 있는 카드를 레퍼런스로 (자기 자신 제외, 최대 3장) — 없으면 기본 앵커
      const packRefs = existsSync(cardsDir)
        ? readdirSync(cardsDir).filter((f) => f.endsWith('.webp') && f !== `${job.key}.webp`).slice(0, 3).map((f) => join(cardsDir, f))
        : [];
      const isWide = args.slug === 'menus';
      const backupRef = isWide ? join(ROOT, 'public/images/cards/menus-backup', `${job.key}.webp`) : '';
      const hasBackup = isWide && existsSync(backupRef);
      
      let refs = [];
      if (args.ref.length) {
        refs = args.ref;
      } else if (hasBackup) {
        refs = [backupRef];
      } else if (args.slug === 'oracle') {
        // [중요 방어 로직] 냥님 9종을 뽑을 때, 팩 내부의 징그러운 이미지가 돌고 도는 것을 막기 위해
        // 무조건 예쁘게 뽑힌 '메뉴 원본 냥님(oracle.webp)' 1장만을 레퍼런스로 강제 고정!
        const oracleBackupRef = join(ROOT, 'public/images/cards/menus-backup', 'oracle.webp');
        if (existsSync(oracleBackupRef)) refs = [oracleBackupRef];
        else refs = DEFAULT_REFS;
      } else if (packRefs.length) {
        refs = packRefs;
      } else {
        refs = DEFAULT_REFS;
      }

      console.log(`\n=== ${job.key} 이미지 (레퍼런스 ${refs.length}장: ${hasBackup ? '원본 백업 사용' : '팩 레퍼런스 사용'}) ===`);
      
      const imgPrefix = isWide ? join(ROOT, 'docs', 'image-prompts', '_prefix-nanobanana-wide.txt') : IMAGE_PREFIX;
      const aspectImg = isWide ? '3:2' : '2:3';
      run('generate-image.mjs', ['--key', args.key, '--prompt', imgPrefix, promptFile, '--ref', ...refs, '--out', rawPng, '--aspect', aspectImg]);
      const scaleImg = isWide ? '720:480' : '784:-2';
      ffmpeg(['-i', rawPng, '-vf', `scale=${scaleImg}`, '-quality', '82', webp]);
      console.log(`변환: ${webp}`);
    }

    if (job.video) {
      const srcImage = existsSync(rawPng) ? rawPng : webp;
      const rawMp4 = join(tmp, `${job.key}.mp4`);
      const videoPrompts = [VIDEO_PREFIX];
      const perCard = join(promptsDir, `${job.key}.video.txt`);
      if (existsSync(perCard)) videoPrompts.push(perCard);
      console.log(`\n=== ${job.key} 영상 ===`);
      const isWide = args.slug === 'menus';
      const aspectVid = isWide ? '16:9' : '9:16';
      run('generate-video.mjs', ['--key', args.key, '--image', srcImage, '--prompt', ...videoPrompts, '--out', rawMp4, '--aspect', aspectVid]);
      // 9:16(720x1280) → 2:3 중앙 크롭 → 480x720, 무음, 스트리밍 친화
      // 16:9(1280x720) → 3:2 중앙 크롭 → 480x320
      const filterVid = isWide ? 'crop=1080:720,scale=480:320' : 'crop=720:1080,scale=480:720';
      ffmpeg(['-i', rawMp4, '-vf', filterVid, '-an', '-c:v', 'libx264', '-crf', '28', '-movflags', '+faststart', mp4]);
      console.log(`변환: ${mp4}`);
    }
  }

  rmSync(tmp, { recursive: true, force: true });
  console.log('\n완료. data/tests 의 image/video 경로 규칙(/images/cards/{slug}/{key}.*)과 일치하면 UI에 자동 반영됨.');
}

main();
