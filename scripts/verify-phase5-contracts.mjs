import fs from 'node:fs';
import path from 'node:path';
import contactHandler from '../api/contact.ts';
import healthzHandler from '../api/healthz.ts';
import { isLocalHttpUrl, isPrivateOrLoopbackIpv4 } from '../src/utils/privateNetwork.ts';

const ROOT = process.cwd();

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function pass(message) {
  console.log(`[PASS] ${message}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
  pass(message);
}

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(key, value) {
      this.headers[String(key).toLowerCase()] = value;
    },
    getHeader(key) {
      return this.headers[String(key).toLowerCase()];
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    end() {
      return this;
    },
  };
}

function createContactReq(ip, body, extra = {}) {
  return {
    method: 'POST',
    socket: { remoteAddress: ip },
    body,
    ...extra,
  };
}

const VALID_CONTACT_BODY = {
  name: 'Phase5 Audit',
  email: 'phase5@example.com',
  subject: 'Verification',
  message: 'Phase 5 contact stub verification',
};

async function run() {
  // --- Module 5.3: shared private-network util -----------------------------
  assert(isPrivateOrLoopbackIpv4('10.0.0.8'), 'Shared util: 10.x is private');
  assert(isPrivateOrLoopbackIpv4('192.168.1.25'), 'Shared util: 192.168.x is private');
  assert(isPrivateOrLoopbackIpv4('172.16.0.1') && isPrivateOrLoopbackIpv4('172.31.255.255'), 'Shared util: 172.16-31 is private');
  assert(!isPrivateOrLoopbackIpv4('172.32.0.1'), 'Shared util: 172.32.x is not private');
  assert(isPrivateOrLoopbackIpv4('127.0.0.1') && isPrivateOrLoopbackIpv4('169.254.1.1'), 'Shared util: loopback + link-local');
  assert(!isPrivateOrLoopbackIpv4('8.8.8.8'), 'Shared util: public IPv4 rejected');
  assert(isLocalHttpUrl('http://localhost:11434/v1'), 'Shared util: localhost URL accepted');
  assert(isLocalHttpUrl('http://[::1]:8080/v1'), 'Shared util: bracketed IPv6 loopback accepted');
  assert(isLocalHttpUrl('http://lab-box.local:8080/v1'), 'Shared util: .local hostname accepted');
  assert(isLocalHttpUrl('http://192.168.1.25:8080/v1'), 'Shared util: private LAN URL accepted');
  assert(!isLocalHttpUrl('https://api.openai.com/v1'), 'Shared util: cloud API host rejected');
  assert(!isLocalHttpUrl('javascript:alert(1)'), 'Shared util: non-http(s) scheme rejected');

  // --- Module 5.2: serverless contact stub ---------------------------------
  const shapeRes = createMockRes();
  await contactHandler(createContactReq('198.51.100.1', VALID_CONTACT_BODY), shapeRes);
  assert(shapeRes.statusCode === 200, 'Contact stub: valid POST returns 200');
  assert(
    shapeRes.body?.ok === true && typeof shapeRes.body?.mailto === 'string' &&
      shapeRes.body.mailto.startsWith('mailto:info@holf.services'),
    'Contact stub: response shape unchanged (ok + mailto handoff)'
  );
  assert(shapeRes.headers['cache-control'] === 'no-store', 'Contact stub: no-store on responses');

  const invalidRes = createMockRes();
  await contactHandler(createContactReq('198.51.100.2', {}), invalidRes);
  assert(
    invalidRes.statusCode === 400 && Array.isArray(invalidRes.body?.required),
    'Contact stub: missing fields still return 400 with required list'
  );

  const methodRes = createMockRes();
  await contactHandler({ method: 'GET', socket: { remoteAddress: '198.51.100.3' } }, methodRes);
  assert(methodRes.statusCode === 405, 'Contact stub: non-POST returns 405');

  // 61 POSTs from one socket peer with ROTATING spoofed XFF — the limiter
  // keys on the socket peer, so request 61 (and everything after request 5)
  // must be 429. Each request uses a fresh mock res.
  const burstIp = '198.51.100.10';
  let firstFiveOk = true;
  let lastStatus = 0;
  let rejected = 0;
  for (let i = 1; i <= 61; i += 1) {
    const res = createMockRes();
    const req = createContactReq(burstIp, VALID_CONTACT_BODY, {
      headers: { 'x-forwarded-for': `203.0.113.${i}` },
    });
    await contactHandler(req, res);
    if (i <= 5 && res.statusCode !== 200) firstFiveOk = false;
    if (res.statusCode === 429) rejected += 1;
    lastStatus = res.statusCode;
    if (res.statusCode === 429 && (typeof res.body?.error !== 'string' || 'mailto' in (res.body || {}))) {
      throw new Error('Contact stub: 429 must carry error only, no mailto');
    }
  }
  assert(firstFiveOk, 'Contact stub: first 5 POSTs within limit keep 200 shape');
  assert(lastStatus === 429, 'Contact stub: 61st POST returns 429');
  assert(rejected === 56, `Contact stub: requests 6-61 all rejected, error-only 429 body (got ${rejected} rejections)`);

  // Errors must be generic 500 with no PII echo.
  const piiMarker = 'sensitive-pii-marker@example.com';
  const errorReq = {
    method: 'POST',
    socket: { remoteAddress: '198.51.100.20' },
    get body() {
      throw new Error(`boom ${piiMarker}`);
    },
  };
  const errorRes = createMockRes();
  await contactHandler(errorReq, errorRes);
  assert(errorRes.statusCode === 500, 'Contact stub: handler failure returns 500');
  assert(
    errorRes.body?.error === 'Internal server error' && !JSON.stringify(errorRes.body).includes(piiMarker),
    'Contact stub: 500 is generic with no PII echo'
  );

  // --- Module 5.3: unified healthz handler ---------------------------------
  const healthRes = createMockRes();
  await healthzHandler({ method: 'GET' }, healthRes);
  assert(healthRes.statusCode === 200, 'Healthz: GET returns 200');
  assert(healthRes.headers['cache-control'] === 'no-store', 'Healthz: Cache-Control no-store');
  assert(
    typeof healthRes.body?.status === 'string' && !Number.isNaN(Date.parse(healthRes.body?.timestamp)),
    'Healthz: ISO timestamp in payload'
  );
  const headRes = createMockRes();
  await healthzHandler({ method: 'HEAD' }, headRes);
  assert(headRes.statusCode === 200, 'Healthz: HEAD returns 200');
  const postRes = createMockRes();
  await healthzHandler({ method: 'POST' }, postRes);
  assert(postRes.statusCode === 405, 'Healthz: POST returns 405');

  // --- Module 5.3: JSON-LD moved out of inline script ----------------------
  const indexHtml = readText('index.html');
  assert(
    !indexHtml.includes('<script type="application/ld+json">'),
    'JSON-LD: no inline application/ld+json script in index.html (CSP-safe)'
  );
  assert(indexHtml.includes('/structured-data.json'), 'JSON-LD: index.html links /structured-data.json');
  const structuredData = JSON.parse(readText('public/structured-data.json'));
  assert(
    structuredData['@context'] === 'https://schema.org' && structuredData['@type'] === 'WebApplication',
    'JSON-LD: /structured-data.json parses with schema.org WebApplication payload'
  );

  // --- Module 5.3: CSP coherence -------------------------------------------
  const vercelConfig = JSON.parse(readText('vercel.json'));
  const prodCsp = vercelConfig.headers
    .flatMap((group) => group.headers)
    .find((header) => header.key === 'Content-Security-Policy')?.value || '';
  assert(prodCsp.includes("connect-src 'self'"), 'CSP: production connect-src is scoped to self');
  assert(
    !prodCsp.includes('localhost') && !prodCsp.includes('127.0.0.1') && !prodCsp.includes('.local'),
    'CSP: production header set contains no localhost/loopback/.local entries'
  );

  const serverSource = readText('server.js');
  assert(
    serverSource.includes('localhost:*') && serverSource.includes('*.local:*'),
    'CSP: dev-only header set in server.js keeps the local-AI connect-src entries'
  );
  assert(
    serverSource.includes('req.socket.remoteAddress') && !serverSource.includes("req.headers['x-forwarded-for']"),
    'Rate limit: server.js keys limiters on the socket peer, never raw x-forwarded-for'
  );

  console.log('[SUCCESS] Phase 5 server & API hardening contracts verified.');
}

run().catch((error) => {
  console.error('[FAIL]', error.message || error);
  process.exit(1);
});
