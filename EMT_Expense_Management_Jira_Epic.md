````markdown
# EMT Expense Management Module — Phase-wise Technical Implementation (API-first + UI)

## Jira Ticket (Epic)

### 1) Title:
EMT Expense Management Module — Phase-wise Technical Implementation (API-first + Web + Mobile)

### 2) Issue Type:
Epic

### 3) Summary:
Build an enterprise-grade Expense Management platform with an API-first backend and **web + mobile** clients integrated to those APIs. The system must support expense lifecycle, configurable approval workflows (state-machine), centralized policy evaluation, OCR receipt ingestion (async), integrations (ERP/Travel/WhatsApp/Corporate Cards), multi-currency + GST, immutable audit trail, event-driven notifications, and scalable analytics.

### 4) Background / Context:
This is a workflow-heavy, event-driven enterprise platform (not simple CRUD). Key technical risks include OCR reliability, workflow configurability, policy engine scalability/conflict resolution, integration reliability, multi-currency correctness, compliance-grade auditability, and high operational complexity.

### 5) Scope:

**In scope:**
- API-first backend services (modular monolith initially; clear seams to evolve into services)
- Web UI + Mobile UI (day-1) consuming APIs end-to-end
- Workflow engine (configurable state-machine)
- Policy Engine (centralized rule evaluation, conflict resolution, versioning, audit)
- Receipt ingestion + async OCR pipeline + human correction flow
- Multi-currency (FX provider selection, timestamping, auditability)
- GST validations + reconciliation + reporting exports
- Integrations via gateways: ERP (**push + pull**), travel, WhatsApp, cards, HRMS, banking, SSO, OCR providers
- Notification service (event-driven, multi-channel)
- Immutable audit trail (append-only)
- Analytics foundation (aggregations/materialized views + reporting DB strategy)

**Out of scope (initially unless specified):**
- Advanced ML fraud detection / predictive insights (post-MVP)
- Full enterprise data warehouse program (beyond initial OLAP/reporting foundation)

### 6) Assumptions:
- **Tenant model:** multi-company (tenant-isolated data + configurations)
- UI includes both web and mobile from day 1 (feature parity defined per phase)
- ERP integration supports **bi-directional sync** (push + pull) with reconciliation and backfill
- Workflow SLA includes reminders, delegation, and fallback approver logic
- GST scope includes validations, reconciliation, and export reporting
- Receipt retention and compliance requirements will be explicitly configured and enforced
- SLOs, RPO/RTO targets will be defined in Phase 0/1 and used to drive capacity planning

### 7) Architecture Notes (high level):
- **API style:** REST + OpenAPI (contract-first). Consider GraphQL for UI composition later if needed.
- **Core domains/resources:** Companies/Tenants, Users/Employees, ExpenseReports, ExpenseItems, Receipts, Workflows (definitions + instances), Policies (rules + versions), Approvals, Reimbursements, FXRates, Merchants, CorporateCardTxns, AuditEvents, Notifications, Integrations.
- **AuthN/AuthZ:** SSO (SAML/OIDC) + MFA (if required) + RBAC + tenant scoping. Enforce in gateway + services.
- **Data stores:** PostgreSQL (transactional), Redis (cache + rate limiting), object storage (S3/Blob) for receipts, queue (Kafka/RabbitMQ/SQS) for async jobs/events.
- **Integration pattern:** Integration Gateway services (anti-corruption layer), not direct calls from core services. Support webhooks + scheduled pull.
- **Observability:** correlation IDs end-to-end (UI → API → async jobs), structured logs, metrics, traces, dashboards/alerts.

---

## 8) Phase-wise Plan

> Durations are estimates; finalize after volume + SLO inputs.

### Phase 0 — Discovery, Environments & Tooling (Est: 2–3 weeks)
**Deliverables:**
- Baseline architecture decisions, repo structure, CI/CD
- Environments (dev/stage/prod), secrets management, baseline observability
- Initial NFR targets: availability, latency, OCR SLA, RPO/RTO

**Tasks (Backend / UI / DevOps / QA):**
- Define tenant model: company isolation strategy (schema-per-tenant vs shared schema with tenant_id), per-tenant config.
- Establish API contract tooling (OpenAPI generation/validation, lint rules, versioning conventions).
- Define eventing approach: queue selection, message envelope, idempotency key standard, DLQ strategy.
- Set up object storage + signed URL strategy + access logging.
- Implement baseline security: secrets vault, KMS keys, rotation policy, least privilege.
- Set up CI/CD pipelines for API, web, and mobile; establish release branching strategy.
- Instrument baseline telemetry: structured logging, metrics, tracing, dashboards skeleton.

**Dependencies:** cloud accounts, SSO provider shortlist, OCR provider shortlist.

**Exit Criteria:** working CI/CD to dev; baseline logging/metrics/tracing; documented initial NFR targets.

---

### Phase 1 — API Contract & Detailed Design (Contract-First) (Est: 3–4 weeks)
**Deliverables:**
- OpenAPI specs for core modules (expense, workflow, policy, receipt, notifications)
- RBAC + tenant permission model, error model, pagination/filtering conventions
- Data model (PostgreSQL) + migration plan

