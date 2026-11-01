import { expect, test } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { once } from 'node:events';

test('keeps an update waiting, then moves both open tabs to the new cached version', async ({ browser }) => {
  let version = 'A';
  const root = resolve('dist');
  const mime: Record<string, string> = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml' };
  // Exercise the actual built worker and app, with two index revisions served
  // from an ephemeral local origin. No source/dist files are rewritten.
  const server = createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url || '/', 'http://localhost').pathname;
      if (pathname.startsWith('/api/')) {
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(pathname === '/api/healthz' ? { status: 'ok', timestamp: new Date().toISOString() } : { items: [], sources: [], partialFailures: [] }));
        return;
      }
      const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
      if (!file.startsWith(root + sep)) { response.writeHead(403); response.end(); return; }
      let content: Buffer | string = await readFile(file);
      if (pathname === '/sw.js') {
        content = content.toString().replace(/\{"revision":"[^"]+","url":"index\.html"\}/,
          JSON.stringify({ revision: `audit-${version}`, url: 'index.html' }));
        content += `\n// audit-version-${version}\n`;
      } else if (file === resolve(root, 'index.html')) {
        content = content.toString().replace('</head>', `<meta name="audit-release" content="${version}"></head>`);
      }
      response.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream');
      response.setHeader('Cache-Control', 'no-store');
      response.setHeader('Content-Length', Buffer.byteLength(content));
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch { response.writeHead(404); response.end(); }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Missing lifecycle server port');
  const url = `http://127.0.0.1:${address.port}`;
  const context = await browser.newContext({ serviceWorkers: 'allow', locale: 'en-US' });
  try {
    const first = await context.newPage();
    await first.goto(`${url}/#checklists`);
    await first.evaluate(() => navigator.serviceWorker.ready);
    await first.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    await first.evaluate(() => localStorage.setItem('beredskap_checklists_checked_ids', '["audit-preserved"]'));
    const second = await context.newPage();
    await second.goto(`${url}/#checklists`);
    await second.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    version = 'B';
    await first.evaluate(async () => { await (await navigator.serviceWorker.getRegistration())?.update(); });
    await first.waitForFunction(async () => Boolean((await navigator.serviceWorker.getRegistration())?.waiting));
    await expect(first.getByRole('button', { name: 'Update now', exact: true })).toBeVisible();
    await expect(first.locator('meta[name="audit-release"]')).toHaveAttribute('content', 'A');
    await expect(second.locator('meta[name="audit-release"]')).toHaveAttribute('content', 'A');
    await first.getByRole('button', { name: 'Update now', exact: true }).click();
    await expect(first.locator('meta[name="audit-release"]')).toHaveAttribute('content', 'B');
    await expect(second.locator('meta[name="audit-release"]')).toHaveAttribute('content', 'B');
    await context.setOffline(true);
    await second.reload();
    await expect(second.locator('meta[name="audit-release"]')).toHaveAttribute('content', 'B');
    expect(await second.evaluate(() => localStorage.getItem('beredskap_checklists_checked_ids'))).toBe('["audit-preserved"]');
  } finally {
    await context.close();
    const closed = new Promise<void>((done, reject) => server.close((error) => error ? reject(error) : done()));
    server.closeAllConnections();
    await closed;
  }
});
