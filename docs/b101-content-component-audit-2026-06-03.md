# B101 Content Component Audit

Date: 2026-06-03
Scope: `instructional guide`, `checklists`, `testing protocol`, `course modules`, `stats & profile`
Data reviewed: [src/data/processedAssets.json](/c:/00%20DEV/In%20Progress/beredskap101-app/src/data/processedAssets.json), [src/components/ExtendedAssetViewer.tsx](/c:/00%20DEV/In%20Progress/beredskap101-app/src/components/ExtendedAssetViewer.tsx)

## Method

I audited all 20 processed reference assets currently bundled in the app.

The review used two tests:

1. Source-link test: does the component clearly derive from the source topic, source filename, or article overview rather than a generic preparedness template?
2. Instructional-integrity test: if a user studied only that component, would they still learn something recognizably specific to the source article's primary topic?

I also measured duplication patterns across the bundle:

- `guide`: 11 unique variants across 20 assets
- `checklist`: 1 unique variant across 20 assets
- `protocol`: 18 unique variants across 20 assets, but uniqueness is mostly in the title-injected purpose line
- `course module`: 1 unique variant across 20 assets
- `stats`: 1 unique variant across 20 assets

## Verdict Summary

| Component | Relevance Verdict | Drawn From Source? | Instructional Integrity |
| --- | --- | --- | --- |
| Instructional guide | Partial / weak | Mostly generic template with small topic substitutions | Inconsistent |
| Checklists | Weak | No meaningful source linkage | Fails specificity |
| Testing protocol | Partial | Purpose line references topic; procedures remain generic | Weak |
| Course modules | Weak | Same module reused across all assets | Fails specificity |
| Stats & profile | Mixed | Metadata is real; interpretive stats are generic | Weak outside metadata |

## Detailed Analysis

### 1. Instructional Guide

Verdict: `connected, but only at a shallow extrapolation layer`

What is source-linked:

- Many guides inject one topical noun into the execution phase.
- Example patterns:
  - GDPR/privacy asset: `stabilize access control`
  - First-aid EDC asset: `stabilize first`
  - Natural hazards asset: `stabilize storm`

What is not source-linked:

- Preparation is largely the same across unrelated topics such as GDPR, first aid, driving fatigue, and disaster recovery:
  - map likely scenarios
  - assign primary and backup responsibilities
  - ensure tools and references are available offline
- Evaluation is also effectively standardized across the full set:
  - review response speed
  - update action lists
  - schedule next exercise

Interpretation:

- These guides are not fabricated nonsense, but they are not individually grounded in the source article's core subject matter.
- They read like a generalized incident-management overlay applied onto topic titles.
- That makes them acceptable as operational scaffolding, but not as faithful source-derived instruction.

Integrity judgment:

- Logical extrapolation exists.
- Direct derivation from source material is weak.
- Topic specificity is insufficient for medical, privacy, and hazard subjects that require domain-specific procedural detail.

### 2. Checklists

Verdict: `not individually relevant to source topic`

Observed fact:

- All 20 assets use the same checklist:
  - primary and backup roles confirmed
  - communication channels tested
  - critical resources available
  - escalation thresholds understood
  - after-action findings documented

Why this fails the source-link test:

- A checklist for `First Aid Kits for Every-Day Carry (EDC)` should mention trauma items, packaging, access, carry location, or training cadence.
- A checklist for `Særlige kategorier av personopplysninger; GDPR og Personvern` should mention lawful basis, sensitive-data handling, access controls, retention, or incident escalation.
- A checklist for `Natural Hazards: Preparedness and Response` should mention warnings, shelter options, route changes, weather monitoring, or evacuation triggers.

None of that appears. The checklist is a generic governance checklist, not a topic-specific action checklist.

Integrity judgment:

- Minimal thematic consistency.
- Fails individual relevance.
- This is the clearest component-level integrity gap in the current bundle.

### 3. Testing Protocol

Verdict: `surface-level relevance only`

What is source-linked:

- The protocol purpose usually injects the title into a generic sentence:
  - `Verify that controls for [topic] remain robust across different contexts and skill levels.`

What is not source-linked:

- Procedures are reused across nearly all assets:
  - run a time-boxed scenario drill
  - log decisions and deviations
  - repeat with altered assumptions
- Requirements are also reused:
  - responsibilities and thresholds documented
  - executable under realistic constraints
  - improvement actions have owners and deadlines

Interpretation:

- The protocol shell is operationally coherent.
- The topic-specific part is mostly labeling, not substantive testing design.
- A true first-aid protocol should test compression quality, tourniquet timing, kit accessibility, and casualty handoff.
- A true privacy protocol should test consent boundaries, access-control failure paths, logging, and breach escalation.

Integrity judgment:

