# ShelterLab Product Specification V1.0 Gap Analysis

## Method

This analysis compares repository implementation, Prisma schema, tests, phase reports, master documents, backlog, and Sprint 6.1 verification. Authority follows `SPEC_INDEX.md`. A contradiction is a statement that cannot simultaneously describe the current baseline; a duplicate is the same obligation expressed in multiple places; a gap is missing behavior, decision, evidence, or production control.

## Contradictions And Resolutions

| ID | Contradiction | Evidence | V1.0 resolution | Required follow-up |
|---|---|---|---|---|
| CON-001 | Older documents say real government sources are blocked/disabled; Sprint 6.1 verifies six and activates three verified fixtures. | `MASTER_ARCHITECTURE.md`, older Sprint 4/6 text vs `OFFICIAL_DATASET_VERIFICATION_REPORT.md` | Sprint 6.1 is current: six `VERIFIED`; 6318/40121/41236 active as `VERIFIED_FIXTURE`, not live. | Refresh stale status prose when master docs are next versioned; do not erase historical reports. |
| CON-002 | Observation documentation sometimes combines shelter approval and publication. | `OBSERVATION_ENGINE.md` language and known architecture divergence vs Product Owner manual-publish decision | Shelter confirmation and manual publication are separate transitions; only shelter staff/admin publish. | Unify state machine, schema/service/API/UI tests during observation productionization. |
| CON-003 | MVP has four roles, while the master blueprint names shelter admin, foster, adopter, school admin, government viewer, and judge. | `UserRole`/Phase 1 vs `MASTER_BLUEPRINT.md` personas | Four roles are implemented; additional actors are future personas and require explicit role/scope design. | Product Owner approves production role model before identity migration. |
| CON-004 | Product goal mentions AI-generated questions, while guardrails forbid connecting an unapproved real LLM. | Sprint 6 positioning vs `AGENTS.md` and AI governance | Deterministic/mock drafts satisfy architecture/demo; real AI remains release-gated and is not an implementation claim. | Approve provider, privacy, evaluation thresholds, cost, and fallback before activation. |
| CON-005 | Old roadmap assigns Sprint 6 to generic production foundations; competition roadmap assigns it to open-data curriculum intelligence. | `ROADMAP.md` vs `FINAL_PRODUCT_ROADMAP.md` and completed commits | `FINAL_PRODUCT_ROADMAP.md` is normative; old roadmap is historical planning. | Mark old roadmap archived/superseded in a future documentation governance change. |
| CON-006 | README Sprint 4/6 text says production iLearn ingestion remains disabled, while Sprint 6.1 activates 6318. | `README.md` historical sections vs Sprint 6.1 | 6318 activation means verified metadata fixture/outbound links only, not production live ingestion or content reuse. | Keep precise mode labels; live scheduler/content review remain pending. |
| CON-007 | Research License has overall 80, module minimum 60, and remediation threshold 80, which can appear inconsistent. | Phase 2 and Product Owner decisions | These are distinct: overall qualification 80; hard module minimum 60; targeted remediation below 80 without automatic invalidation if minimum passes. | UI and analytics must explain all three thresholds. |
| CON-008 | Architecture adapter contract mentions `health`/`importSnapshot`, while implemented interface uses preview/validate/normalize/createSnapshot/import. | `MASTER_ARCHITECTURE.md` vs `lib/government-data/adapters.ts` | Current implementation is valid Sprint 6.1 baseline; health is a production extension, not silently implemented. | Add/standardize health and live-fetch contracts when scheduling is approved. |

## Duplicated Requirements

| ID | Duplicated concern | Source documents | Consolidated requirement(s) |
|---|---|---|---|
| DUP-001 | Backend role and scope checks | Architecture, AGENTS, phase reports, backlog | `FUN-001`, `API-002`, `SEC-002` |
| DUP-002 | AI cannot approve/publish/mutate source | AGENTS, AI governance, question governance, observation docs | `VIS-002`, `AIG-002` |
| DUP-003 | 300-second observation limit | AGENTS, architecture, observation reports/tests | `LAB-003`, `OBS-003` |
| DUP-004 | Teacher then shelter then manual publish | Master decisions, architecture, observation docs | `FUN-002`, `FUN-005`, `OBS-001` |
| DUP-005 | Revision/rejection reasons required | Product decisions, question/observation specs | `FUN-003`, `OBS-004`, `TCH-002` |
| DUP-006 | iLearn metadata/outbound only | AGENTS, Phase 4, open-data docs | `OGD-003`, `RSK-003` |
| DUP-007 | Official/demo/unverified labels | Curriculum docs, master architecture, Sprint 6 | `RLC-005`, `DEM-002` |
| DUP-008 | SHA-256, idempotency, last-success fallback | Open-data architecture, Sprint 6.1, tests | `OGD-004` |
| DUP-009 | Persistent audit for privileged mutations | Architecture, Phase 4 decisions, evidence chain | `NFR-005`, `SEC-005` |
| DUP-010 | No real names/faces and privacy-safe aggregates | Initial brief, AGENTS, privacy blueprint | `PRV-001`, `PRV-003`, `PRV-005` |
| DUP-011 | Synthetic versus real claim labeling | Master blueprint, dashboard, demo script | `VIS-003`, `DSH-003`, `DEM-002`, `RSK-004` |
| DUP-012 | Deterministic fallback | AI/open-data architecture and demo script | `NFR-002`, `AIG-001`, `DEM-003` |

