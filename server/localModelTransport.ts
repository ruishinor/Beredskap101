import { lookup } from 'node:dns/promises';
import http from 'node:http';
import https from 'node:https';
import { isIP } from 'node:net';
import { isLocalHttpUrl, isPrivateOrLoopbackIpv4 } from '../src/utils/privateNetwork.ts';

const MAX_RESPONSE_BYTES = 1024 * 1024;
const REQUEST_TIMEOUT_MS = 8000;

export function isAllowedResolvedAddress(address: string): boolean {
  if (isIP(address) === 4) return isPrivateOrLoopbackIpv4(address);
  if (isIP(address) !== 6) return false;
  const normalized = address.toLowerCase();
  if (normalized === '::1') return true;
  if (normalized.startsWith('::ffff:')) return isPrivateOrLoopbackIpv4(normalized.slice(7));
  return /^f[cd][0-9a-f]{0,2}:/.test(normalized) || /^fe[89ab][0-9a-f]?:/.test(normalized);
}

export async function resolveAllowedLocalModelUrl(
  input: string,
  resolve = lookup
): Promise<{ url: URL; address: string } | null> {
  if (!isLocalHttpUrl(input)) return null;
  const url = new URL(input);
  if (url.username || url.password || url.hash || url.search) return null;
  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  let timer: ReturnType<typeof setTimeout> | undefined;
  let addresses: Array<{ address: string }>;
  try {
    addresses = isIP(hostname) ? [{ address: hostname }] : await Promise.race([
      resolve(hostname, { all: true }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Local model DNS timed out')), REQUEST_TIMEOUT_MS);
      }),
    ]);
  } finally { clearTimeout(timer); }
  if (!addresses.length || addresses.some(({ address }) => !isAllowedResolvedAddress(address))) return null;
  return { url, address: addresses[0].address };
}

export async function postLocalModelJson(baseUrl: string, payload: unknown): Promise<unknown | null> {
  const deadlineAt = Date.now() + REQUEST_TIMEOUT_MS;
  const resolved = await resolveAllowedLocalModelUrl(baseUrl);
  if (!resolved) return null;
  const { url, address } = resolved;
  const targetPath = `${url.pathname.replace(/\/$/, '')}/chat/completions`;
  const body = JSON.stringify(payload);
  return new Promise((resolve) => {
    const transport = url.protocol === 'https:' ? https : http;
    const request = transport.request({
      hostname: address,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: targetPath,
      method: 'POST',
      servername: url.hostname.replace(/^\[|\]$/g, ''),
      headers: {
        Host: url.host,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: Math.max(1, deadlineAt - Date.now()),
    }, (response) => {
      // Node's request API does not follow redirects.
      if (response.statusCode !== 200) { response.destroy(); resolve(null); return; }
      let size = 0;
      const chunks: Buffer[] = [];
      response.on('data', (chunk: Buffer) => {
        size += chunk.length;
        if (size > MAX_RESPONSE_BYTES) { request.destroy(); resolve(null); return; }
        chunks.push(chunk);
      });
      response.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
        catch { resolve(null); }
      });
      response.on('error', () => resolve(null));
    });
    const deadline = setTimeout(() => request.destroy(new Error('Local model deadline exceeded')), Math.max(1, deadlineAt - Date.now()));
    request.on('error', () => resolve(null));
    request.on('close', () => clearTimeout(deadline));
    request.end(body);
  });
}
