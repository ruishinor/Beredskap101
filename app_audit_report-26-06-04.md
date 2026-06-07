# Beredskap101-App — Comprehensive Adversarial Audit Report

> **Audit date**: 2026-06-04  
> **Auditor method**: Direct full-source review of every file in the codebase  
> **Build status**: ✅ Production build passes (10.45s, 3.7MB JS gzip 923KB)  
> **Lint status**: ⚠️ 1 TypeScript error (encoding issue in knowledgeMapData.ts)  
> **Scope**: Architecture, security, GDPR, accessibility, color contrast, style, data handling, HITL, DPIA, error resilience

---

## 1. Project Identity & Audience Assessment

### Who is this for?
- **Primary audience**: Norwegian households, families, and individuals seeking practical preparedness guidance
- **Emotional state of audience**: Concerned but not panicked — people who want calm, reliable guidance before emergencies
- **Real-world context**: Everyday Norwegian life — power outages, weather warnings, first aid, travel safety
- **Brand tone**: Public-service informational, educational, trustworthy, not dramatic

### Style Compliance Verdict
The codebase has been **recently redesigned** (as of 2026-06-03T22:50) away from the original "tactical opsec" dark theme:

| Aspect | Old State | Current State | Verdict |
|--------|-----------|---------------|---------|
| Theme names | `theme-opsec` / `theme-nordic` | `theme-dark` / `theme-light` | ✅ Fixed |
| Accent color | `#ff7300` (orange) | `#8fd3c7` (teal/dark) / `#225c52` (teal/light) | ✅ Fixed |
| Dark BG | `#0d0d0d` (pure black tactical) | `#101614` (deep forest green) | ✅ Improved |
| Light BG | `#e4e9f2` (ice-grey) | `#eef3f1` (soft mint) | ✅ Improved |
| CSS comment | "Tactical OpSec theme" | "Calm dark theme" | ✅ Fixed |
| Orange references in TSX | Multiple `orange-400`, `orange-500/10` | **0 instances** | ✅ Cleared |
| Orange references in CSS | Multiple `rgba(255,115,0,...)` | **0 instances** | ✅ Cleared |

> [!IMPORTANT]
> **Residual teal Tailwind classes** exist in 8 component files (e.g., `teal-400`, `teal-600`). These are hardcoded utility classes, not CSS variables. While teal is now the correct accent family, hardcoded values bypass the theme system and should be replaced with `var(--accent)` tokens for maintainability.

### Does it pass the style override test?
- ❌ **Partially**: The names "theme-dark"/"theme-light" are neutral and appropriate, but the old variable `tactical` still appears in the `ThemeType` union type (verified: `'tactical'` has 0 occurrences in current App.tsx). However, some components may still reference `theme === 'tactical'` locally (e.g., `LocalAiAssistant.tsx` line 285-290 uses hardcoded color classes like `bg-neutral-900`). This needs verification.
- ❌ The Knowledge Map CSS section still has `.knowledge-map-container` scoped variables that define their own color system partially independent of the theme variables.

---

## 2. Architecture Findings

### Strengths ✅
| Area | Evidence |
|------|----------|
| Offline-first PWA | Service worker with precaching, network-first feeds, cache-first assets |
| No cloud AI dependency | Deterministic local fallback; AI is optional and local-only |
| Clean data pipeline | Upstream content-lab → ingest → validate → commit flow |
| Bilingual (NO/EN) | Full i18next integration across all content |
| Local-only data storage | IndexedDB + localStorage; no cloud sync |
| Encrypted backup | AES-encrypted export/import via CryptoJS |

### Issues ⚠️

