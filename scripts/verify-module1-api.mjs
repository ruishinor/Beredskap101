import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { normalizeExternalUrl } from '../api/feed-utils.ts';

const API_BASE_URL = 'http://127.0.0.1:3002';
const UI_BASE_URL = 'http://127.0.0.1:3011';
const STARTUP_TIMEOUT_MS = 25000;
const REQUEST_TIMEOUT_MS = 20000;
const TEST_FEED_TIMEOUT_MS = '1500';

function spawnManaged(args, stdio = ['ignore', 'pipe', 'pipe']) {
  return spawn(process.execPath, args, {
    stdio,
    detached: process.platform !== 'win32',
    env: {
      ...process.env,
      B101_FEED_TIMEOUT_MS: TEST_FEED_TIMEOUT_MS,
    },
  });
}

function logPass(message) {
  console.log(`[PASS] ${message}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
  logPass(message);
}

async function fetchJson(url, init = {}) {
  const response = await fetch(url, {
    ...init,
    signal: init.signal || AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Expected JSON from ${url}, received: ${text.slice(0, 120)}`);
  }

  return { response, data };
}

async function waitForApiReady() {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const { response, data } = await fetchJson(`${API_BASE_URL}/api/healthz`);
      if (response.ok && data && typeof data.status === 'string') return;
    } catch {
      // Continue polling until timeout.
    }
    await delay(350);
  }
  throw new Error('API server did not become ready in time.');
}

async function waitForUiReady() {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(UI_BASE_URL, { signal: AbortSignal.timeout(2000) });
      if (response.ok) return;
    } catch {
      // Continue polling until timeout.
    }
    await delay(350);
  }
  throw new Error('UI server did not become ready in time.');
}

function spawnApiServer() {
  return spawnManaged(['--import', 'tsx', 'server.js']);
}

function signalProcessTree(child, signal) {
  if (!child || child.exitCode !== null) return;

  try {
    if (process.platform === 'win32') {
      if (signal === 'SIGKILL') {
        spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
      } else {
        child.kill('SIGTERM');
      }
      return;
    }

    process.kill(-child.pid, signal);
  } catch {
    try {
      child.kill(signal);
    } catch {
      // Ignore termination races.
    }
  }
}

async function stopManagedProcess(child) {
  if (!child || child.exitCode !== null) return;

  const exited = new Promise((resolve) => {
    child.once('exit', resolve);
  });

  signalProcessTree(child, 'SIGTERM');
  await Promise.race([exited, delay(2500)]);

  if (child.exitCode === null) {
    signalProcessTree(child, 'SIGKILL');
    await Promise.race([exited, delay(1000)]);
  }
}

