/// <reference lib="webworker" />

import { cleanupOutdatedCaches, matchPrecache, precacheAndRoute } from 'workbox-precaching';
import { archiveResponse } from './utils/archiveResponse';
import {
  isFreshFeedResponse,
  stampFeedResponse,
} from './utils/feedCache';

declare const self: ServiceWorkerGlobalScope & typeof globalThis & {
  __WB_MANIFEST: Array<string | { url: string; revision: string | null }>;
};

const API_CACHE = 'beredskap101-api-v1';
const RUNTIME_CACHE = 'beredskap101-runtime-v1';
const OFFLINE_API_PATHS = new Set(['/api/norway-news', '/api/source-feeds']);

cleanupOutdatedCaches();

// PMTiles reads byte ranges. Workbox's normal precache response is a full 200,
// so handle archive ranges before registering the precache fetch listener.
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname !== '/maps/norway.pmtiles' ||
      (request.method !== 'GET' && request.method !== 'HEAD')) return;
  event.respondWith((async () => {
    const cached = await matchPrecache('/maps/norway.pmtiles');
    if (!cached) return fetch(request);
    return archiveResponse(request, cached);
  })());
});

precacheAndRoute(self.__WB_MANIFEST);

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

async function networkFirst(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, await stampFeedResponse(response));
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      if (isFreshFeedResponse(cached)) return cached;
      await cache.delete(request);
    }
    throw new Error(`No cached response for ${request.url}`);
  }
}

async function cacheFirst(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(API_CACHE);
      const requests = await cache.keys();
      for (const request of requests) {
        const response = await cache.match(request);
        if (!response || !isFreshFeedResponse(response)) {
          await cache.delete(request);
        }
      }
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname === '/api/healthz') {
    event.respondWith(
      fetch(request).catch(() =>
        jsonResponse({
          status: 'offline-ready',
          timestamp: new Date().toISOString(),
          source: 'service-worker',
        })
      )
    );
    return;
  }

  if (OFFLINE_API_PATHS.has(url.pathname)) {
    event.respondWith(
      networkFirst(request, API_CACHE).catch(() =>
        jsonResponse({
          fetchedAt: new Date().toISOString(),
          items: [],
          sources: [],
          partialFailures: ['offline'],
          source: 'static',
        })
      )
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedIndex = await caches.match('/index.html');
        return cachedIndex || Response.error();
      })
    );
    return;
  }

  if (
    ['script', 'style', 'image', 'font', 'manifest', 'worker'].includes(request.destination) ||
    /\.(js|css|json|svg|png|jpg|jpeg|webp|woff2?|webmanifest)$/i.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE).catch(() => new Response('', { status: 404 })));
  }
});

export {};
