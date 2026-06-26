# Beredskap101 Functional UI/UX Redesign Overview

Generated: 2026-06-25  
Audience: UX designer, product designer, information architect, product owner  
Scope: Functional requirements and information architecture for a complete UI/UX redesign  
Excluded scope: Visual style, aesthetic direction, page composition, colors, typography, brand styling, animation style, and current presentation constraints

## 1. Purpose

Beredskap101 is a local-first preparedness application for practical household resilience, first aid, outdoor decisions, personal safety, digital privacy, travel resilience, public shelter lookup, local document storage, local backup, local search, and optional local AI assistance.

The redesign objective is to rebuild the user experience around task clarity and information structure, without inheriting the current interface's visual choices. The designer should treat this document as a functional map, not as a visual brief.

The product should function as a working preparedness instrument. Its core value is helping users find, understand, save, practice, and maintain preparedness information before, during, and after disruptive events.

## 2. Product Positioning

Beredskap101 should be understood as:

- A local-first preparedness reference.
- A bilingual knowledge and action system.
- A personal readiness workspace.
- A crisis decision-support tool.
- A privacy-preserving offline PWA.
- A practical training and maintenance system.

Beredskap101 should not be treated as:

- A marketing site.
- A generic content blog.
- A social platform.
- A cloud-synced personal data product.
- A replacement for emergency services.
- A live routing or authoritative navigation service.
- A medical, legal, or security authority.

## 3. Primary Audiences

### 3.1 Ordinary Household User

Purpose: Build and maintain readiness for disruptions such as power loss, water loss, severe weather, travel disruption, or communication failure.

Likely goals:

- Understand what to prepare first.
- Build a household readiness list.
- Track checklist progress.
- Store essential local notes or documents.
- Export or restore data across devices.
- Use the app offline when networks fail.

Likely frustrations:

- Too much abstract advice.
- Difficulty knowing what applies to their situation.
- Losing local data when changing devices.
- Not knowing whether a feature works offline.
- Confusion between official advice, app-generated advice, and personal notes.

### 3.2 High-Intent Preparedness User

Purpose: Search specific topics and act quickly.

Likely goals:

- Search for a task, risk, procedure, checklist item, or official source.
- Jump directly to a relevant guide, checklist, shelter, or reference asset.
- Print or export information for offline use.
- Compare official source feeds and cached information.

Likely frustrations:

- Search results that are too broad.
- Unclear source provenance.
- Difficulty distinguishing static guidance from live or cached information.

### 3.3 Traveler, Outdoor User, or Mobile User

Purpose: Use compact guidance in unstable environments.

Likely goals:

- Prepare for travel risk, route risk, document loss, scams, weather hazards, or signal loss.
- Use offline map/shelter information.
- Store backup travel documents or notes locally.
- Access checklists and decision trees without reliable connectivity.

Likely frustrations:

- Poor performance on mobile.
- Too much reading before action.
- Network-dependent maps.
- Unclear emergency caveats.

### 3.4 Privacy-Conscious User

Purpose: Use preparedness tooling without tracking, analytics, cloud storage, or cloud AI dependency.

Likely goals:

- Keep checklists, documents, attachments, notes, and AI settings on the device.
- Use optional local AI only through a local endpoint.
- Export, import, or erase local app data.
- Understand data boundaries clearly.

Likely frustrations:

- Ambiguous data storage claims.
- Cloud fallbacks hidden inside features.
- Unclear model endpoint behavior.
- No easy way to delete local data.

## 4. Core Product Requirements

### 4.1 Local-First Operation

The app must remain useful without network access after initial installation or caching.

Functional requirements:

- Core content must be readable offline.
- Checklist state must be saved locally.
- Document vault data must be saved locally.
- Local search must run without API calls.
- Emergency flowcharts and scenarios must work offline.
- Shelter data list must remain available offline.
- Feed modules must degrade to cached or static fallback states.
- Health status should reflect online, degraded, or offline operation.
- Optional online features must never block offline-critical workflows.

### 4.2 Bilingual Operation

The app supports English and Norwegian.

Functional requirements:

- User can switch language manually.
- Language preference persists locally.
- Core content appears in the selected language where translations exist.
- Search should support both English and Norwegian content.
- Deep links should not break when language changes.
- Missing or partial translations should degrade predictably.

### 4.3 User-Owned Local Data

The app stores user data in the browser, not in a central account.

Data categories:

- Checklist completion.
- Knowledge topic completion.
- Reference asset checklist state.
- Reference asset reflection notes.
- Document vault entries.
- Vault attachments.
- Local AI settings.
- Cookie preferences.
- Theme preference.
- Language preference.
- Feed snapshots.
- Map layer preference.
- PMTiles map package configuration.

Functional requirements:

- User must be able to export relevant local data.
- User must be able to import compatible local data.
- User must be able to erase app-owned local data.
- Sensitive data must be clearly distinguished from public reference content.
- The system must not imply cloud backup.

### 4.4 Source Transparency

Preparedness content must make its origin and status understandable.

Functional requirements:

- Official source links must be accessible.
- Live feeds must indicate whether data is live, cached, or static fallback.
- Reference assets must expose source metadata where available.
- Map shelter data must disclose its source and limitations.
- AI outputs must be labeled by provider type: deterministic local fallback or local model response.

### 4.5 Emergency Caveats

The app must repeatedly distinguish guidance from emergency authority.

Functional requirements:

- Acute medical, fire, police, or life-safety cases must direct users to 110, 112, or 113 in Norway.
- AI assistance must be advisory only.
- Map information must not be presented as authoritative routing.
- Checklists must not imply completeness for every household or risk profile.

## 5. Information Architecture

The IA should be organized around what users need to do, not around the current implementation names.

### 5.1 Primary Destinations

#### Preparedness Knowledge

Purpose: Give users a structured entry point into the preparedness knowledge base.

Includes:

- Six core knowledge pillars.
- Manual topics within each pillar.
- Topic detail pages with context, principle, action sequence, warnings, and related topics.
- Topic completion state.
- Related reference modules.
- Local search entry point.
- Official sources and monitoring feeds.

