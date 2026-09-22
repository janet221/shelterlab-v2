# 22 Deployment

### DEP-001 Reproducible environments

- **Description:** Development, CI, staging, competition-demo, and production environments shall have documented configuration and reproducible builds.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As engineer, I want environment parity so that releases behave predictably.
- **Acceptance criteria:** Lockfile/build commands are fixed; `.env.example` is current; environment-specific data modes are explicit; build artifact is immutable.
- **Related modules:** Docker Compose, CI/CD, Next.js, Prisma
- **Competition value:** Feasibility and reliability.
- **Government-data dependency:** Sync mode differs by environment.
- **AI dependency:** Provider disabled by default outside approved environment.
- **Evidence chain dependency:** Environment/demo version recorded.

### DEP-002 PostgreSQL and migrations

- **Description:** Staging/production shall use managed or approved PostgreSQL with backup, migration, restore, connection, and availability controls.
- **Priority:** Must
- **Delivery state:** Production required
- **User story:** As operator, I want durable recoverable storage so that evidence is not lost.
- **Acceptance criteria:** Migration pipeline and rollback/forward-fix process exist; backups/restores tested; secrets managed; seed is demo-only and idempotent.
- **Related modules:** PostgreSQL, Prisma, Backup
- **Competition value:** Production credibility.
- **Government-data dependency:** Snapshots/sync runs persisted.
- **AI dependency:** AI audits/drafts persisted.
- **Evidence chain dependency:** Durable storage required.

### DEP-003 Jobs, storage, and notifications

- **Description:** Production shall provide monitored scheduling/queues, private object storage, and approved notification channels for sync, media, review, and follow-up work.
- **Priority:** Should
- **Delivery state:** Missing
- **User story:** As operator, I want long-running/external tasks outside request threads so that workflows are reliable.
- **Acceptance criteria:** Jobs are idempotent/retryable/dead-lettered; media is encrypted/private; notifications respect preferences; failures alert owners.
- **Related modules:** Scheduler, Queue, Object Storage, Notifications
- **Competition value:** Operational feasibility.
- **Government-data dependency:** Daily 02:00 sync.
- **AI dependency:** Async provider jobs may use queue.
- **Evidence chain dependency:** Job outcome attaches to sync/generation/audit.

### DEP-004 Observability and recovery

- **Description:** Production shall monitor health, latency, errors, jobs, data freshness, security events, and backups with tested recovery targets.
- **Priority:** Must
- **Delivery state:** Missing
- **User story:** As operator, I want actionable telemetry so that failures are detected and recovered.
- **Acceptance criteria:** Structured logs/metrics/traces and alerts exist; PII/secrets are redacted; RPO/RTO and disaster-recovery rehearsal are approved.
- **Related modules:** Monitoring, Incident Response, Backup
- **Competition value:** Technical maturity.
- **Government-data dependency:** Source health/freshness monitored.
- **AI dependency:** Provider health/cost/quality monitored.
- **Evidence chain dependency:** Monitoring does not replace business audit.

### DEP-005 Release and rollback governance

- **Description:** Releases shall require automated gates, migration review, feature flags for risky integrations, and documented rollback/disable procedures.
- **Priority:** Must
- **Delivery state:** Missing
- **User story:** As Product Owner, I want controlled releases so that a failure can be contained quickly.
- **Acceptance criteria:** CI blocks failed checks; open-data/AI/media features can be disabled independently; release notes list data/claim changes.
- **Related modules:** CI/CD, Feature Flags, Change Control
- **Competition value:** Delivery discipline.
- **Government-data dependency:** Adapter activation flag.
- **AI dependency:** Provider/model activation flag.
- **Evidence chain dependency:** Release version associated with generated evidence.

### DEP-006 Public demo deployment preparation

- **Description:** The public demo shall build on Vercel with explicit public URLs, environment variables, metadata, discovery files, error boundaries, and no committed secrets.
- **Priority:** Must
- **Delivery state:** Implemented in Sprint 11C for deployment preparation; Vercel project and domain approval pending
- **User story:** As a release owner, I want a repeatable public-demo deployment so that judges and partners can open a stable URL.
- **Acceptance criteria:** `npm run build` passes; Vercel config and environment guide exist; metadata/robots/sitemap/manifest are tested; no production migration or seed is executed.
- **Related modules:** Next.js App Router, Vercel, Public Site
- **Competition value:** Public accessibility and delivery credibility.
- **Government-data dependency:** Demo uses local approved fixtures only.
- **AI dependency:** No external provider required.
- **Evidence chain dependency:** Linked public projections remain inspectable after deployment.
