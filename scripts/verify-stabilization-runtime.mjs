import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { archiveResponse } from '../src/utils/archiveResponse.ts';
import { buildOfflineKnowledgeArtifacts } from '../src/utils/offlineKnowledge.ts';
import { cachedFeedResponse, fetchText, mapWithConcurrency } from '../api/feed-utils.ts';
import { isAllowedResolvedAddress, postLocalModelJson, resolveAllowedLocalModelUrl } from '../server/localModelTransport.ts';

const bytes = new Uint8Array([0, 1, 2, 3, 4]);
async function archive(range, method = 'GET') {
  return archiveResponse(new Request('https://example.invalid/maps/norway.pmtiles', {
    method, headers: range ? { Range: range } : {},
  }), new Response(bytes));
}
for (const [range, expected, contentRange] of [
  ['bytes=0-1', [0, 1], 'bytes 0-1/5'],
  ['bytes=3-100', [3, 4], 'bytes 3-4/5'],
  ['bytes=2-', [2, 3, 4], 'bytes 2-4/5'],
  ['bytes=-2', [3, 4], 'bytes 3-4/5'],
  ['bytes=-100', [0, 1, 2, 3, 4], 'bytes 0-4/5'],
]) {
  const response = await archive(range);
  assert.equal(response.status, 206, range);
  assert.equal(response.headers.get('content-range'), contentRange);
  assert.equal(Number(response.headers.get('content-length')), expected.length);
  assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], expected);
}
for (const range of ['bytes=5-', 'bytes=4-2', 'bytes=-0', 'bytes=-', 'bytes=0-1,3-4', 'bytes=99999999999999999999-']) {
  const response = await archive(range);
  assert.equal(response.status, 416, range);
  assert.equal(response.headers.get('content-range'), 'bytes */5');
}
assert.equal((await archive('bytes=0-1', 'HEAD')).status, 200);
assert.equal((await (await archive(null, 'HEAD')).text()), '');
assert.deepEqual([...new Uint8Array(await (await archive(null)).arrayBuffer())], [...bytes]);
console.log('[PASS] Cached archive GET/HEAD, suffix/open/overlong ranges and rejection boundaries.');

const emptyKnowledge = {
  pillarsEn: [], pillarsNo: [], processedAssets: [], checklistsEn: [], checklistsNo: [],
  glossary: [], editorialArticles: [], shelters: [], sourceRegistry: [],
};
const unknownReview = buildOfflineKnowledgeArtifacts({ ...emptyKnowledge, processedAssetsGeneratedAt: '2026-05-31', bundledAt: 'invalid' });
assert(unknownReview.contentPacks.every((pack) => pack.lastVerified === '' && pack.bundledAt === ''));
const explicitReview = buildOfflineKnowledgeArtifacts({ ...emptyKnowledge, lastSourceReview: '2026-10-30' });
assert(explicitReview.contentPacks.every((pack) => pack.lastVerified === '2026-10-30'));
console.log('[PASS] Generation dates and missing/invalid dates do not fabricate review evidence.');

assert(isAllowedResolvedAddress('127.0.0.1'));
assert(isAllowedResolvedAddress('::1'));
assert(!isAllowedResolvedAddress('8.8.8.8'));
assert(!isAllowedResolvedAddress('2606:4700:4700::1111'));
assert.equal(await resolveAllowedLocalModelUrl('https://public.example/v1'), null);
assert.equal(await resolveAllowedLocalModelUrl('http://user:secret@localhost/v1'), null);
assert.equal(await resolveAllowedLocalModelUrl('http://model.local/v1', async () => [
  { address: '127.0.0.1' }, { address: '8.8.8.8' },
]), null);
assert.equal((await resolveAllowedLocalModelUrl('http://model.local/v1', async () => [{ address: '192.168.1.2' }]))?.address, '192.168.1.2');
await assert.rejects(resolveAllowedLocalModelUrl('http://model.local/v1', async () => new Promise(() => {})), /DNS timed out/);
console.log('[PASS] Local-model policy rejects public/mixed DNS, credentials and unsupported endpoints.');

let active = 0;
let maximumActive = 0;
assert.deepEqual(await mapWithConcurrency([1, 2, 3, 4, 5], 2, async (value) => {
  active += 1; maximumActive = Math.max(maximumActive, active);
  await new Promise((resolve) => setTimeout(resolve, 5));
  active -= 1; return value * 2;
}), [2, 4, 6, 8, 10]);
assert.equal(maximumActive, 2);
let loads = 0;
const load = async () => { loads += 1; await new Promise((resolve) => setTimeout(resolve, 5)); return { items: ['cached'] }; };
const cached = await Promise.all([cachedFeedResponse('audit-runtime', load), cachedFeedResponse('audit-runtime', load)]);
assert.deepEqual(cached[0], cached[1]);
await cachedFeedResponse('audit-runtime', load);
assert.equal(loads, 1);
await assert.rejects(cachedFeedResponse('audit-retry', async () => { throw new Error('upstream failed'); }));
assert.equal(await cachedFeedResponse('audit-retry', async () => 'recovered'), 'recovered');
console.log('[PASS] Feed concurrency, in-flight deduplication, cache hits and retry after failure.');

const originalFetch = globalThis.fetch;
let cancelled = false;
try {
  globalThis.fetch = async () => new Response(new ReadableStream({
    start(controller) { controller.enqueue(new Uint8Array(2 * 1024 * 1024 + 1)); },
    cancel() { cancelled = true; },
  }));
  await assert.rejects(fetchText('https://example.invalid/oversized'), /too large/);
  assert(cancelled, 'Oversized feed streams must be cancelled, not left downloading.');
} finally { globalThis.fetch = originalFetch; }
console.log('[PASS] Oversized decoded feed response is rejected and its stream cancelled.');

let redirectTargetRequests = 0;
const server = createServer((request, response) => {
  request.resume();
  if (request.url === '/redirect/chat/completions') { response.writeHead(302, { Location: '/target' }); response.end(); }
  else if (request.url === '/target') { redirectTargetRequests += 1; response.end('{}'); }
  else if (request.url === '/oversized/chat/completions') { response.end('x'.repeat(1024 * 1024 + 1)); }
  else if (request.url === '/invalid/chat/completions') { response.end('not JSON'); }
  else if (request.url === '/stalled/chat/completions') { response.writeHead(200); response.write('{'); }
  else { response.setHeader('Content-Type', 'application/json'); response.end('{"local":true}'); }
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;
try {
  assert.deepEqual(await postLocalModelJson(`${base}/v1`, { test: true }), { local: true });
  assert.equal(await postLocalModelJson(`${base}/redirect`, {}), null);
  assert.equal(redirectTargetRequests, 0);
  assert.equal(await postLocalModelJson(`${base}/oversized`, {}), null);
  assert.equal(await postLocalModelJson(`${base}/invalid`, {}), null);
  assert.equal(await postLocalModelJson(`${base}/stalled`, {}), null);
} finally {
  const closed = new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  server.closeAllConnections();
  await closed;
}
console.log('[PASS] Local-model HTTP success, redirect refusal, body cap, invalid JSON, stalled-body deadline and server cleanup.');
