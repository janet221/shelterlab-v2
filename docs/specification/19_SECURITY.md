# 19 Security

### SEC-001 Production authentication and sessions

- **Description:** Demo `x-test-code` identity shall be replaced by production authentication with secure sessions, account lifecycle, and organization membership.
- **Priority:** Must
- **Delivery state:** Production required
- **User story:** As security owner, I want verified identities and revocable sessions so that real participants are protected.
- **Acceptance criteria:** Secure cookies/session rotation/logout/expiry exist; brute-force protection applies; test codes are disabled outside demo; no shared privileged accounts.
- **Related modules:** Identity, Session, User Administration
- **Competition value:** Production credibility.
- **Government-data dependency:** None.
- **AI dependency:** Provider/admin actions require authenticated authority.
- **Evidence chain dependency:** Real actor identity attaches to audit.

### SEC-002 Least privilege and tenancy

- **Description:** Authorization shall enforce role plus school/course/class/shelter ownership and deny by default.
- **Priority:** Must
- **Delivery state:** Partial; Sprint 7 adds backend role/scope/state checks and reasoned admin override
- **User story:** As partner organization, I want tenant isolation so that another school or shelter cannot access my records.
- **Acceptance criteria:** Cross-scope tests cover reads/writes/exports; admin exceptions are audited; public routes expose approved data only.
- **Related modules:** Permissions, Repositories, API
- **Competition value:** Trust and scalability.
- **Government-data dependency:** Public datasets remain globally readable; admin mutation restricted.
- **AI dependency:** AI cannot expand scope.
- **Evidence chain dependency:** Scope recorded with mutation.

### SEC-003 Secrets and external services

- **Description:** API keys, database credentials, signing keys, and storage secrets shall be supplied by environment/secret manager and never committed or exposed client-side.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As operator, I want centralized secret handling so that credentials can be rotated safely.
- **Acceptance criteria:** `.env.example` contains placeholders only; CI secret scanning runs; logs redact secrets; rotation procedure exists.
- **Related modules:** Deployment, CI, External Adapters
- **Competition value:** Engineering hygiene.
- **Government-data dependency:** Public endpoints usually keyless; any credentials governed.
- **AI dependency:** Required before real provider.
- **Evidence chain dependency:** No secret stored in provenance.

### SEC-004 Abuse, input, and upload protection

- **Description:** Production shall implement rate limits, CSRF/session protections, content limits, safe file validation, malware/quarantine controls, and security headers.
- **Priority:** Must
- **Delivery state:** Missing
- **User story:** As operator, I want common abuse controlled so that student and shelter services remain available.
- **Acceptance criteria:** Threat model and tests cover auth, injection, IDOR, file abuse, replay, and denial of service; blocked events are monitored.
- **Related modules:** Middleware, Upload, API Gateway, Observability
- **Competition value:** Production readiness.
- **Government-data dependency:** Sync endpoints protected from abuse.
- **AI dependency:** Prompt/input size and abuse controls required.
- **Evidence chain dependency:** Security events do not alter business evidence.

### SEC-005 Audit and incident response

- **Description:** Privileged mutations, review decisions, exports, access-policy changes, and security incidents shall be durably auditable with investigation and notification procedures.
- **Priority:** Must
- **Delivery state:** Partial; Sprint 7 mutations persist audit and restore demo state on audit failure
- **User story:** As incident responder, I want trustworthy records so that impact and corrective action can be determined.
- **Acceptance criteria:** Audit is append-only/access-controlled; clocks are consistent; retention is defined; incident severity/owner/timeline/recovery evidence is documented.
- **Related modules:** AuditLog, Monitoring, Risk Management
- **Competition value:** Governance maturity.
- **Government-data dependency:** Import/verification actions audited.
- **AI dependency:** Provider/config/generation/review audited.
- **Evidence chain dependency:** Audit supports chain integrity.
