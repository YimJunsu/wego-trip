// Vertex AI Veo 3.1 image-to-video 생성 CLI.
// 사용법:
//   node scripts/generate-video.mjs --key <sa.json> --image <입력이미지> --prompt <txt...> --out <저장.mp4>
//     [--aspect 9:16] [--seconds 8] [--model veo-3.1-fast-generate-preview] [--location us-central1]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { extname, dirname } from 'node:path';
import { getAccessToken } from './vertex-auth.mjs';

function parseArgs(argv) {
  const args = {
    prompt: [], aspect: '9:16', seconds: '8',
    model: 'veo-3.1-fast-generate-001', location: 'us-central1',
  };
  let cur = null;
  for (const a of argv) {
    if (a.startsWith('--')) { cur = a.slice(2); continue; }
    if (cur === 'prompt') args.prompt.push(a);
    else if (cur) args[cur] = a;
  }
  if (!args.key || !args.image || !args.prompt.length || !args.out) {
    console.error('필수: --key <sa.json> --image <png/webp> --prompt <txt> --out <mp4>');
    process.exit(1);
  }
  return args;
}

const MIME = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { token, projectId } = await getAccessToken(args.key);
  const host = args.location === 'global' ? 'aiplatform.googleapis.com' : `${args.location}-aiplatform.googleapis.com`;
  const base = `https://${host}/v1/projects/${projectId}/locations/${args.location}/publishers/google/models/${args.model}`;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const start = await fetch(`${base}:predictLongRunning`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      instances: [{
        prompt: args.prompt.map((p) => readFileSync(p, 'utf8').trim()).join('\n\n'),
        image: {
          bytesBase64Encoded: readFileSync(args.image).toString('base64'),
          mimeType: MIME[extname(args.image).toLowerCase()] ?? 'image/png',
        },
      }],
      parameters: {
        aspectRatio: args.aspect,
        durationSeconds: Number(args.seconds),
        sampleCount: 1,
        resolution: '720p',
      },
    }),
  });
  if (!start.ok) throw new Error(`predictLongRunning 실패 ${start.status}: ${await start.text()}`);
  const { name: operationName } = await start.json();
  console.log(`작업 시작: ${operationName}`);

  // 폴링 (최대 10분)
  for (let i = 0; i < 60; i++) {
    await sleep(10_000);
    const poll = await fetch(`${base}:fetchPredictOperation`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ operationName }),
    });
    if (!poll.ok) throw new Error(`fetchPredictOperation 실패 ${poll.status}: ${await poll.text()}`);
    const op = await poll.json();
    if (!op.done) { console.log(`대기중... (${(i + 1) * 10}s)`); continue; }
    if (op.error) throw new Error(`생성 실패: ${JSON.stringify(op.error)}`);
    const video = op.response?.videos?.[0];
    if (!video?.bytesBase64Encoded) {
      throw new Error(`영상 없음. 응답: ${JSON.stringify(op.response).slice(0, 2000)}`);
    }
    mkdirSync(dirname(args.out), { recursive: true });
    writeFileSync(args.out, Buffer.from(video.bytesBase64Encoded, 'base64'));
    console.log(`저장: ${args.out} (모델 ${args.model}, ${args.aspect}, ${args.seconds}s)`);
    return;
  }
  throw new Error('타임아웃 (10분)');
}

main().catch((e) => { console.error(e.message); process.exit(1); });