Primary user question: "What do I need to know or do about this preparedness topic?"

#### Reference Library

Purpose: Provide deeper, structured reference assets and editorial guidance.

Includes:

- Featured operational guides.
- Editorial articles.
- Extended reference modules.
- Offline content packs.
- Filtering by pillar, pack, and search query.
- Asset detail views with multiple functional sub-sections.

Primary user question: "Where can I find a deeper explanation, checklist, test protocol, or learning module?"

#### Decision Practice

Purpose: Help users rehearse responses before real stress.

Includes:

- Interactive tabletop scenarios.
- Emergency flowcharts.
- Choice feedback.
- Score or readiness evaluation.
- Reset and retry paths.

Primary user question: "How should I decide under pressure?"

#### Readiness Tools

Purpose: Let users build, track, back up, and restore personal preparedness state.

Includes:

- Standard checklists.
- Custom checklist generator.
- Encrypted backup export and restore.
- QR backup export/import.
- Local document vault.
- Optional local AI assistant.

Primary user question: "What have I prepared, what still needs work, and how do I keep my local data portable?"

#### Shelter Finder

Purpose: Help users inspect registered public shelter records and orient around them.

Includes:

- Searchable shelter list.
- Map display with selectable map layer mode.
- Optional geolocation.
- Nearest shelter sorting.
- Selected shelter details.
- External map handoff.
- Source links and limitation notices.

Primary user question: "What public shelter records exist near a place or near me?"

#### Support and Data Management

Purpose: Centralize product information, privacy boundaries, data controls, contact, FAQ, and settings.

Includes:

- About.
- FAQ.
- Appearance preference.
- Contact handoff.
- Privacy.
- Terms.
- Legal notice.
- Cookie choices.
- Data export/import/erasure.
- Accessibility information.

Primary user question: "How does this app work, what does it store, and how do I manage it?"

### 5.2 Secondary Destinations

#### Glossary

Purpose: Explain preparedness terms in both supported languages.

Requirements:

- Search/filter terms.
- Show term and explanation.
- Preserve language-specific labels.

#### Recommended Reading

Purpose: Offer external reading recommendations grouped by category.

Requirements:

- Filter by category.
- Link to external sources when available.
- Support series entries.

#### Official Sources

Purpose: Expose public-source links and optional feed items.

Requirements:

- Show bundled source registry offline.
- Fetch feed items online when available.
- Preserve cached feed snapshot if online fetch fails.
- Allow print and JSON export.

#### Norwegian Monitoring Feed

Purpose: Show Norwegian news, weather alerts, police log items, and official preparedness source items.

Requirements:

- Fetch live data when available.
- Use cache fallback.
- Use static official source fallback.
- Allow user to select visible count.
- Allow print and JSON export.

## 6. Content Model

### 6.1 Knowledge Pillar

Purpose: Group related preparedness topics.

Fields:

- ID.
- Title.
- English title.
- Icon identifier.
- Short description.
- Philosophy or framing statement.
- Topic list.

Current pillar groups:

- First Aid and Trauma Care.
- Wilderness Survival.
- Personal Safety.
- Household Preparedness.
- Digital Privacy.
- Travel Security.

### 6.2 Manual Topic

Purpose: Provide concise operational guidance.

Fields:

- ID.
- Title.
- Short summary.
- Situation context.
- Core principle.
- Procedure steps.
- Warnings.
- Related topics.
- Optional sensitive flag.

Functional needs:

- Select topic from a pillar.
- Mark topic as completed.
- Navigate back to pillar or all pillars.
- Link to related reference modules.
- Preserve deep-link state.

### 6.3 Checklist Group and Item

Purpose: Track preparedness tasks.

Group fields:

- ID.
- Title.
- Icon identifier.
- Item list.

Item fields:

- ID.
- Text.
- Checked state.
- Category.

Current checklist groups:

- 72-hour basic preparedness.
- 7-day advanced preparedness.
- Urban first aid kit.
- International travel preparedness.
- Monthly security and privacy audit.

Functional needs:

- Switch between groups.
- Check and uncheck items.
- Reset active list.
- Persist checked state locally.
- Show completion progress.

### 6.4 Generated Checklist

Purpose: Create a household-specific readiness checklist from user inputs.

Inputs:

- Household size.
- Preparedness duration.
- Environment: urban, rural, or subzero.
- Special needs: pets, infants, medication.

Outputs:

- Generated checklist title.
- Generated checklist items.
- Item categories.
- Calculated quantities such as water and food.
- Environment-specific warnings when applicable.

Functional needs:

- Generate list.
- Check generated items.
- Persist generated item completion in the shared progress store.
- Print list.

### 6.5 Scenario

Purpose: Simulate decisions and consequences.

Fields:

- ID.
- Title.
- Description.
- Pillar.
- Initial step ID.
- Step map.
- Success outcome.
- Failure outcome.

Step fields:

- Prompt text.
- Choice list.
- Next step ID.
- Feedback.
- Score change.

Current scenario set:

- Urban commute incident.
- Burner phone setup and use.

Functional needs:

- Select scenario.
- Choose response.
- Receive feedback.
- Track score.
- Complete simulation.
- Show outcome.
- Retry or move to next scenario.

### 6.6 Flowchart

Purpose: Support quick decision paths.

Fields:

- ID.
- Title.
- Description.
- Initial node ID.
- Node map.

Node fields:

- Prompt text.
- Options.
- Next node ID.
- Optional correctness or info metadata.

Current flowchart set:

- Emergency first aid.
- Evacuation versus sheltering in place.
- Scam pattern check.

Functional needs:

- Select flowchart.
- Move through decision nodes.
- Move back.
- Reset.
- Display terminal action.
- Include safety caveats.

### 6.7 Processed Reference Asset

Purpose: Provide deeper structured material for specific preparedness topics.

Fields:

- ID.
- Title.
- Category.
- Pillar ID.
- Metadata: source file, file size.
- Key elements.
- Source-derived claims.
- Domain actions.
- Validation notes.
- Human review status.
- Article content.
- Stats.
- Guide.
- Checklist.
- Protocol.
- Course module.
- Localized content variants.

