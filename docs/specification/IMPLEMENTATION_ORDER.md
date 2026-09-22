# ShelterLab Implementation Order

This order is a planning recommendation derived from Product Specification V1.0 and the competition-oriented final roadmap. It does not authorize Sprint 7 or any code change.

## Sequencing Principles

1. Preserve completed Sprint 1-6.1 behavior and evidence labels.
2. Make authority and persistence durable before expanding service scope.
3. Prioritize requirements that strengthen the EDUOD/education/One Health evidence story.
4. Add adoption and AI only as downstream, human-governed consumers of approved evidence.
5. Keep offline fixtures and deterministic fallbacks throughout.

## Order 0: Product Owner Gates

Approve partner/pilot scope, official curriculum source process, production identity/hosting direction, consent/retention, media necessity/provider, live-sync operations, adoption demo slice, KPI privacy threshold, and official competition rules. Record decision IDs in `MASTER_DECISIONS.md` before affected implementation.

Exit evidence: approved Sprint 7 brief; owners and acceptance tests mapped to V1.0 IDs; unresolved decisions explicitly non-blocking or deferred.

## Order 1: Durable Education And Evidence Foundation

Primary requirements: `TCH-005`, `DAT-001`, `DAT-002`, `DAT-006`, `NFR-005`, `TST-003`, `API-002`.

1. Provision CI/staging PostgreSQL and migration pipeline.
2. Introduce repository implementations behind current domain services.
3. Persist course/class authorization, curriculum/question state, attempts/licenses, and transactional audit.
4. Add database integration/concurrency tests.
5. Preserve deterministic fixtures and current 110/9 regression floor.

Exit evidence: clean migration/seed, transactional audit rollback test, tenant/scope tests, durable teacher journey.

## Order 2: Official Curriculum And Teacher-Governed Learning

Primary requirements: `RLC-005`, `TCH-001` through `TCH-003`, `LED-001`, `LED-002`, `OGD-001` through `OGD-004`.

1. Verify approved official standards without inventing codes.
2. Complete source/resource/standard/week mapping workflow.
3. Complete teacher readiness, remediation, competency, and review dashboards.
4. Preserve separate question approval/publication and source restrictions.
5. Extend evidence dashboard to durable records.

Exit evidence: one official-standard trace if verification succeeds; otherwise visible `DEMO_REFERENCE` fallback with no false claim.

## Order 3: Living Laboratory Production Journey

Primary requirements: Chapters 10-11, `FUN-002`, `FUN-003`, `FUN-005`, `DAT-003`.

1. Persist assignments and active-license eligibility.
2. Implement live timer/reconnect-safe draft with server duration validation.
3. Persist event/session versions and deterministic flags.
4. Implement teacher review, shelter confirmation, and separate manual publish.
5. Build Dog Evidence Timeline from published records.

Exit evidence: Playwright/API/DB test of student → teacher → shelter confirm → manual publish; published version immutable.

## Order 4: Trust, Privacy, Security, And Operations

Primary requirements: Chapters 19-20 and 22, `NFR-004`, `TST-004`, `RSK-002`.

1. Production authentication, sessions, tenancy, and revocation.
2. Consent/attestation and retention/deletion controls.
3. Security hardening, audit access, incident process.
4. Scheduler/queue for 02:00 sync, freshness monitoring, last-success alerting.
5. Private media only if Product Owner confirms it is necessary; observation remains usable without media.
6. Backup/restore, SLOs, observability, staging, and release gates.

Exit evidence: security/privacy review, recovery exercise, live-sync staging evidence, no demo identity in production.

## Order 5: One Health Inquiry And Learning Impact

Primary requirements: Chapter 07, `LED-003`, `LED-004`, `ANL-001`, `ANL-002`, `ANL-004`.

1. Add teacher-approved inquiry template and rubric.
2. Use 40121 and 41236 snapshots in bounded data-literacy/One Health inquiry.
3. Add scientific report with limitations and privacy-safe sharing.
4. Add a generalized GIS pilot only after source/privacy verification.
5. Define pilot educational metrics and claim policy.

Exit evidence: source → inquiry → observation → rubric → limited conclusion trace.

## Order 6: Narrow Adoption Accelerator Slice

Primary requirements: `ADA-001`, `ADA-002`, then one of `ADA-003` or `ADA-005`.

Recommended competition scope: Dog Evidence Timeline plus shelter-approved profile and one follow-up/support state. Foster/outing and matching remain de-scoped unless a partner validates the workflow and schedule permits.

Exit evidence: published observation → evidence-linked profile draft → shelter approval → public synthetic profile; no suitability automation.

## Order 7: Evaluated AI Assistance

Primary requirements: Chapter 08 and `ANL-005`.

1. Keep deterministic question/validation providers as baseline.
2. Build versioned evaluation set and approve privacy/provider terms.
3. Pilot one bounded source-grounded question-draft provider.
4. Measure alignment, hallucination, unsafe output, similarity, teacher acceptance, latency, and cost.
5. Consider observation/adoption summary drafting only after upstream evidence is durable.

Exit evidence: model release report and kill switch; zero autonomous approvals/publications.

## Order 8: Competition Freeze And Delivery

Primary requirements: Chapter 21, `TST-005`, `RDM-005`.

1. Confirm official rules and eligibility package.
2. Freeze scope and claims.
3. Complete role-based demo polish and evidence handout.
4. Run full quality gates and timed rehearsals on target hardware.
5. Prepare verified-fixture, deterministic AI, screenshots/video, and narration fallbacks.

Exit evidence: repeatable sub-420-second demo; all modes labeled; release commit/tag and test report archived.

## De-scope Order

If schedule slips: broad foster/outing operations → matching → real AI beyond one draft pilot → broad GIS → media upload → live external sync during presentation. Do not de-scope source provenance, Research License, review order, manual publication, privacy labels, evidence chain, or deterministic fallback.