**Tasks:**
- Define core resources/endpoints + schemas; publish OpenAPI with examples.
- Define standard error model (error codes, messages, correlation IDs) and API response envelope.
- Define auth flows (SSO/OIDC/SAML), token/session strategy, and tenant scoping.
- Define RBAC matrix (Employee/Manager/Finance Checker/Payment Initiator/Admin) and authorization checks per endpoint.
- Define workflow engine model: definition/steps/actors/transitions/states; state machine validation.
- Define SLA/escalation model: reminders, delegate approvals, fallback approver rules; audit requirements.
- Define policy engine model: evaluator, priority/conflict resolution, caching, versioning, audit.
- Define multi-currency model: FX provider selection, FX timestamp rule, spot vs corporate rate, locking rules.
- Define GST/tax model: GSTIN validation, CGST/SGST/IGST rules, reconciliation hooks, export formats.
- Define receipt retention policy options + compliance constraints (retention duration, legal hold).

**Dependencies:** product decisions for policies/workflows; compliance inputs.

**Exit Criteria:** signed-off API contracts + data model; security/RBAC defined; workflow + policy designs approved.

---

### Phase 2 — Backend Implementation (Core MVP APIs) (Est: 6–10 weeks)
**Deliverables:**
- Working core expense lifecycle APIs + workflow execution + policy checks
- Multi-company tenancy enforcement
- Audit logging baseline

**Tasks:**
- Implement tenant-aware auth middleware + authorization enforcement in services.
- Implement Expense APIs: draft/create/edit/submit/cancel; report grouping; attachment references.
- Implement Workflow engine runtime: state transitions, approvals, send-back, resubmission.
- Implement escalation jobs: reminders, delegation evaluation, fallback approver triggers.
- Implement Policy engine service: real-time evaluation at create/edit/submit/approve; conflict resolution.
- Implement multi-currency: store original amount/currency, FX rate/source/timestamp, normalized amount.
- Implement audit events (append-only): before/after snapshots for sensitive actions.
- Implement file upload orchestration: signed URLs, metadata records, access checks.
- Implement rate limiting and request validation/sanitization.

**Dependencies:** Phase 1 contracts; infra components.

**Exit Criteria:** end-to-end expense submission + approvals working via APIs; audit trail produced; tenancy isolation tests passing.

---

### Phase 3 — UI Implementation (Web + Mobile) + API Integration (Est: 6–12 weeks, parallelizable)
**Deliverables:**
- Web SPA + Mobile app for core flows integrated with APIs
- Standardized API client layer + auth integration

**Tasks:**
- Implement web and mobile foundations: routing/navigation, theming, session management.
- Implement API client SDKs: typed clients, interceptors, correlation IDs, retries/backoff.
- Implement core screens (web + mobile): expense inbox, create/edit, report submit, approval inbox, approval actions.
- Implement UX states: loading/error/empty, validation errors mapped from API error model.
- Implement delegation + escalation visibility UI (delegated approvals, fallback indicators).
- Implement receipt upload UX: camera/gallery for mobile; multi-upload for web.
- Implement accessibility baseline (web WCAG) and mobile accessibility checks.

**Dependencies:** stable Phase 2 APIs.

**Exit Criteria:** complete core flows on both clients with parity defined; E2E user journeys pass.

---

### Phase 4 — OCR, WhatsApp, Integrations & Reconciliation (Est: 6–12 weeks)
**Deliverables:**
- Receipt OCR pipeline with human correction workflow
- WhatsApp ingestion (if prioritized)
- ERP bi-directional integration and reconciliation
- Corporate card ingestion + matching foundations

**Tasks:**
- Build OCR pipeline: preprocess → OCR → classify → validate → persist; async via queue.
- Add confidence scoring + human correction workflow; re-run OCR support.
- Implement multi-receipt segmentation (OpenCV) and duplicate image detection (perceptual hashing).
- Implement hybrid duplicate detection: exact + fuzzy (Levenshtein) + OCR similarity + image hashing.
- Implement WhatsApp Business ingestion: secure employee linking, media storage, virus scan, async OCR.
- Implement ERP integration gateway: push (expense/export) + pull (status/GL/tax codes) + backfill.
- Add reliability patterns: timeouts, retries, circuit breakers, DLQ, idempotency.
- Implement corporate card transaction ingestion + matching logic (delayed arrivals, partial matches).

**Dependencies:** vendor accounts (OCR/WhatsApp/ERP), security review.

**Exit Criteria:** OCR pipeline meets SLA targets; integration reliability proven in staging; reconciliation flows validated.

---

### Phase 5 — GST Reconciliation, Reporting Exports, Analytics & Hardening (Est: 4–8 weeks)
**Deliverables:**
- GST validation + reconciliation workflows
- Reporting exports
- Analytics dashboards with scalable aggregation
- Security hardening + performance benchmarks