Functional sub-sections:

- Article.
- Instructional guide.
- Operational checklist.
- Testing protocol.
- Course module.
- Stats and profile.

Functional needs:

- Select asset from library, search, pillar relationship, or content pack.
- Switch asset sub-section.
- Track checklist completion per asset.
- Store reflection notes per asset.
- Export notes and checklist.
- Print summary and notes.
- Show asset missing/error state.

### 6.8 Content Pack

Purpose: Bundle related offline content and expose coverage.

Current content pack categories:

- Essential Preparedness.
- Norway Hazards.
- Medical and First Aid.
- Maps and Shelter Data.
- Privacy and Personal Safety.
- Travel Resilience.

Functional needs:

- Show bundled status.
- Show source count.
- Show content count by type.
- Filter reference library by pack.
- Open representative content by type.
- Indicate optional modules.

### 6.9 Search Document

Purpose: Build a local searchable index across content.

Fields:

- ID.
- Type.
- Title.
- Body.
- Tags.
- Pillar ID.
- URL hash target.
- Source ID.
- Language.
- Offline criticality.

Supported search types:

- Manual topic.
- Processed asset.
- Checklist item.
- Shelter.
- Glossary term.
- Editorial article.
- Official source.
- Content pack.

Functional needs:

- Search locally without API calls.
- Filter by type.
- Filter by pillar.
- Filter by language.
- Filter by criticality.
- Deduplicate equivalent bilingual entries when appropriate.
- Open result in the correct destination.

### 6.10 Shelter Record

Purpose: Represent public shelter data.

Fields:

- Shelter ID.
- Capacity.
- Address.
- Latitude.
- Longitude.

Current dataset:

- 556 public shelter records.

Functional needs:

- Search by address or shelter ID.
- Select shelter.
- Show capacity, address, ID, and distance when user location is available.
- Sort by distance when geolocation is available.
- Provide external map handoff.
- Preserve source and limitation context.

### 6.11 Source Registry Item

Purpose: Provide official source references and live-feed metadata.

Fields:

- ID.
- English name.
- Norwegian name.
- Homepage URL.
- Optional RSS URL.
- English summary.
- Norwegian summary.

Current source categories:

- DSB.
- Police log.
- Police preparedness guidance.
- Ministry of Justice and Public Security.
- NVE.
- Civil Defence.
- MET Norway weather alerts.

Functional needs:

- Show source registry offline.
- Link to external official source.
- Merge with live feed item status when available.

### 6.12 Local Document

Purpose: Let users keep local preparedness notes, plans, references, and attachments.

Fields:

- ID.
- Title.
- Category.
- Household member.
- Source.
- Review date.
- Sensitive flag.
- Tags.
- Note.
- Optional attachment.
- Created timestamp.
- Updated timestamp.

Document categories:

- Emergency plan.
- PDF reference.
- Contact plan.
- Medication list.
- Evacuation note.
- General note.

Functional needs:

- Add document.
- Attach file up to allowed size.
- Search documents.
- Filter by category.
- Mark sensitive.
- Export vault.
- Import vault.
- Export all app data.
- Delete document.
- Erase all app-owned local data.

### 6.13 Backup Bundle

Purpose: Make local data portable without cloud sync.

Secure backup bundle includes:

- Version.
- Export timestamp.
- Progress state.
- Vault documents.
- Local AI settings.

Full local data export includes:

- Version.
- Export timestamp.
- Progress state.
- Vault documents.
- App-owned local storage snapshot.
- App-related cache names.

Functional needs:

- Require passkey for encrypted backup.
- Reject weak passkeys.
- Support encrypted text export.
- Support file download.
- Support clipboard/share handoff where browser allows.
- Support QR generation.
- Support QR scan restore.
- Support legacy backup import.
- Restore progress, vault, and local AI settings.

### 6.14 Local AI Settings

Purpose: Allow optional local model assistance without cloud dependency.

Fields:

- Enabled flag.
- Base URL.
- Model name.
- Mode.

Functional requirements:

- Disabled by default.
- Accept only local endpoints: localhost, loopback IP, private LAN IP, or `.local`.
- Reject cloud API hosts.
- Persist settings locally.
- Test `/models` endpoint.
- Send assistive requests only to the configured local endpoint.
- Fall back to deterministic local responses if the local model fails.

## 7. Functional Modules

### 7.1 Application Shell and Navigation System

Purpose: Provide app-level state, route state, system status, language choice, user preferences, and access to primary destinations.

Required functions:

- Maintain active destination.
- Parse URL hash into destination.
- Persist route-relevant substate in URL query parameters.
- Listen to browser history changes.
- Persist language preference.
- Persist theme preference as a user preference without prescribing any visual direction.
- Show connectivity state.
- Update reference time.
- Register service worker in production.
- Unregister service workers during development.
- Provide error boundary fallback for uncaught UI failures.

Primary states:

- Online.
- Degraded.
- Offline.
- Content loading.
- Content failed.
- Error boundary fallback.

### 7.2 Preparedness Knowledge Manual

Purpose: Let users discover and complete practical knowledge topics.

Core interactions:

- Enter knowledge overview.
- Inspect pillars.
- Open pillar.
- Open topic.
- Read context, principle, steps, warnings, and related topics.
- Mark topic complete.
- Return to pillar.
- Return to all pillars.
- Open related reference assets.

Dependencies:

- `pillarsDataEn`.
- `pillarsDataNo`.
- Processed asset bundle.
- Topic completion local storage.

Utility:

- Provides the main conceptual map of preparedness areas.
- Supports both browsing and task-specific entry.
- Creates a low-friction path from broad topic to concrete procedure.

### 7.3 Local Search Module

Purpose: Provide unified offline retrieval across the application.

Core interactions:

- Enter query.
- Apply type filter.
- Apply pillar filter.
- Apply language filter.
- Apply criticality filter.
- Open selected result in destination.
- Clear query.

Result target behavior:

