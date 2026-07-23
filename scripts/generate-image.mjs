// Vertex AI 나노바나나 프로(gemini-3-pro-image-preview) 이미지 생성 CLI.
// 사용법:
//   node scripts/generate-image.mjs --key <서비스계정.json> --prompt <txt...> --ref <이미지...> --out <저장.png> [--aspect 2:3] [--model gemini-3-pro-image-preview]
// --prompt 여러 개면 이어붙임(프리픽스 + 개별). --ref 는 스타일 레퍼런스 이미지(0~14장).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { extname, dirname } from 'node:path';
import { getAccessToken } from './vertex-auth.mjs';

function parseArgs(argv) {
  const args = { prompt: [], ref: [], aspect: '2:3', model: 'gemini-3-pro-image-preview' };
  let cur = null;
  for (const a of argv) {
    if (a.startsWith('--')) { cur = a.slice(2); continue; }
    if (cur === 'prompt' || cur === 'ref') args[cur].push(a);
    else if (cur) args[cur] = a;
  }
  if (!args.key || !args.prompt.length || !args.out) {
    console.error('필수: --key <sa.json> --prompt <txt> --out <png>');
    process.exit(1);
  }
  return args;
}

const MIME = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { token, projectId } = await getAccessToken(args.key);

  const parts = args.ref.map((p) => ({
    inlineData: {
      mimeType: MIME[extname(p).toLowerCase()] ?? 'image/png',
      data: readFileSync(p).toString('base64'),
    },
  }));
  parts.push({ text: args.prompt.map((p) => readFileSync(p, 'utf8').trim()).join('\n\n') });

  const url = `https://aiplatform.googleapis.com/v1/projects/${projectId}/locations/global/publishers/google/models/${args.model}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: { aspectRatio: args.aspect },
      },
    }),
  });
  if (!res.ok) throw new Error(`generateContent 실패 ${res.status}: ${await res.text()}`);
  const json = await res.json();

  const imgs = (json.candidates?.[0]?.content?.parts ?? []).filter((p) => p.inlineData);
  if (!imgs.length) {
    console.error('이미지 없음. 응답:', JSON.stringify(json).slice(0, 2000));
    process.exit(1);
  }
  mkdirSync(dirname(args.out), { recursive: true });
  writeFileSync(args.out, Buffer.from(imgs[0].inlineData.data, 'base64'));
  console.log(`저장: ${args.out} (모델 ${args.model}, ${args.aspect}, 레퍼런스 ${args.ref.length}장)`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