- Better than the checklist because the purpose line at least preserves the topic.
- Still too generic to claim strong derivation from the underlying source.

### 4. Course Modules

Verdict: `low relevance / template reuse`

Observed fact:

- All 20 assets reuse the same learning goals, theory block, and reflection questions.
- Only `moduleId` changes per asset.

Repeated learning goals:

- connect situational awareness to rapid prioritized action
- use structured communication under time pressure
- run continuous improvement cycles after drills and incidents

Repeated theory:

- a universal explanation about preparedness principles transferring across sectors and countries

Why this fails:

- A course module for medical heat-stroke content should teach recognition thresholds, cooling sequence, and contraindications.
- A course module for GDPR-sensitive data should teach data-category distinctions, lawful handling, and minimization rules.
- A course module for natural hazards should teach trigger recognition, forecast interpretation, and field decision thresholds.

The current module copy does not do that. It describes a universal response doctrine rather than the actual subject matter.

Integrity judgment:

- The module component is structurally complete but pedagogically generic.
- It does not preserve the identity of the source topic well enough to count as faithful microlearning.

### 5. Stats & Profile

Verdict: `metadata relevant, interpretive stats not substantiated`

What is valid:

- `sourceFile`
- `fileSizeKb`
- title and category labels shown in the viewer

What is weak:

- `dataComplexity` is always `Medium`
- `readinessFactor` is always `8/10`
- `distribution` is always `40 / 40 / 20`

Why that matters:

- A flood-recovery source, a GDPR lecture PDF, and an EDC first-aid note should not automatically share the same difficulty, readiness score, or theory/practice split.
- Those values are presented as if they were analytic judgments, but the bundle does not show evidence that they were actually assessed per asset.

Integrity judgment:

- The profile metadata is real.
- The interpretive scoring appears templated and therefore should not be treated as authoritative.

## Asset-Level Pattern Check

Three representative examples show the same systemic issue:

1. `Særlige kategorier av personopplysninger; GDPR og Personvern`
- Guide shifts one phrase toward `access control`, but remains generic.
- Checklist is not privacy-specific.
- Protocol purpose names GDPR/privacy, but procedures do not test privacy-specific controls.
- Module theory is generic preparedness theory, not GDPR instruction.
- Stats are templated.

2. `Førstehjelp - Every-Day Carry (EDC)`
- Guide remains generic except for a vague `stabilize first` phrase.
- Checklist does not mention kit contents, access speed, or training.
- Protocol does not test bleeding-control actions or carry readiness.
- Module is identical to non-medical topics.
- Stats are templated.

3. `Natural Hazards: Preparedness and Response`
- Guide substitutes `storm`, but does not teach hazard-specific thresholds or weather-action logic.
- Checklist omits forecast checks, route alternatives, shelter decisions, and warning triggers.
- Protocol lacks hazard-specific exercises.
- Module is unchanged from privacy and business-resilience assets.
- Stats are templated.

## Adversarial Review

If I assume a skeptical reviewer is trying to disprove thematic consistency, they would win on four points:

1. The checklist component is demonstrably not topic-specific.
2. The course-module component is demonstrably reused verbatim across unrelated domains.
3. The stats component presents repeated judgments as if they were individualized.
4. The guide and protocol components often preserve the topic label without preserving the domain knowledge.

That means the current bundle can still look complete in the UI while giving a false impression of source fidelity.

## Retrospective

Likely root cause:

- The pipeline optimizes for structural completeness across every asset.
- During that normalization step, domain-specific content was compressed into generic preparedness templates.
- Title injection then created the appearance of specificity without preserving the source article's operational details.

What the system got right:

- Every asset has a consistent shell.
- The UI component contract is stable.
- Metadata retention is intact.

What the system got wrong:

- Source fidelity was traded away for templated uniformity.
- The pipeline appears to over-weight generic emergency-management abstractions.
- Quality gates accepted repeated components that should have been flagged as non-specific.

## Compliance-Relevant Risk

This is not only a content-quality issue. It is also a trust issue:

- Medical users may infer topic-specific authority where there is mostly generic scaffolding.
- Privacy/GDPR users may believe controls were derived from the legal source when they were not.
- Readiness scores may be interpreted as validated assessments even though they appear templated.

## Final Audit Judgment

Current state:

- `instructional guide`: partially aligned, not reliably source-derived
- `checklists`: not source-specific enough
- `testing protocol`: topic-labeled but mostly generic
- `course modules`: insufficiently individualized
- `stats & profile`: real metadata mixed with non-substantiated scoring

Conclusion:

The B101 component shell is thematically coherent at the broad preparedness level, but several individual content components do not currently meet a strict source-integrity standard. The main failure mode is template reuse masquerading as topic-specific instruction.