- Manual topic opens the selected pillar and topic.
- Processed asset opens the reference asset viewer.
- Checklist item opens readiness tools.
- Shelter opens shelter finder.
- Glossary term opens glossary.
- Editorial article opens library/editorial section.
- Official source opens official source area.
- Content pack opens reference library with that pack selected.

Dependencies:

- MiniSearch index.
- Search documents generated from offline content.

Utility:

- Reduces dependence on navigation memory.
- Works offline.
- Creates a single retrieval layer across content, tools, and data.

### 7.4 Official Source Links

Purpose: Surface official source links and live/cached feed status.

Core interactions:

- Load official source feeds.
- Show source cards.
- Show feed status.
- Refresh feed.
- Print source list.
- Export source snapshot as JSON.
- Open source links externally.

Fallback states:

- Live feed.
- Cached feed.
- Static bundled source list.
- Partial failure notice.
- Loading state.

Backend integration:

- `GET /api/source-feeds?lang=en|no`.

Utility:

- Maintains source transparency.
- Keeps official links available offline.
- Gives users recent online context when available.

### 7.5 Norwegian Situation Feed

Purpose: Show live or cached Norwegian news, police, weather, and preparedness items.

Core interactions:

- Load feed.
- Expand or collapse feed.
- Select visible item limit.
- Refresh.
- Print feed items.
- Export JSON.
- Open item source externally.

Data sources through backend:

- NRK.
- Digi.no.
- Politiloggen.
- MET Norway weather alerts.
- DSB.

Fallback states:

- Live data.
- Cached data.
- Static source fallback.
- Partial source failures.
- No items.

Backend integration:

- `GET /api/norway-news?limit=100&lang=en|no`.

Utility:

- Gives situational awareness without making live data a hard dependency.

### 7.6 Reference Library and Content Packs

Purpose: Provide deeper reference material and structured learning assets.

Core interactions:

- Browse featured guides.
- Open editorial articles.
- Browse content packs.
- Select content pack.
- Inspect pack type summary.
- Open representative content by content type.
- Filter reference assets by pack.
- Filter reference assets by pillar.
- Search reference assets.
- Load more results.
- Open asset.

Asset viewer interactions:

- Switch between article, guide, checklist, protocol, module, and stats.
- Toggle checklist items.
- Add reflection notes.
- Print summary and notes.
- Export notes and checklist.
- Return to library.

Dependencies:

- `processedAssets.json`.
- `editorialArticles`.
- `offlineKnowledge` generated content packs.
- Local storage for asset checklist and notes.

Utility:

- Supports deeper learning without interrupting quick operational paths.
- Converts dense source material into structured tasks, checks, and tests.

### 7.7 Training Scenarios and Emergency Flowcharts

Purpose: Train decision-making before stress.

Training Scenarios interactions:

- Select scenario.
- Read situation.
- Choose response.
- Receive feedback.
- Track score.
- Complete scenario.
- Review outcome.
- Retry.
- Move to next scenario.

Emergency Flowcharts interactions:

- Select flowchart.
- Answer decision prompt.
- Move to next step.
- Move back.
- Reset.
- Reach terminal action.

Dependencies:

- Scenario data in both languages.
- Flowchart definitions in both languages.

Utility:

- Turns preparedness content into rehearsal.
- Gives users a way to compare decisions before real incidents.

### 7.8 Standard Safety Checklists

Purpose: Track structured preparedness completion.

Core interactions:

- Select checklist group.
- Toggle item completion.
- View progress.
- Reset active group.

Dependencies:

- Checklist data in both languages.
- Local storage key for checked IDs.

Utility:

- Makes readiness observable and maintainable.

### 7.9 Custom Checklist Generator Module

Purpose: Generate a readiness checklist from household context.

Core interactions:

- Enter household size.
- Select duration.
- Select environment.
- Select special needs.
- Generate list.
- Toggle generated item completion.
- Print generated list.

Generated rules:

- Water calculated at 3 liters per person per day.
- Food calculated at 3 meals per person per day.
- Environment adds specialized items.
- Special needs add specialized items.
- Communications item is always included.

Utility:

- Bridges generic official guidance and household-specific action.

### 7.10 Secure Backup and Restore

Purpose: Give users portability without accounts.

Core interactions:

- Enter backup passkey.
- Generate encrypted backup payload.
- Generate QR backup.
- Download backup file.
- Share or copy backup text.
- Paste encrypted backup for import.
- Enter restore passkey.
- Scan QR backup.
- Restore data.
- Refresh export.

Validation rules:

- Passkey must meet minimum strength requirements.
- Known weak default passkey is rejected.
- Invalid encrypted payload must fail safely.
- QR generation failure must recommend file export.
- Camera scanning failure must not block pasted import.

Utility:

- Lets users move local data between devices without centralized storage.

### 7.11 Local Document Vault Module

Purpose: Store local preparedness documents, notes, and attachments.

Core interactions:

- Add document.
- Set category.
- Add household member.
- Add source.
- Add review date.
- Add tags.
- Add note.
- Mark sensitive.
- Attach file.
- Search documents.
- Filter by category.
- Download attachment.
- Delete document.
- Export vault.
- Import vault.
- Export all app data.
- Erase all app-owned data.

Limits:

- Attachment size limit: 6 MB.
- Vault import size limit: 10 MB.
- Maximum imported documents: 300.

Storage:

- Primary: IndexedDB.
- Fallback: localStorage.

Utility:

- Supports household-specific continuity planning without cloud sync.

### 7.12 Local AI Assistant Module

Purpose: Provide optional assistive output from local context and optional local model endpoint.

Tasks:

- Explain checklist.
- Summarize local content.
- Generate household drill.
- Analyze scenario history.

Core interactions:

- Enable or disable local AI.
- Enter local base URL.
- Enter model name.
- Save settings.
- Test connection.
- Clear settings.
- Choose task.
- Enter input.
- Run assistance.
- Read result.
- Clear response.

Context behavior:

- Selects up to six local search documents using simple query matching.
- Sends selected context only to configured local endpoint when enabled.
- Uses deterministic local fallback when local model is unavailable.

Security requirements:

- No cloud fallback.
- Reject non-local endpoints.
- Label provider for each response.
- Warn that output is advisory.

