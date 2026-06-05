# Offline Phase 0/1 Audit

## Non-Regression Rule

Offline hardening must wrap, replace, or degrade network-dependent paths without removing established user-facing functionality. Core guides, checklists, scenarios, shelters, source links, live-feed UI, contact handoff, themes, languages, and saved progress must remain available.

## PR And AI-Assisted Coding Checklist

- No required runtime dependency on external scripts, fonts, images, map tiles, AI APIs, or RSS feeds.
- No removal of current tabs, routes, source links, shelters, checklists, training scenarios, or content modules.
- All offline changes have visible fallback states that explain whether data is live, cached, static, or unavailable.
- `npm run lint` passes.
- `npm run build` passes.
- Browser tested once online, once offline, and once after refresh while offline.

## Phase 1 Offline Validation

- Build with `npm run build`.
- Serve with `npm run preview`.
- Open the app once while online so the PWA shell and runtime feed caches can install.
- Switch browser devtools to offline.
- Refresh `/`, `/#shelters`, `/#library`, and `/#checklists`.
- Confirm shelter search and shelter selection render without remote map tiles.
- Deny geolocation and confirm the nearest-shelter action fails gracefully.
- Allow geolocation and confirm nearest shelters sort by distance.
- Confirm Norwegian news displays live, cached, or static official-source state.
- Confirm official sources display live, cached, or static official-source state.
- Confirm `/api/healthz` can be answered offline by the service worker with `status: "offline-ready"`.

## Banned Phase 1 Runtime Dependencies

- `unpkg`
- `cartocdn`
- `google.com/s2`
- `generativelanguage`
- `gemini`
- Google/Gemini npm SDKs

## Deployment Notes

- Hosted/static PWA mode should not silently require an API server for core navigation, shelters, library, or checklists.
- Live RSS/news feeds are online enhancements only.
- `/api/copilot/analyze` is compatibility-preserved, deterministic-local by default, and may only call user-configured local OpenAI-compatible endpoints.
- Local/LAN preview hosts must not be bypassed by the service worker, so offline testing over `localhost`, `127.0.0.1`, `192.168.*`, and `10.*` remains possible.