**Tasks:**
- Implement GST validations (GSTIN, tax breakup rules) and reconciliation checks.
- Implement GST reporting exports (format and schedule per compliance needs).
- Implement analytics: aggregates/materialized views or reporting DB; avoid heavy queries on OLTP.
- Performance testing: API latency/throughput, OCR throughput, dashboard load times.
- Security testing: OWASP, authz bypass attempts, secrets scanning, dependency audits.
- Implement DR strategy: backups, restore drills, RPO/RTO validation.

**Dependencies:** compliance sign-off; NFR target finalization.

**Exit Criteria:** compliance exports validated; performance targets met; DR drill successful.

---

### Phase 6 — Release, Rollout & Post-Release Operations (Est: 2–4 weeks then ongoing)
**Deliverables:**
- Production rollout plan with canary/phased enablement
- Runbooks, on-call readiness, post-release monitoring

**Tasks:**
- Define rollout plan per tenant/company; feature flags for risky modules (OCR/WhatsApp/integrations).
- Implement canary releases + progressive rollout; tenant-level enablement.
- Publish runbooks: incident response, integration failure handling, OCR backlog handling.
- Monitor KPIs: API errors, latency, OCR queue depth, UI crash/error rate.
- Establish bugfix SLA and iteration plan.

**Exit Criteria:** stable production metrics; documented operational playbooks; support processes active.

---

## 9) Acceptance Criteria (Gherkin where possible)
- Given a user belongs to Company A, when they access expenses for Company B, then access is denied and an audit event is recorded.
- Given an expense is submitted, when an approver approves it, then the workflow transitions to the next valid state and the action is audited.
- Given SLA escalation rules are configured, when an approval is pending beyond the threshold, then reminders are sent and fallback approver rules are applied.
- Given a policy violation occurs, when an expense is created/edited/submitted/approved, then the policy engine returns deterministic results with conflict resolution and the outcome is stored/audited.
- Given a receipt is uploaded, when OCR confidence is below threshold, then the receipt is routed to human correction workflow.
- Given an ERP push fails transiently, when retries are exhausted, then the message is moved to DLQ and operators are alerted.

## 10) API Acceptance Criteria (must include)
- OpenAPI is published and validated in CI.
- Standard error model is used across endpoints.
- AuthN/AuthZ and tenant scoping are enforced and tested.
- Versioning/deprecation strategy is documented.
- Idempotency is implemented for mutation endpoints where retries are expected.

## 11) Testing Strategy
- **Unit:** backend business rules, workflow transitions, policy evaluator, GST validations; UI components and state.
- **Contract:** OpenAPI schema validation; backward compatibility checks.
- **Integration:** API + DB; integration gateways with mocked vendors.
- **E2E:** web + mobile → API → DB; approval flows; escalation flows.
- **Performance:** API p95 latency, OCR throughput, dashboard load SLA.
- **Security:** OWASP, authz fuzzing, SAST/DAST, secrets scanning.
- **Accessibility:** web WCAG checks; mobile accessibility audits.

## 12) Observability
- **Logs:** structured JSON logs with correlation IDs; PII redaction.
- **Metrics:** RED/USE metrics per service; queue depth; OCR failure rates.
- **Traces:** distributed tracing across API + async jobs.
- **Dashboards/Alerts:** SLA/SLO dashboards; DLQ alerts; integration failure alerts.

## 13) Security & Compliance
- SSO (SAML/OIDC) integration; MFA if mandated.
- RBAC + tenant isolation enforcement.
- Encryption at rest (KMS) for receipts and sensitive finance/tax fields.
- Security audit logs (auth events, permission changes, admin actions).
- Data retention and legal hold support.

## 14) Risks & Mitigations
- **OCR reliability:** confidence scoring + manual correction + monitoring.
- **Workflow complexity:** configurable state machine + exhaustive transition tests.
- **Policy conflicts:** priority resolver + deterministic outcomes + version pinning.
- **Integration failures:** gateway + retries/DLQ/idempotency + circuit breakers.
- **Analytics performance:** aggregates/reporting store rather than OLTP heavy queries.

## 15) Rollout Plan
- Feature flags per module (OCR, WhatsApp, ERP sync, cards).
- Tenant-by-tenant onboarding with canary.
- Progressive rollout with monitoring gates.

## 16) Rollback Plan
- Blue/green or versioned deployments for services.
- Database migrations with rollback strategy (expand/contract pattern).
- Disable risky features via flags; drain queues safely.

## 17) Definition of Done
- Contracts implemented and tested.
- Web + mobile flows working end-to-end.
- Security controls implemented and verified.
- Observability dashboards/alerts live.
- Documentation/runbooks published.
- Performance + DR tests executed to targets.

## 18) Open Questions
- Confirm expected volumes: tenants, users, expenses/day, receipts/day, OCR/day, peak concurrency.
- Finalize availability target (99.9% vs 99.99%) and RPO/RTO targets.
- Confirm receipt retention duration and legal/compliance constraints.
- Confirm ERP(s) and data mappings (GL codes, tax codes, cost centers) and sync cadence.
- Confirm mobile offline requirements for day-1 vs post-MVP.
````