Utility:

- Adds assistive drafting and explanation while preserving local-first policy.

### 7.13 Shelter Finder and Map

Purpose: Make public shelter records searchable and inspectable.

Core interactions:

- Search by street/address or shelter ID.
- Select shelter from list.
- Select shelter marker on map.
- Use geolocation to find nearest shelter.
- Sort by nearest when user location is available.
- Draw orientation line between user and selected shelter when location exists.
- Switch between available map layer modes.
- Open official source data.
- Open external map view for selected shelter.

Map provider modes:

- Live street map.
- Bundled PMTiles offline package when available.
- Simple fallback map background.

Provider states:

- Package unavailable.
- Package installed.
- Package stale.
- Package failed to load.

Requirements:

- Shelter list must remain useful if map provider fails.
- Public shelter data source must remain visible.
- The map must communicate that it is orientation support, not authoritative routing.

Utility:

- Lets users inspect records even when map tiles are not reliable.

### 7.14 Glossary Module

Purpose: Help users understand terms.

Core interactions:

- Search term list.
- Read term explanation.
- Language-aware term display.

Utility:

- Reduces cognitive friction for unfamiliar terminology.

### 7.15 Recommended Reading Module

Purpose: Curate external learning resources.

Core interactions:

- Filter by category.
- Open external source or series item.

Utility:

- Gives deeper learning paths without making them part of emergency workflows.

### 7.16 Support and Static Information

Purpose: Explain product boundaries and expose local controls.

Submodules:

- About.
- FAQ.
- Appearance preference.
- Contact.
- Privacy.
- Terms.
- Legal notice.
- Cookie choices.
- Data management.
- Accessibility.

Functional requirements:

- The user can understand what is stored.
- The user can understand what is not stored.
- The user can contact maintainers through email handoff.
- The user can accept or reject optional cookie-like local preferences.
- The user can export/import/erase local data.
- The user can reach local AI and map package explanations.
- The user can understand emergency disclaimers.

### 7.17 Cookie and Preference Controls

Purpose: Store consent preference for optional local preferences.

Core interactions:

- Accept optional preferences.
- Reject optional preferences.
- Open cookie settings.
- Persist preference locally.
- React to cross-tab storage changes.

Utility:

- Keeps consent state explicit while avoiding analytics or marketing cookies.

### 7.18 Progressive Web App and Offline Runtime

Purpose: Keep the app usable after installation/caching.

Runtime behavior:

- Precache production assets.
- Cache runtime assets.
- Use network-first strategy for feed APIs.
- Use cache fallback for feed APIs.
- Provide offline health response through service worker.
- Serve cached app shell for navigation when offline.

Offline API paths:

- `/api/norway-news`.
- `/api/source-feeds`.

Utility:

- Preserves core use during network loss.

## 8. Backend and External Integrations

### 8.1 Local/Development API Server

Runtime:

- Express server.
- JSON body limit: 128 KB.
- CORS restricted to configured app URL, localhost, loopback, private IP ranges, and `.local`.
- Security headers set by server.
- Rate limiting for contact and copilot endpoints.

### 8.2 API Contracts

#### `GET /api/healthz`

Purpose: Connectivity heartbeat.

Response:

- Status.
- Timestamp.

Behavior:

- Supports `HEAD`.
- Service worker can provide offline-ready response if network fails.

#### `POST /api/contact`

Purpose: Contact handoff.

Input:

- Name.
- Email.
- Subject.
- Message.

Validation:

- Name required.
- Email required.
- Message required.
- Method must be POST.

Response:

- `ok: true`.
- `mailto` URL.

Storage behavior:

- No server-side message storage in current implementation.

#### `GET /api/source-feeds`

Purpose: Fetch official source feeds.

Query:

- `lang=en|no`.

Response:

- Fetch timestamp.
- Source result list.

Source result fields:

- Source ID.
- Name.
- Homepage URL.
- RSS URL where available.
- Status: ok, error, or no_feed.
- Items.

Caching:

- Server cache control: short shared max age with stale revalidation.
- Client cache fallback through local snapshot.
- Service worker network-first caching.

#### `GET /api/norway-news`

Purpose: Fetch Norwegian monitoring items.

Query:

- `limit=1..100|all`.
- `lang=en|no`.

Response:

- Fetch timestamp.
- Items.
- Partial failures.

Item fields:

- ID.
- Title.
- Summary.
- Link.
- Published timestamp.
- Source.
- Severity.
- Optional image.
- Kind: news, politiloggen, weather, or official.

Caching:

- Server cache control: short shared max age with stale revalidation.
- Client snapshot cache.
- Service worker network-first caching.

#### `POST /api/copilot/analyze`

Purpose: Local-only crisis decision analysis.

Input:

- Decision history array.
- Optional context string.

Validation:

- History must be present and array-shaped.
- History is sanitized and truncated.
- Context is sanitized and truncated.

Response:

- Readiness grade.
- Resilience score.
- Average response time.
- Security blindspots.
- Operational recommendations.
- Provider label.

Behavior:

- If environment enables local AI and local endpoint is valid, attempts local OpenAI-compatible `/chat/completions`.
- If local AI fails or is unavailable, returns deterministic analysis.
- Cloud AI is intentionally not used.

### 8.3 External Data Sources

Current external sources used through backend handlers:

- DSB RSS and public guidance pages.
- Politiloggen page parsing.
- Ministry of Justice and Public Security RSS.
- MET Norway MetAlerts JSON.
- NRK latest news RSS.
- Digi.no general feed.

External source requirements:

- Fetch failures must produce partial failure metadata.
- Feed parsing must sanitize text.
- Source links must remain available when feed items fail.
- Live data must not be required for core app use.

### 8.4 Optional Local Model Endpoint

Supported endpoint type:

- OpenAI-compatible local server.

Allowed hosts:

- `localhost`.
- `127.0.0.1`.
- `::1`.
- Private IPv4 ranges.
- `.local` hostnames.

Required endpoint behaviors:

- `GET /models` for connection test.
- `POST /chat/completions` for assistive response.

Disallowed:

