# ShelterLab Product Specification V1.0

Sprint 9A implementation note: `OHF-001`, `OHF-002`, bounded `OHF-004`, and `LED-003` now have deterministic synthetic MVP implementations. See [`SPRINT9A_PRD.md`](../../SPRINT9A_PRD.md) and [`SPRINT9A_REPORT.md`](../../SPRINT9A_REPORT.md). GIS and production persistence remain outside Sprint 9A.

Sprint 10A implementation note: `ADA-001`, `ADA-002`, and the shelter adoption-readiness portion of `DSH-001` now have deterministic `SYNTHETIC_DEMO` implementations. See [`EVIDENCE_BASED_ADOPTION_PROFILE.md`](../../EVIDENCE_BASED_ADOPTION_PROFILE.md), [`PROFILE_COMPLETENESS_SPEC.md`](../../PROFILE_COMPLETENESS_SPEC.md), and [`SPRINT10A_REPORT.md`](../../SPRINT10A_REPORT.md). Matching and operational adoption programs remain outside Sprint 10A.

Sprint 10B implementation note: public Adoption Profile statements now have deterministic, privacy-filtered five-stage story traces and UNKNOWN/gap explanations. See [`STORY_ENGINE_SPEC.md`](../../STORY_ENGINE_SPEC.md) and [`SPRINT10B_REPORT.md`](../../SPRINT10B_REPORT.md). The story layer is read-only and adds no adoption operation.

Sprint 11A implementation note: `/competition/judge` now provides a deterministic seven-step, 420-second competition experience with stable presentation deep links and browser-local zero-mutation reset. See [`COMPETITION_EXPERIENCE_SPEC.md`](../../COMPETITION_EXPERIENCE_SPEC.md) and [`SPRINT11A_REPORT.md`](../../SPRINT11A_REPORT.md). Full Sprint 12 delivery remains pending.

Sprint 11C implementation note: `/` now provides the public product entry, `/tour` an eight-step introduction, and `/demo` four deterministic read-only role perspectives. Metadata, discovery files, trust pages, error boundaries, Vercel preparation, and feature-freeze documentation are included. See [`PUBLIC_DEMO_SPEC.md`](../../PUBLIC_DEMO_SPEC.md), [`DEPLOYMENT_GUIDE.md`](../../DEPLOYMENT_GUIDE.md), and [`SPRINT11C_REPORT.md`](../../SPRINT11C_REPORT.md). External validation and field deployment remain pending.

Document status: Baseline 1.0  
Baseline date: 2026-07-11  
Product position: Evidence-Driven One Health Citizen Science Platform  
Primary competition track: InnoServe Education Open Data (`EDUOD`), pending final rules verification

## Authority And Conventions

This specification consolidates the implemented product, approved architecture, master decisions, verified open-data evidence, and future competition blueprints. Authority order is: `MASTER_DECISIONS.md` → `MASTER_BLUEPRINT.md` and `MASTER_ARCHITECTURE.md` → Sprint 6.1 reports → domain specifications → historical phase reports and backlogs.

Priorities are `Must`, `Should`, and `Could`. Delivery states are `Implemented`, `Partial`, `Demo only`, `Planned`, or `Production required`. A requirement marked `Planned` is not an implementation claim. `None` under a dependency means the requirement must work without that dependency.

## Specification Chapters

1. [Vision](./01_VISION.md)
2. [User Personas](./02_USER_PERSONAS.md)
3. [Product Scope](./03_PRODUCT_SCOPE.md)
4. [Functional Requirements](./04_FUNCTIONAL_REQUIREMENTS.md)
5. [Non-functional Requirements](./05_NON_FUNCTIONAL_REQUIREMENTS.md)
6. [Government Open Data](./06_GOVERNMENT_OPEN_DATA.md)
7. [One Health Framework](./07_ONE_HEALTH_FRAMEWORK.md)
8. [AI Governance](./08_AI_GOVERNANCE.md)
9. [Research License](./09_RESEARCH_LICENSE.md)
10. [Living Laboratory](./10_LIVING_LABORATORY.md)
11. [Observation System](./11_OBSERVATION_SYSTEM.md)
12. [Teacher Platform](./12_TEACHER_PLATFORM.md)
13. [Learning Evidence](./13_LEARNING_EVIDENCE.md)
14. [Adoption Accelerator](./14_ADOPTION_ACCELERATOR.md)
15. [Dashboard](./15_DASHBOARD.md)
16. [Analytics](./16_ANALYTICS.md)
17. [Data Model](./17_DATA_MODEL.md)
18. [API Specification](./18_API_SPECIFICATION.md)
19. [Security](./19_SECURITY.md)
20. [Privacy](./20_PRIVACY.md)
21. [Competition Demo](./21_COMPETITION_DEMO.md)
22. [Deployment](./22_DEPLOYMENT.md)
23. [Testing](./23_TESTING.md)
24. [Risk Management](./24_RISK_MANAGEMENT.md)
25. [Future Roadmap](./25_FUTURE_ROADMAP.md)

## Delivery Analysis

- [Gap Analysis](./GAP_ANALYSIS.md)
- [Implementation Order](./IMPLEMENTATION_ORDER.md)

## Baseline Summary

Implemented or demonstrated foundations include role checks, curriculum and question governance, Research License scoring, deterministic validation, a 300-second observation domain, two-stage review concepts, verified government-data fixtures, evidence snapshots, audit foundations, and a judge-facing evidence dashboard. Production identity, durable runtime repositories, official curriculum-standard verification, live scheduling, media storage, GIS, adoption operations, real AI providers, and pilot impact evidence remain incomplete.