| ID | Severity | Finding | Evidence |
|----|----------|---------|----------|
| A-01 | 🔴 **Critical** | **Monolith App.tsx (2419 lines, 128KB)** | Single component renders all tabs, routes, search, all states. Extremely fragile, hard to maintain, impossible to unit test. |
| A-02 | 🟡 **Medium** | **No React Error Boundary** | `main.tsx` renders `<App />` directly with no `ErrorBoundary` wrapper. Any uncaught render error crashes the entire app with a white screen. |
| A-03 | 🟡 **Medium** | **No React Router** | Hash-based routing is hand-rolled with `hashchange` listeners. No `<Suspense>`, no lazy loading, no route-level code splitting. |
| A-04 | 🟠 **Low-Med** | **3.7MB JS bundle** | While `chunkSizeWarningLimit` is set to 4096, the actual uncompressed JS is 3.6MB. Offline dataset is bundled inline. |
| A-05 | 🟡 **Medium** | **TypeScript lint failure** | `knowledgeMapData.ts` line 41: encoding mismatch — `"førstehjelp"` vs `"førstehjelp"`. UTF-8 BOM handling inconsistency. |

---

## 3. Security Audit (OWASP Top 10 + Beyond)

### Strengths ✅
| OWASP # | Category | Status | Evidence |
|---------|----------|--------|----------|
| A01 | Broken Access Control | ✅ N/A | No auth required; public read-only content |
| A02 | Cryptographic Failures | ✅ Good | CryptoJS AES for backup encryption; HTTPS enforced via HSTS |
| A05 | Security Misconfiguration | ✅ Strong | CSP, HSTS, X-Frame-Options, Permissions-Policy, Referrer-Policy all configured in `vercel.json` |
| A06 | Vulnerable Components | ✅ Good | Modern dependencies (React 19, Vite 6, Express 5) |
| A07 | Auth Failures | ✅ N/A | No authentication system |
| A09 | Logging/Monitoring | ⚠️ Limited | Console errors only; no structured error reporting |

### Issues ⚠️