- Cloud API hosts.
- Generic public internet endpoints.
- Hidden cloud fallback.

## 9. Storage and Data Ownership

### 9.1 Browser Storage

Local storage keys include:

- `beredskap101_language_v1`.
- `beredskap101_theme_v1`.
- `beredskap101_map_progress_v2`.
- `beredskap_checklists_checked_ids`.
- `beredskap101_cookie_prefs_v1`.
- `beredskap101_local_ai_settings_v1`.
- `beredskap101.shelterMap.layerMode.v1`.
- `beredskap101.pmtiles.mapPack.v1`.
- `beredskap_ext_check_<assetId>`.
- `beredskap_ext_notes_<assetId>`.
- Feed snapshot keys.
- Document vault fallback key.
- Progress fallback key.

Functional meaning:

- The language setting determines English or Norwegian content selection.
- The theme setting is a stored user preference only; it does not constrain the redesign's visual direction.
- The checklist key stores checked checklist identifiers for standard readiness progress.
- Asset checklist keys store checked identifiers for individual reference assets.
- Asset note keys store user-authored notes for individual reference assets.

### 9.2 IndexedDB

Database:

- `beredskap101-db`.

Stores:

- `progress`.
- `document-vault`.

Functional behavior:

- Use IndexedDB when available.
- Fall back to localStorage where needed.
- Normalize records on read.
- Avoid resurrecting stale local fallback data after clear operations.

### 9.3 Cache Storage

Cache categories:

- API cache.
- Runtime cache.
- Workbox precache.

Functional behavior:

- App-owned cache names must be included in full export metadata.
- App-owned cache names must be removed during local data erasure where possible.

## 10. Core User Workflows

### 10.1 First Use and Orientation

Trigger:

- User opens the app.

Expected flow:

1. App loads preferred language from local storage or browser settings.
2. App loads preferred appearance setting or system preference.
3. App initializes connectivity status.
4. App opens default knowledge destination unless URL hash says otherwise.
5. User can inspect knowledge structure, search locally, or move to a tool.
6. Service worker is registered in production after load.

Success criteria:

- User can understand primary destinations without reading policy text first.
- User can start a core task within one or two choices.
- Offline readiness is clear but not obstructive.

### 10.2 Learn a Preparedness Procedure

Trigger:

- User wants guidance for a topic such as water, blackout, first aid, privacy, travel, or shelter.

Expected flow:

1. User searches or chooses a pillar.
2. User selects a topic.
3. User reads situation context and core principle.
4. User follows procedure steps.
5. User reviews warnings.
6. User marks topic complete if appropriate.
7. User optionally opens related reference asset.

Success criteria:

- User understands what situation the advice applies to.
- User can distinguish steps from warnings.
- Completion state persists locally.

### 10.3 Find Information Quickly While Offline

Trigger:

- User needs a specific item and may have no network.

Expected flow:

1. User enters local search.
2. User searches by keyword.
3. User optionally filters by type, pillar, language, or criticality.
4. User opens result.
5. App routes to correct destination without API call.

Success criteria:

- Results include content from manual, library, checklists, shelters, glossary, official sources, and content packs.
- Empty states provide useful search adjustment guidance.

### 10.4 Build Household Readiness

Trigger:

- User wants a practical readiness list.

Expected flow:

1. User opens readiness tools.
2. User selects standard checklist or custom generator.
3. For standard checklist, user chooses group and checks items.
4. For custom generator, user enters household size, duration, environment, and needs.
5. App generates list.
6. User checks generated items.
7. User prints if needed.

Success criteria:

- Quantities are explicit.
- Progress is visible.
- State persists locally.
- Reset is deliberate.

### 10.5 Practice a Crisis Decision

Trigger:

- User wants rehearsal.

Expected flow:

1. User opens decision practice.
2. User selects scenario or flowchart.
3. User makes choices.
4. App provides feedback or next step.
5. User reaches terminal action or outcome.
6. User retries if needed.

Success criteria:

- User can recover and retry.
- Feedback is practical.
- Emergency caveats remain clear.

### 10.6 Use Shelter Finder

Trigger:

- User wants to inspect shelter records.

Expected flow:

1. User opens shelter finder.
2. User searches by address or ID, or requests nearest shelter.
3. If geolocation is approved, list sorts by distance.
4. User selects shelter.
5. App shows ID, address, capacity, distance where available, and source context.
6. User optionally opens external map handoff.

Success criteria:

- Shelter list works even if map tiles fail.
- Geolocation failure is recoverable.
- Map limitation is explicit.

### 10.7 Monitor Official Sources

Trigger:

- User wants recent Norwegian or official preparedness context.

Expected flow:

1. User opens official source or Norwegian monitoring module.
2. App fetches live feed when online.
3. If fetch fails, app shows cached snapshot where available.
4. If no cache exists, app shows static bundled source cards.
5. User can refresh, print, export JSON, or open official links.

Success criteria:

- Feed state is understandable.
- Partial source failures are visible.
- Offline fallback remains useful.

### 10.8 Store Local Preparedness Documents

Trigger:

- User wants to save a local plan, note, medication list, evacuation plan, contact plan, PDF reference, or attachment.

Expected flow:

1. User opens document vault.
2. User adds title and either note or attachment.
3. User sets category and optional metadata.
4. User marks sensitive if needed.
5. App saves locally.
6. User can search, filter, download attachment, delete, export, or import.

Success criteria:

- User understands data remains local.
- Sensitive flag is visible in document overview.
- Import validation prevents oversized or malformed payloads.

### 10.9 Export, Restore, or Erase Data

Trigger:

- User wants portability or deletion.

Expected export flow:

1. User enters passkey.
2. App rejects weak passkey.
3. App builds encrypted bundle.
4. User downloads, shares/copies, or generates QR.

Expected restore flow:

1. User pastes or scans encrypted payload.
2. User enters passkey.
3. App decrypts.
4. App restores progress, vault documents, and local AI settings.
5. App reloads or refreshes state.

Expected erase flow:

1. User chooses erase all app data.
2. App confirms destructive action.
3. App removes app-owned local storage keys.
4. App removes app-owned caches where possible.
5. App deletes app IndexedDB.
6. App reloads.