async function run() {
  assert(
    normalizeExternalUrl('https://example.com/path') === 'https://example.com/path',
    'Feed URL normalization accepts HTTP(S) links.'
  );
  assert(normalizeExternalUrl('javascript:alert(1)') === '', 'Feed URL normalization rejects javascript URLs.');
  assert(normalizeExternalUrl('data:text/html,test') === '', 'Feed URL normalization rejects data URLs.');

  const apiProcess = spawnApiServer();
  let stderrBuffer = '';

  apiProcess.stderr.on('data', (chunk) => {
    stderrBuffer += String(chunk);
  });

  apiProcess.stdout.on('data', () => {
    // Keeping stdout attached for startup sequencing; no-op by design.
  });

  try {
    await waitForApiReady();

    const { response: healthResponse, data: healthData } = await fetchJson(`${API_BASE_URL}/api/healthz`);
    assert(healthResponse.status === 200, 'GET /api/healthz returns 200');
    assert(typeof healthData?.status === 'string', 'GET /api/healthz returns status field');
    assert(
      healthResponse.headers.get('cache-control') === 'no-store' && !Number.isNaN(Date.parse(healthData?.timestamp)),
      'GET /api/healthz returns ISO timestamp with no-store (unified local/serverless handler)'
    );

    // Phase 5.1: limiters key on the socket peer, so rotating spoofed
    // x-forwarded-for headers must NOT reset the budget. healthz allows
    // 60/min per peer; with pre-burst polling requests already in the window,
    // requests 61+ of this burst are guaranteed to be rejected.
    const xffStatuses = [];
    for (let i = 1; i <= 65; i += 1) {
      const { response } = await fetchJson(`${API_BASE_URL}/api/healthz`, {
        headers: { 'x-forwarded-for': `203.0.113.${i}` },
      });
      xffStatuses.push(response.status);
    }
    assert(
      xffStatuses.slice(60).every((status) => status === 429),
      'XFF spoof burst: requests 61+ receive 429 despite rotating spoofed x-forwarded-for'
    );
    assert(
      xffStatuses.filter((status) => status === 200).length <= 60,
      'XFF spoof burst: limiter admits at most 60 requests per socket peer per minute'
    );
    assert(
      xffStatuses.some((status) => status === 429),
      'XFF spoof burst: limiter actually rejects (not an always-200 endpoint)'
    );

    const { response: copilotInvalidResponse } = await fetchJson(`${API_BASE_URL}/api/copilot/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(copilotInvalidResponse.status === 400, 'POST /api/copilot/analyze rejects missing history payload');

    const { response: copilotValidResponse, data: copilotValidData } = await fetchJson(`${API_BASE_URL}/api/copilot/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: 'Module 1 Backward Compatibility',
        history: [{ choice: 'Call 113 and coordinate backup', responseTimeSec: 20, scoreChange: 8 }],
      }),
    });
    assert(copilotValidResponse.status === 200, 'POST /api/copilot/analyze accepts valid history payload');
    assert(typeof copilotValidData?.resilienceScore === 'number', '/api/copilot/analyze returns resilienceScore');
    assert(typeof copilotValidData?.readinessGrade === 'string', '/api/copilot/analyze returns readinessGrade');

    const { response: sourceResponse, data: sourceData } = await fetchJson(`${API_BASE_URL}/api/source-feeds`);
    assert(sourceResponse.status === 200, 'GET /api/source-feeds returns 200');
    assert(typeof sourceData?.fetchedAt === 'string', '/api/source-feeds returns fetchedAt');
    assert(Array.isArray(sourceData?.sources), '/api/source-feeds returns sources array');

    const { response: norwayResponse, data: norwayData } = await fetchJson(`${API_BASE_URL}/api/norway-news?limit=5`);
    assert(norwayResponse.status === 200, 'GET /api/norway-news returns 200');
    assert(Array.isArray(norwayData?.items), '/api/norway-news returns items array');
    assert(norwayData.items.length <= 5, '/api/norway-news respects limit parameter');
    assert(Array.isArray(norwayData?.partialFailures), '/api/norway-news returns partialFailures array');

    // Phase 5.1: feed TTL cache — two sequential calls within the 60s TTL must
    // trigger exactly one upstream fetch (distinct query string = fresh key).
    const ttlUrl = `${API_BASE_URL}/api/norway-news?limit=3&lang=no`;
    const { response: ttlFirstResponse } = await fetchJson(ttlUrl);
    assert(ttlFirstResponse.status === 200, 'Feed TTL cache: first call succeeds');
    assert(
      ttlFirstResponse.headers.get('x-b101-feed-cache') === 'MISS',
      'Feed TTL cache: first call is an upstream MISS'
    );
    const ttlFirstFetches = ttlFirstResponse.headers.get('x-b101-upstream-fetches');
    const { response: ttlSecondResponse, data: ttlSecondData } = await fetchJson(ttlUrl);
    assert(ttlSecondResponse.status === 200, 'Feed TTL cache: second call within TTL succeeds');
    assert(
      ttlSecondResponse.headers.get('x-b101-feed-cache') === 'HIT',
      'Feed TTL cache: second call within TTL is served from cache'
    );
    assert(
      ttlSecondResponse.headers.get('x-b101-upstream-fetches') === ttlFirstFetches,
      'Feed TTL cache: two calls within TTL trigger a single upstream fetch'
    );
    assert(Array.isArray(ttlSecondData?.items), 'Feed TTL cache: cached payload keeps response shape');

    const { response: contactInvalidResponse, data: contactInvalidData } = await fetchJson(`${API_BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(contactInvalidResponse.status === 400, 'POST /api/contact rejects missing required fields');
    assert(Array.isArray(contactInvalidData?.required), 'POST /api/contact returns required fields on 400');

    const { response: contactValidResponse, data: contactValidData } = await fetchJson(`${API_BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Module1 Audit',
        email: 'audit@example.com',
        subject: 'Verification',
        message: 'Module 1 contact flow verification',
      }),
    });
    assert(contactValidResponse.status === 200, 'POST /api/contact accepts valid payload');
    assert(
      typeof contactValidData?.mailto === 'string' &&
        contactValidData.mailto.startsWith('mailto:info@holf.services'),
      'POST /api/contact returns mailto handoff to info@holf.services'
    );

    // Phase 5.1: feed routes share a 30/min limiter per socket peer. The
    // earlier feed/TTL calls above already consumed a few tokens, so a burst
    // of 40 must yield at least 10 rejections (29+ pass, 11+ rejected).
    const burstStatuses = [];
    for (let i = 0; i < 40; i += 1) {
      const { response } = await fetchJson(`${API_BASE_URL}/api/source-feeds`);
      burstStatuses.push(response.status);
    }
    const burstRejected = burstStatuses.filter((status) => status === 429).length;
    assert(burstStatuses[0] === 200, 'Feed burst: limiter allows genuine traffic before the limit');
    assert(
      burstRejected >= 10,
      `Feed burst of 40: ${burstRejected} requests receive 429 (expected at least 10)`
    );

    console.log('[SUCCESS] Module 1 API parity verification completed.');
  } finally {
    await stopManagedProcess(apiProcess);
  }

  if (stderrBuffer.includes('EADDRINUSE')) {
    throw new Error('Port 3002 is already in use. Stop conflicting process and rerun verification.');
  }

  const devProcess = spawnManaged(['scripts/dev-runtime.mjs']);

  let devStdErr = '';
  devProcess.stderr.on('data', (chunk) => {
    devStdErr += String(chunk);
  });

  try {
    await waitForUiReady();

    const sourceViaUi = await fetchJson(`${UI_BASE_URL}/api/source-feeds`);
    assert(sourceViaUi.response.status === 200, 'Dev runtime proxies /api/source-feeds via Vite at port 3011');

    const norwayViaUi = await fetchJson(`${UI_BASE_URL}/api/norway-news?limit=3`);
    assert(norwayViaUi.response.status === 200, 'Dev runtime proxies /api/norway-news via Vite at port 3011');
    assert(Array.isArray(norwayViaUi.data?.items) && norwayViaUi.data.items.length <= 3, 'Dev runtime limit query remains functional through proxy');

    const contactViaUi = await fetchJson(`${UI_BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(contactViaUi.response.status === 400, 'Dev runtime proxies /api/contact validation through Vite at port 3011');

    const copilotViaUi = await fetchJson(`${UI_BASE_URL}/api/copilot/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: 'Module 1 proxy compatibility',
        history: [{ text: 'Secure offline backup', responseTimeSec: 25, scoreChange: 4 }],
      }),
    });
    assert(copilotViaUi.response.status === 200, 'Dev runtime proxies /api/copilot/analyze through Vite at port 3011');
    assert(
      typeof copilotViaUi.data?.resilienceScore === 'number',
      'Dev runtime keeps /api/copilot/analyze response contract through proxy'
    );
  } finally {
    await stopManagedProcess(devProcess);
  }

  if (devStdErr.includes('EADDRINUSE')) {
    throw new Error('Port conflict detected while running npm run dev.');
  }
}

run().catch((error) => {
  console.error('[FAIL]', error.message || error);
  process.exit(1);
});
