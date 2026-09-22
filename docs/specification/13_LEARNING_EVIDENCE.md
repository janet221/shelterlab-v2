# 13 Learning Evidence

### LED-001 Immutable attempt evidence

- **Description:** Submitted attempts shall preserve question/version, prompt/options, resource/standard/dataset IDs, provider/prompt versions, answers, scores, and integrity flags.
- **Priority:** Must
- **Delivery state:** Implemented domain
- **User story:** As an auditor, I want the exact assessment evidence frozen so that later content edits cannot change past results.
- **Acceptance criteria:** Result reconstruction does not depend on current question text; correct answers remain hidden until submission; evidence snapshot is immutable.
- **Related modules:** Quiz Attempt, Attempt Question, Evidence Snapshot
- **Competition value:** Assessment integrity and traceability.
- **Government-data dependency:** Dataset IDs/states/hashes where used.
- **AI dependency:** Provider/model metadata where used.
- **Evidence chain dependency:** Required.

### LED-002 Competency evidence

- **Description:** The system shall calculate module and mapped competency outcomes while distinguishing official standards from demo references.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As a teacher, I want evidence beyond one total score so that I can target instruction.
- **Acceptance criteria:** Module outcomes include numerator/denominator; standard status/source is visible; gaps drive deterministic recommendations.
- **Related modules:** Competency Graph, Results, Remediation
- **Competition value:** Curriculum and educational evidence depth.
- **Government-data dependency:** Data-literacy items retain source provenance.
- **AI dependency:** None required.
- **Evidence chain dependency:** Question → standard/module → outcome.

### LED-003 Inquiry rubric and artifacts

- **Description:** Teacher-reviewed inquiry artifacts shall capture research question, variables, evidence use, analysis, limitations, ethics, and communication quality.
- **Priority:** Should
- **Delivery state:** Implemented schema/domain and synthetic teacher rubric evidence in Sprint 9A; durable pilot analytics pending
- **User story:** As a student, I want feedback on scientific inquiry so that learning is not reduced to quiz performance.
- **Acceptance criteria:** Versioned rubric exists; teacher scores/comments are scoped and audited; source and observation citations attach to artifact.
- **Related modules:** One Health Inquiry, Scientific Reporting, Teacher Dashboard
- **Competition value:** Stronger learning-outcome story.
- **Government-data dependency:** Required when artifact uses official data.
- **AI dependency:** AI may coach/draft but cannot grade finally.
- **Evidence chain dependency:** Artifact links sources, observations, and review.

### LED-004 Learning impact measurement

- **Description:** Pilot analytics shall support pre/post learning gain, license pass/readiness, remediation completion, inquiry rubric, and observation data-quality outcomes without causal overclaiming.
- **Priority:** Should
- **Delivery state:** Planned
- **User story:** As Product Owner, I want defensible educational outcomes so that competition claims can progress beyond demo metrics.
- **Acceptance criteria:** Metric definitions, cohorts, denominators, dates, suppression, and limitations are versioned; synthetic and pilot values are separate.
- **Related modules:** Analytics, Dashboard, Research Reporting
- **Competition value:** Measurable educational impact.
- **Government-data dependency:** Optional contextual comparison only.
- **AI dependency:** Analytics assistant optional.
- **Evidence chain dependency:** Metric resolves to governed source records.