Success criteria:

- No account is required.
- Export/import failure is understandable.
- Erasure preserves unrelated browser storage.

### 10.10 Use Optional Local AI

Trigger:

- User wants help summarizing, explaining, drilling, or analyzing local content.

Expected flow:

1. User opens local AI assistant.
2. User reviews advisory warning.
3. User optionally enables local AI.
4. User enters local endpoint and model.
5. App validates endpoint locality.
6. User tests connection.
7. User selects task and enters input.
8. App gathers local context.
9. App attempts local model if enabled.
10. If local model fails, app returns deterministic local result.
11. Result shows provider label and context IDs.

Success criteria:

- User knows whether output came from model or deterministic fallback.
- Cloud endpoints are not accepted.
- No hidden network dependency exists.

## 11. Required Interaction Components

The redesign should include functionally equivalent components. Their final form is open to the designer.

Required components:

- Primary destination controls.
- Secondary destination controls.
- Language switch.
- User preference controls.
- Connectivity indicator.
- Local search input.
- Search filters.
- Search result list.
- Pillar selector.
- Topic selector.
- Topic completion control.
- Source link control.
- Feed refresh control.
- Feed export control.
- Print control.
- Reference asset selector.
- Reference asset section switcher.
- Checklist item control.
- Progress indicator.
- Checklist reset control.
- Custom checklist form controls.
- Scenario selector.
- Scenario choice controls.
- Flowchart choice controls.
- Back and reset controls for decision paths.
- Shelter search input.
- Shelter list selection.
- Geolocation control.
- Map layer selector.
- External map handoff.
- Document vault form.
- File attachment control.
- Document search and category filter.
- Vault import and export controls.
- Local data erasure control.
- Backup passkey fields.
- QR generation and scan controls.
- Local AI enable control.
- Local AI endpoint and model fields.
- Local AI connection test.
- Local AI task selector.
- Local AI input and result display.
- Cookie preference controls.
- Error/fallback messages.

## 12. Required System States

Each module should define clear user-facing states.

### 12.1 Global States

- Initial load.
- Ready.
- Online.
- Degraded.
- Offline.
- Storage unavailable.
- Critical error boundary.

### 12.2 Content States

- Content loading.
- Content ready.
- Content unavailable.
- Empty result.
- Search no match.
- Translation unavailable or fallback.
- Asset not found.

### 12.3 Feed States

- Fetching.
- Live data.
- Cached data.
- Static fallback.
- Partial failure.
- No feed items.

### 12.4 Map States

- Street map active.
- Offline package active.
- Offline package unavailable.
- Offline package stale.
- Offline package failed.
- Fallback background.
- Geolocation pending.
- Geolocation denied.
- Geolocation unsupported.
- Shelter selected.
- No shelter search results.

### 12.5 Local Data States

- Saving.
- Saved.
- Save failed.
- Import pending.
- Import succeeded.
- Import failed.
- Export ready.
- Export failed.
- Erasure confirmation.
- Erasure succeeded.
- Erasure partially failed.

### 12.6 AI States

- Disabled.
- Settings unsaved.
- Settings saved.
- Invalid endpoint.
- Connection testing.
- Connection success.
- Connection failure.
- Running task.
- Local model result.
- Deterministic fallback result.

## 13. Backward Compatibility Requirements

The redesign must preserve existing data and URL behavior unless a migration is explicitly defined.

Required compatibility:

- Existing local storage keys should remain readable.
- Existing checklist progress should survive redesign.
- Existing topic completion should survive redesign.
- Existing reference asset notes and checklist state should survive redesign.
- Existing vault documents should survive redesign.
- Existing encrypted backup bundle format version 2 should restore.
- Legacy backup import behavior should remain supported if still needed.
- Existing hash routes should redirect or resolve to the new IA.
- Existing query params `asset`, `pillar`, and `topic` should remain supported or receive a documented migration.
- Offline PWA refresh behavior should remain functional for core destinations.

## 14. Non-Functional Requirements

### 14.1 Performance

- Initial route should become interactive quickly on mobile-class devices.
- Large processed asset bundle should remain lazy-loaded or otherwise optimized.
- Search indexing should not block core interaction.
- Map provider failures should time out and fall back.
- Feed failures should not block app shell or core content.

### 14.2 Accessibility

- All controls must be keyboard operable.
- Interactive selections must expose state.
- Error and status messages must be perceivable.
- Text alternatives must exist for meaningful non-text content.
- Destructive actions must require confirmation.
- Focus movement should support task completion.
- Emergency actions should not depend on fine motor precision.

### 14.3 Privacy and Security

- No analytics, ad scripts, or behavioral tracking.
- Local AI settings must not accept cloud hosts.
- Contact flow should not imply server-side message storage.
- Local data export should be explicit and user-triggered.
- Local data erasure should be explicit and user-triggered.
- Sensitive local data warnings must be present in document vault.
- Feed parsing and print output should sanitize embedded content.

### 14.4 Reliability

- Core app must degrade gracefully offline.
- API failures must have clear fallbacks.
- Storage failures must not crash critical reading flows.
- Invalid imports must fail without corrupting existing data.
- Map failure must leave shelter list usable.
- Local AI failure must return deterministic output or a clear unavailable state.

## 15. Design Freedom Boundaries

The designer has full creative freedom over visual expression, component presentation, spatial organization, motion, iconography, and content emphasis, subject to functional clarity and accessibility.

The redesign must not inherit:

- Current visual styling.
- Current spacing or page composition.
- Current decorative choices.
- Current surface treatment.
- Current typography.
- Current color usage.
- Current component appearance.

The redesign must preserve:

- Functional modules.
- Data ownership model.
- Offline-first behavior.
- Local-first privacy claims.
- Emergency caveats.
- Source transparency.
- Backend contracts.
- Local data compatibility.

## 16. Open Product Questions for UX Discovery

These questions should be resolved before final interaction design.