Duplicates are not removed from historical documents because they provide decision provenance. V1.0 requirement IDs are the normalized references for future work and testing.

## Missing Requirements Or Evidence

### Critical Production Gaps

| Gap ID | Missing item | Impact | Specification coverage | Blocking condition |
|---|---|---|---|---|
| GAP-001 | Production authentication/session and organization tenancy | Real users cannot be safely onboarded. | `SEC-001`, `SEC-002`, `DAT-001` | Blocks real pilot. |
| GAP-002 | Durable repositories for runtime demo stores | Curriculum/license/observation authority state is not consistently durable. | `NFR-005`, `DAT-002`, `DAT-003`, `DAT-006` | Blocks real pilot and reliable multi-user use. |
| GAP-003 | Migration history and PostgreSQL integration CI | Schema/client pass, but DB behavior/seed/routes are not proven in current environment. | `DEP-002`, `TST-003` | Blocks production release. |
| GAP-004 | Transactional state + audit guarantees | In-memory/domain and DB audit boundaries can diverge. | `NFR-005`, `SEC-005` | Blocks authority-bearing production mutation. |
| GAP-005 | Consent/legal basis and retention schedule for minors | Real participation lacks approved privacy lifecycle. | `PRV-002`, `PRV-004` | Blocks real student pilot. |
| GAP-006 | Private media upload/storage/quarantine | Current checksum helper is not a media system. | `OBS-005`, `PRV-003`, `DEP-003` | Blocks real media use; observation can proceed without media. |
| GAP-007 | Security hardening/rate limits/abuse tests | Demo controls are insufficient for internet exposure. | `SEC-004`, `TST-004` | Blocks public production. |
| GAP-008 | Observability, backups, recovery, SLOs | Operators cannot detect/recover incidents reliably. | `NFR-004`, `DEP-004` | Blocks production service commitment. |

### Competition-Core Gaps

| Gap ID | Missing item | Impact | Specification coverage | Recommended owner |
|---|---|---|---|---|
| GAP-009 | Official MOE/NAER curriculum codes/text verification | Current mappings remain `DEMO_REFERENCE`; national alignment cannot be claimed official. | `RLC-005` | Curriculum Owner/Data Steward |
| GAP-010 | Durable teacher course/class authorization and readiness dashboard | Teacher platform is partially demo-backed. | `TCH-003`, `TCH-005` | Education Product Owner |
| GAP-011 | Production observation task/timer/version/review/publish journey | Core Living Lab remains domain/static/demo backed. | Chapters 10-11 | Shelter + Education Owners |
| GAP-012 | Dog evidence timeline and one narrow adoption-support journey | End-to-end evidence-to-social-impact story stops before adoption. | `ADA-001`, `ADA-002` | Shelter Product Owner |
| GAP-013 | Inquiry artifact/rubric and pilot learning measures | Educational impact is currently quiz/demo centric. | `LED-003`, `LED-004` | Curriculum/Research Owner |
| GAP-014 | Competition rules/category/deadlines archival | Technical EDUOD basis exists, but formal eligibility is external. | `DEM-004` | Demo Lead/Product Owner |
| GAP-015 | Timed full demo and target-hardware fallback package | Script exists; full scenes and rehearsal evidence are incomplete. | `DEM-001`, `DEM-003`, `TST-005` | Demo Lead |

### External And Product Decisions Still Missing

1. Authentication vendor/session architecture and production hosting region.
2. School/shelter partner, pilot scope, staffing, authority, and incident agreement.
3. Minor consent/legal-basis evidence and retention schedule.
4. Media provider, quarantine policy, face/privacy review process, and media necessity.
5. Official curriculum source, verification owner, and approved claim wording.
6. Live open-data scheduling infrastructure, monitoring, and source-specific cadence exceptions.
7. Real AI provider, model, data-processing terms, evaluation thresholds, budget, and fallback.
8. Adoption Accelerator competition slice: profile only, outing/foster evidence, or follow-up.
9. KPI privacy suppression threshold and pilot evaluation design.
10. Official InnoServe rules, scoring weights, deadlines, and AI restrictions.

## Architecture Gaps Without Redesign

- Add repository implementations beneath existing domain services; do not move authority into UI or providers.
- Add production adapters/jobs behind existing adapter boundaries; preserve verified fixtures for tests/demo.
- Add identity/tenancy around current role helpers; keep role and scope checks server-side.
- Add observation versioning and separate publish transition within existing workflow ownership.
- Add adoption/analytics modules as downstream consumers of approved evidence, never as alternate truth sources.

## Specification Completeness Assessment

V1.0 defines the intended product, authority, requirements, dependencies, and release gaps. It is not a claim that every requirement is implemented. The largest risks are production identity/persistence/privacy, observation productionization, official curriculum verification, adoption evidence scope, and real pilot impact. These should govern Sprint 7 approval and de-scope decisions.