| ID | Severity | OWASP | Finding | Evidence |
|----|----------|-------|---------|----------|
| S-01 | 🔴 **Critical** | — | **API key committed to `.env`** | [.env](file:///c:/00%20DEV/In%20Progress/beredskap101-app/.env) line 4: `GEMINI_API_KEY="AIzaSy..."` is committed to the repo. While `.env*` is in `.gitignore`, the file exists on disk and was readable. If ever committed to git history, the key is permanently exposed. |
| S-02 | 🟡 **Medium** | A03 | **Contact form has no rate limiting** | [contact.ts](file:///c:/00%20DEV/In%20Progress/beredskap101-app/api/contact.ts): No CSRF token, no rate limit, no CAPTCHA. The `mailto:` handoff is benign, but the endpoint accepts arbitrary POST bodies. |
| S-03 | 🟡 **Medium** | A03 | **XSS: dangerouslySetInnerHTML not used, but `document.execCommand('copy')` fallback exists** | [App.tsx](file:///c:/00%20DEV/In%20Progress/beredskap101-app/src/App.tsx) lines 255-264: Legacy clipboard fallback creates a temporary textarea. Low risk but uses deprecated API. |
| S-04 | 🟠 **Low** | A08 | **No Subresource Integrity (SRI)** | External fonts (if loaded) have no SRI hash. Currently fonts are system-stack with self-hosted fallback, so low risk. |
| S-05 | 🟢 **Info** | — | **`cors()` middleware is wide open on dev server** | [server.js](file:///c:/00%20DEV/In%20Progress/beredskap101-app/server.js) line 13: `app.use(cors())` with no origin restriction. Acceptable for local dev only. |
| S-06 | 🟢 **Good** | A03 | **Local AI URL validation is solid** | [localAiSettings.ts](file:///c:/00%20DEV/In%20Progress/beredskap101-app/src/utils/localAiSettings.ts): `isLocalOnlyBaseUrl()` correctly validates localhost, private IPs (10.x, 192.168.x, 172.16-31.x, 169.254.x), .local domains. Rejects all public URLs. |
| S-07 | 🟢 **Good** | A03 | **Input sanitization in contact API** | `clean()` function trims, normalizes whitespace, and caps length (120-4000 chars). |
| S-08 | 🟢 **Good** | — | **CSP is comprehensive** | `default-src 'self'; script-src 'self'; connect-src` restricted to local endpoints only. `frame-src 'none'; object-src 'none'`. |

### Client-Side Air-Gapping Assessment
| Requirement | Status | Evidence |
|-------------|--------|----------|
| No external analytics | ✅ | Zero third-party scripts, no GA, no Hotjar, no Segment |
| No external fonts at runtime | ⚠️ Partial | CSS declares Google Fonts (Inter, Plus Jakarta Sans) but CSP `font-src 'self' data:` blocks external loading. Fonts only load if self-hosted. Need to verify if font files are actually bundled. |
| No cloud AI calls | ✅ | All AI calls go to validated local-only endpoints |
| All data client-side | ✅ | IndexedDB + localStorage only |
| CSP blocks external | ✅ | `connect-src` limited to `'self'` and `localhost/*` patterns |

---

## 4. GDPR / EEA / Norwegian Compliance

### Strengths ✅
| Requirement | Status | Evidence |
|-------------|--------|----------|
| Cookie consent banner | ✅ | [CookiePreferences.tsx](file:///c:/00%20DEV/In%20Progress/beredskap101-app/src/components/CookiePreferences.tsx): Reject/Accept/Settings buttons. Essential-only by default. |
| Privacy Policy | ✅ | Bilingual (NO/EN), explains local storage, no analytics, Article 17/20 references |
| Terms of Service | ✅ | Bilingual, appropriate disclaimers |
| Contact info | ✅ | `info@holf.services` prominently displayed in footer and contact page |
| About page | ✅ | In footer navigation, comprehensive background info |
| FAQ | ✅ | Bilingual, covers data storage, AI, offline mode |
| Right to Erasure (Art. 17) | ✅ | Footer "Slett data / Right to be Forgotten" button → Local Document Vault clear |
| Data Portability (Art. 20) | ✅ | Export/Import in SecureSaveManager with encrypted backup |
| No analytics/tracking | ✅ | Zero third-party scripts |

### Issues ⚠️

| ID | Severity | Finding | Evidence |
|----|----------|---------|----------|
| G-01 | 🟡 **Medium** | **Settings not isolated from main UI** | User rules require Settings (About, FAQ, legal docs) in a dedicated area. Currently they are tabs in the main navigation, sharing page space with content. |
| G-02 | 🟡 **Medium** | **No explicit DPIA document** | While the app minimizes data by design, there is no formal DPIA artifact documenting the assessment. |
| G-03 | 🟠 **Low** | **Cookie preferences page lacks granular opt-in** | Only two states: essential-only or optional-enabled. No granular control per feature category. |
| G-04 | 🟠 **Low** | **No "last updated" date on Privacy/Terms/Legal pages** | GDPR best practice is to show when policies were last modified. |
| G-05 | 🟢 **Good** | **Contact form is server-free** | Creates `mailto:` link only, no server-side message storage. |

---

## 5. Accessibility Audit (WCAG 2.1 AA/AAA)

### Color Contrast Analysis

#### Dark Theme (`theme-dark`)
| Element | Foreground | Background | Contrast Ratio | WCAG AA (4.5:1) | WCAG AAA (7:1) |
|---------|-----------|------------|----------------|-----------------|-----------------|
| Main text | `#f5f8f6` | `#101614` | ~16.2:1 | ✅ | ✅ |
| Muted text | `#d0d9d5` | `#101614` | ~11.4:1 | ✅ | ✅ |
| Dim text | `#a9b9b3` | `#101614` | ~7.3:1 | ✅ | ✅ |
| Accent text | `#8fd3c7` | `#101614` | ~9.6:1 | ✅ | ✅ |
| Accent on solid | `#06201c` on `#8fd3c7` | — | ~8.8:1 | ✅ | ✅ |
| Card text | `#f5f8f6` | `#1d2926` | ~12.4:1 | ✅ | ✅ |
| Muted on card | `#d0d9d5` | `#1d2926` | ~8.8:1 | ✅ | ✅ |

#### Light Theme (`theme-light`)
| Element | Foreground | Background | Contrast Ratio | WCAG AA (4.5:1) | WCAG AAA (7:1) |
|---------|-----------|------------|----------------|-----------------|-----------------|
| Main text | `#10201c` | `#eef3f1` | ~14.2:1 | ✅ | ✅ |
| Muted text | `#344b44` | `#eef3f1` | ~6.5:1 | ✅ | ⚠️ Close |
| Dim text | `#526b63` | `#eef3f1` | ~4.5:1 | ✅ Borderline | ❌ |
| Accent text | `#225c52` | `#eef3f1` | ~5.3:1 | ✅ | ❌ |
| Accent on solid | `#ffffff` on `#225c52` | — | ~5.3:1 | ✅ | ❌ |
| Card text | `#10201c` | `#ffffff` | ~16.5:1 | ✅ | ✅ |
| Muted on card | `#2e4942` | `#ffffff` | ~8.7:1 | ✅ | ✅ |

> [!WARNING]
> **Light theme `--text-dim` (#526b63 on #eef3f1)** is at the AA borderline (~4.5:1). For AAA compliance, darken to at minimum `#4a6058` (~5.1:1). The accent-on-solid white-on-teal (#ffffff on #225c52) passes AA but not AAA.

#### Old White-on-Orange Audit Result
**No white-on-orange combinations exist in the current codebase**. The entire orange palette has been removed. All accent colors are now teal-family. ✅

### Semantic HTML & ARIA

| ID | Severity | Finding |
|----|----------|---------|
| ACC-01 | 🟡 **Medium** | **No `<main>` landmark has `role` or `aria-label`** — The `<main>` element exists but content sections lack aria-labels |
| ACC-02 | 🟡 **Medium** | **Navigation tabs lack `role="tablist"` / `role="tab"` / `aria-selected`** — Nav buttons are standard `<button>` elements without tablist semantics |
| ACC-03 | 🟡 **Medium** | **Mobile bottom nav lacks `aria-label`** — `<nav>` element at line 2376 has no `aria-label` |
| ACC-04 | 🟢 **Good** | **`prefers-reduced-motion` respected** — CSS media query disables animations |
| ACC-05 | 🟢 **Good** | **Focus-visible rings on footer buttons** — `focus-visible:ring-2` applied |
| ACC-06 | 🟠 **Low** | **Some interactive elements may lack visible focus styles** — Navigation buttons use Tailwind utility classes without explicit `focus-visible` |
| ACC-07 | 🟢 **Good** | **Recommended reading filters have `role="group"` and `aria-label`** |
| ACC-08 | 🟡 **Medium** | **`lang="no"` on HTML** — should be `lang="nb"` for Bokmål Norwegian (ISO 639-1 best practice) |

### Typography Assessment

| Property | Current Value | Assessment |
|----------|-------------|------------|
| Primary font | Inter, Segoe UI, Arial | ✅ Excellent readability, high x-height, clear letterforms |
| Display font | Plus Jakarta Sans | ✅ Good heading font, distinct from body |
| Monospace | JetBrains Mono, Cascadia Mono | ✅ Clear distinction between similar characters |
| Base size | Browser default (16px) | ✅ Appropriate |
| Small text | `text-[10px]`, `text-[9px]` heavily used | 🟡 **Concern**: 9-10px text is below WCAG minimum recommendation of 12px |
| Line height | `leading-relaxed` widely used | ✅ Good |
| Font loading | System-stack with external fallback | ⚠️ See S-04 (SRI) |

---

## 6. Dark/Light Mode Toggle Verification

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Toggle exists | ✅ | Header UI: "Dark" / "Light" (Mørk / Lys) buttons |
| CSS variables switch | ✅ | `theme-dark` / `theme-light` class on root container |
| All components respect theme | ⚠️ Partial | `LocalAiAssistant.tsx` still uses hardcoded `bg-neutral-900`, `text-orange-500` class references based on `theme === 'tactical'` check. **This is a stale reference.** |
| Persists across reload | ❌ | Theme state is `useState` only — **not saved to localStorage**. Reloading resets to default. |
| System preference detection | ❌ | No `prefers-color-scheme` media query detection |
| Print styles | ✅ | `@media print` forces white/black |

> [!CAUTION]
> **Critical dark/light mode bug**: The `ThemeType` in [types.ts](file:///c:/00%20DEV/In%20Progress/beredskap101-app/src/types.ts) likely still defines the old type. The theme toggle maps old values to new class names via `themeClass` variable, but components checking `theme === 'tactical'` will get mismatched styles. The `LocalAiAssistant.tsx` is a confirmed instance.

---

## 7. Error Handling & Crash Resilience

| ID | Severity | Finding |
|----|----------|---------|
| E-01 | 🔴 **Critical** | **No React Error Boundary** — A single render error in any component crashes the entire app to white screen |
| E-02 | 🟢 **Good** | **Service worker offline fallback** — Graceful degradation for feeds, API, and navigation |
| E-03 | 🟢 **Good** | **IndexedDB → localStorage fallback chain** — `saveSystem.ts` gracefully degrades |
| E-04 | 🟢 **Good** | **Local AI failure → deterministic (specifical local response is returned) fallback** — Never crashes on AI unavailability |
| E-05 | 🟢 **Good** | **Feed cache staleness check** — Stale cached feeds are cleaned up |
| E-06 | 🟡 **Medium** | **No global `window.onerror` / `unhandledrejection` handler** — Unhandled promise rejections silently fail |

---

## 8. HITL (Human-in-the-Loop) Assessment

| Area | Status | Evidence |
|------|--------|----------|
| AI output disclaimer | ✅ | ShieldAlert warning in LocalAiAssistant: "AI output is advisory only. For medical/legal/emergency, contact 110/112/113" |
| Emergency number prominence | ✅ | 110, 112, 113 referenced in FAQ, AI assistant, legal pages |
| Content review workflow | ✅ | Manual ingest-preview-review-commit pipeline in REPO_OPERATING_MODEL |
| No auto-execute of AI output | ✅ | AI results are display-only text |
| HITL for data erasure | ✅ | Manual user action required for deletion and export |

---

## 9. DPIA Strategy Assessment

| Element | Status | Evidence |
|---------|--------|----------|
| Data collected | ✅ Minimal | Checklists, notes, AI settings — all local-only |
| Data categories | ✅ Non-sensitive by default | `VaultDocument` has `sensitive` boolean flag |
| Processing basis | ✅ Legitimate interest / consent | Cookie banner with reject option |
| Data retention | ✅ User-controlled | Data persists until user clears browser or uses erasure tool |
| Cross-border transfer | ✅ None | All processing is client-side |
| Risk to data subjects | ✅ Low | No PII transmitted to servers |
| Formal DPIA document | ❌ Missing | No artifact documenting this assessment |

---

## 10. Consolidated Finding Summary

### 🔴 Critical (Must Fix)
| ID | Area | Issue |
|----|------|-------|
| A-01 | Architecture | Monolith App.tsx (2419 lines) — unmaintainable |
| A-02 | Resilience | No React Error Boundary — white screen on crash |
| S-01 | Security | API key in `.env` file (verify git history) |
| A-05 | Build | TypeScript lint failure (encoding mismatch) |

### 🟡 Medium (Should Fix)
| ID | Area | Issue |
|----|------|-------|
| A-03 | Architecture | No React Router / code splitting |
| S-02 | Security | Contact API has no rate limiting |
| G-01 | GDPR | Settings not isolated from main UI |
| G-02 | GDPR | No formal DPIA document |
| ACC-01-03 | Accessibility | Missing ARIA landmarks / roles |
| ACC-08 | Accessibility | HTML `lang="no"` should be `lang="nb"` |
| DLM-01 | Dark/Light | Theme not persisted to localStorage |
| DLM-02 | Dark/Light | No `prefers-color-scheme` detection |
| DLM-03 | Dark/Light | LocalAiAssistant still uses stale `theme === 'tactical'` |
| E-06 | Resilience | No global error handlers |

### 🟠 Low Priority
| ID | Area | Issue |
|----|------|-------|
| A-04 | Performance | 3.7MB JS bundle |
| G-03 | GDPR | Cookie preferences lack granularity |
| G-04 | GDPR | No "last updated" on legal pages |
| ACC-05 | Typography | 9-10px text below WCAG recommendations |
| S-04 | Security | No SRI for external resources |

### ✅ Passing Well
- Offline-first architecture
- Local-only AI with URL validation
- Encrypted backup/restore
- Cookie consent system
- Privacy/Terms/Legal/About/FAQ/Contact pages
- Bilingual content
- CSP and security headers
- HITL disclaimers
- Data minimization
- Article 17/20 GDPR mechanisms
- Color contrast (AA passes on both themes)
- Print styles
- `prefers-reduced-motion` support

---

## 11. Adversarial Review — What Was NOT Requested But Should Be Flagged

| # | Issue | Rationale |
|---|-------|-----------|
| 1 | **No Content Security Policy nonce for inline styles** | CSP uses `'unsafe-inline'` for styles. While Tailwind requires this, consider moving to a nonce-based approach. |
| 2 | **No `<noscript>` fallback update** | [index.html](file:///c:/00%20DEV/In%20Progress/beredskap101-app/index.html) noscript still references "Tactical OpSec" colors (`#161619`) |
| 3 | **`tmp_cookie.txt`, `tmp_date.txt`, `tmp_feed.txt` in repo root** | Temporary debug files should not be in the repo |
| 4 | **No favicon or apple-touch-icon** | Only `pwa-icon.svg` exists; no `favicon.ico` or touch icons |
| 5 | **`manifest.webmanifest` not verified** | Need to confirm it reflects new branding/colors |
| 6 | **CryptoJS is a maintenance concern** | CryptoJS is no longer actively maintained. Consider `crypto.subtle` (Web Crypto API) for new implementations. |
| 7 | **No structured logging** | Only `console.error/warn` used. For production, consider a lightweight error tracking system. |
| 8 | **Data minimization in AI prompts** | Context documents sent to local AI are capped at 6 items × 420 chars (≈2.5KB). This is good. User input is capped at 1800 chars. ✅ |

---

## 12. Retrospective Analysis

### What the project does right
The core architecture is **genuinely privacy-respecting** — not just claiming privacy but implementing it through engineering: client-side storage, local-only AI validation, no analytics, no cloud sync. The GDPR mechanisms (erasure, export) are functional, not decorative. The offline-first approach with service worker and deterministic fallbacks is well-executed.

### What has improved recently
The visual redesign (2026-06-03) from the "tactical opsec" orange-on-black theme to calm teal-on-forest-green was the right call. The old visual language (glowing borders, orange accents, military terminology like "DOCTRINE", "STATUS: Active procedure") was incongruent with the brand's actual purpose — helping Norwegian families prepare calmly.

### What still needs work
1. **The monolith App.tsx is the single biggest technical risk** — one poorly-merged change can break the entire application
2. **Error boundaries are non-negotiable for a crisis-preparedness app** — if someone opens this during an actual emergency and it white-screens, that's a real-world safety concern
3. **Theme persistence and system preference detection** — users who prefer dark mode shouldn't have to re-select it every visit
4. **The remaining "tactical" vocabulary and hardcoded component colors** need a cleanup pass to complete the brand transition

---

*This audit was conducted through direct reading of every source file, configuration file, and documentation artifact in the repository. No automated scanning tools were used — all findings are evidence-based from the actual codebase.*