- Should the primary entry point prioritize "learn", "prepare", "act now", or "monitor"?
- Should emergency flowcharts be separated from training scenarios more strongly?
- Should the document vault live under readiness tools, support/data management, or both?
- Should local AI be presented as a utility, an advanced setting, or a contextual assistant inside tasks?
- Should official source feeds and Norwegian monitoring be merged into one monitoring area?
- Should the shelter finder be treated as an emergency tool, a reference tool, or a map/search utility?
- Should the reference library be reduced, renamed, or split between learning assets and source-derived modules?
- Should the custom checklist generator produce reusable saved lists, or remain session-based with progress only?
- Should completion progress aggregate across topics, checklists, and reference modules?
- Should users be offered a first-run local data explanation before creating any personal data?

## 17. Adversarial Review

This section identifies functional risks the redesign must not hide behind visual improvements.

### 17.1 Risk: Too Many Primary Destinations

The current product surface is broad: knowledge, library, scenarios, flowcharts, checklists, glossary, shelters, reading, support, feeds, vault, backups, and local AI. A redesign that simply exposes every module equally will likely increase cognitive burden.

Design implication:

- Prioritize by user task and context.
- Keep advanced or administrative tools discoverable without overwhelming first-use workflows.

### 17.2 Risk: "Offline-First" Could Be Misunderstood

Some functions are offline-guaranteed and others are online-enhanced. Users may assume live feeds, external maps, or local AI always work offline.

Design implication:

- Each module should communicate its dependency state.
- Offline and cached states should be explicit.

### 17.3 Risk: Source Authority Confusion

The app includes app-authored guidance, official source links, parsed feeds, local notes, AI responses, and generated checklist output. Users may treat all of these as equally authoritative.

Design implication:

- Distinguish content origin and confidence.
- Keep official-source access close to source-derived claims.

### 17.4 Risk: Local Data Loss

Local-first storage protects privacy but increases risk of data loss through browser clearing, device loss, or profile changes.

Design implication:

- Export and backup must be easy to find after users create meaningful local data.
- The product should not imply automatic recovery.

### 17.5 Risk: AI Trust Miscalibration

Even local AI can produce wrong or overconfident output. Deterministic fallback can also be incomplete.

Design implication:

- AI output must be framed as assistive, not authoritative.
- Provider source must remain visible.
- Emergency and medical caveats must remain present.

### 17.6 Risk: Map Overconfidence

Shelter finder includes coordinates and external map handoff, but it is not a routing authority and may include data limitations.

Design implication:

- Shelter record lookup should not promise safe travel.
- Selected shelter state should preserve source and limitation context.

### 17.7 Risk: Compliance Controls Hidden in Support

Data export and erasure currently exist inside support/settings and document-vault workflows. Users may not discover them when needed.

Design implication:

- Data controls should be reachable from both support and personal-data contexts.

### 17.8 Risk: Training Scores Can Be Overinterpreted

Scenario scores may feel like certification or readiness proof.

Design implication:

- Scores should be framed as practice feedback, not validation of real-world capability.

## 18. Retrospective Analysis

The current product has strong functional substance but the modules compete for attention. Its main IA challenge is not lack of features. It is deciding which tasks deserve primary visibility and which should be contextual tools.

What is functionally strong:

- Local-first privacy posture is coherent.
- Offline fallback behavior is implemented across core areas.
- The content model connects guidance, checklists, source references, and search.
- User-owned data export/import/erasure is unusually complete for a PWA.
- Local AI policy avoids cloud fallback and preserves deterministic behavior.
- Shelter finder keeps the record list useful when map providers fail.

What is structurally weak or unresolved:

- Knowledge, library, reference assets, editorial articles, and content packs overlap conceptually.
- Backup and vault appear both as readiness tools and compliance/data tools.
- Search is powerful but may become the de facto IA if destinations remain unclear.
- Training scenarios and flowcharts may be perceived as separate products unless grouped by user intent.
- Feed modules risk distracting from offline preparedness if not framed as online enhancements.
- Local AI is valuable but advanced; it may need progressive disclosure.

Highest-leverage redesign decision:

- Define the primary user modes first: learn, prepare, decide, monitor, manage data. Then place modules under those modes based on user intent, not implementation origin.

## 19. Suggested Functional IA Direction

This is not a visual recommendation. It is a structural recommendation for designer exploration.

Primary task groups:

- Learn: knowledge pillars, manual topics, reference assets, glossary, recommended reading.
- Prepare: standard checklists, custom checklist generator, document vault, backups.
- Decide: emergency flowcharts, scenarios, local AI task assistance.
- Monitor: official sources, Norwegian feed, shelter finder.
- Manage: language, preferences, privacy, data export/import/erasure, legal, FAQ, contact.

Alternative interpretation:

- Treat shelter finder as "Decide" rather than "Monitor" if the product strategy frames it as urgent-use tooling.
- Treat local AI as "Manage" if the product strategy frames it mainly as an advanced configuration feature.
- Treat content packs as an internal library filter rather than a user-facing destination if users do not understand pack language.

## 20. Verification Requirements for Redesign Work

Each redesigned module should pass functional verification before being marked complete.

Minimum verification categories:

- Unit behavior for state transforms and data validation.
- Integration behavior for API, storage, import/export, and service worker fallbacks.
- UI behavior for keyboard operation, route changes, filters, empty states, and destructive confirmations.
- UX behavior for task completion under online, degraded, and offline states.
- Security/privacy behavior for local-only model endpoints, data erasure, and no unintended network calls.
- Backward compatibility behavior for existing stored data and deep links.

Completion threshold:

- A module should not be considered compliant until the same verification set passes three consecutive times with no errors, warnings, or unresolved flags.

## 21. Source Traceability

Functional evidence was derived from:

- `README.md`
- `package.json`
- `src/App.tsx`
- `src/i18n.ts`
- `src/types.ts`
- `src/types/offline.ts`
- `src/sw.ts`
- `src/components/*`
- `src/components/shelter-map/*`
- `src/utils/*`
- `src/data/*`
- `api/*`
- `server.js`
- `public/manifest.webmanifest`
- `public/maps/pmtiles-manifest.json`

No visual styling from these files should be treated as a redesign requirement.
