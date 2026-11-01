/**
 * Shared private/loopback network guards (module 5.3).
 *
 * Single source of truth for private-IP parsing — previously duplicated in
 * server.js, server/copilot.ts, and src/utils/localAiSettings.ts. Imported by
 * the client bundle, the local Express server, and serverless handlers, so it
 * must stay dependency-free and runtime-agnostic (no Node APIs).
 */

export function parseIpv4(hostname: string): number[] | null {
  const parts = hostname.split('.');
  if (parts.length !== 4) return null;
  if (parts.some((part) => !/^\d{1,3}$/.test(part))) return null;
  const octets = parts.map((part) => Number(part));
  if (octets.some((octet) => Number.isNaN(octet) || octet < 0 || octet > 255)) return null;
  return octets;
}

export function isPrivateOrLoopbackIpv4(hostname: string): boolean {
  const octets = parseIpv4(hostname);
  if (!octets) return false;
  const [a, b] = octets;
  if (a === 10 || a === 127) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 169 && b === 254) return true;
  return false;
}

/**
 * Accepts localhost, loopback (IPv4/IPv6, with or without WHATWG-URL square
 * brackets), *.local mDNS hostnames, and private/loopback IPv4 ranges.
 */
export function isLocalHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized === '[::1]' ||
    normalized.endsWith('.local') ||
    isPrivateOrLoopbackIpv4(normalized)
  );
}

/**
 * True only for http(s) URLs whose host is local/private. Used to gate the
 * optional local-AI endpoint: cloud API hosts (e.g. api.openai.com) and
 * non-http(s) schemes are rejected.
 */
export function isLocalHttpUrl(input: string): boolean {
  try {
    const parsed = new URL(input);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    return isLocalHostname(parsed.hostname);
  } catch {
    return false;
  }
}
