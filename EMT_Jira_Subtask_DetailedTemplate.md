````markdown
# Jira Subtask — EMT Expense Management Platform

## Overview
This document provides a **detailed, production-ready Jira Subtask template** for the EMT Expense Management platform. Engineering teams can use this directly for sprint planning and implementation.

---

# Jira Subtask #1: Implement Expense Lifecycle APIs (draft/create/edit/submit/cancel)

## 1) Title:
**Implement Expense lifecycle APIs (draft/create/edit/submit/cancel) with validation, policy evaluation hooks, and audit events**

## 2) Issue Type:
**Sub-task**

## 3) Parent:
**EMT Expense Management Module — Phase-wise Technical Implementation (API-first + Web + Mobile)**  
*Parent Epic: [LINK]*

## 4) Priority:
**High**

## 5) Labels/Tags:
`backend`, `api`, `expense-core`, `phase-2`, `rest-api`, `openapi-contract`

---

## 6) Summary:
Build MVP Expense lifecycle endpoints supporting draft/create/edit/submit/cancel operations with full validation, optimistic concurrency control, policy evaluation hooks, and immutable audit trail. All endpoints must include pagination/filtering/sorting, standard error responses, correlation IDs, and rate limiting.

---

## 7) Technical Description:

### Background:
The Expense entity is the central domain object in EMT. It represents a single expense claim with metadata (amount, currency, category, receipt references), status tracking, and full audit history. This subtask implements the REST API layer for managing expense lifecycle from creation to submission.

### Problem Statement:
Without a well-designed, contract-first API, frontend teams cannot reliably interact with the backend, and integrations become brittle. The expense API must support:
- **Multi-company tenancy:** Every expense is scoped to a tenant (company).
- **Optimistic concurrency:** Multiple users may edit the same expense; conflicts must be detected and handled gracefully.
- **Policy evaluation:** Certain operations (e.g., submit) must trigger policy validation before state transition.
- **Audit trail:** All state transitions must be recorded for compliance.

### Success Criteria:
- All endpoints conform to OpenAPI contract.
- Optimistic locking prevents lost updates; 409 responses clear.
- Policy evaluation results are stored with the expense.
- Audit events are immutable and queryable.
- Rate limiting is enforced per-tenant.

---

## 8) Scope:

### In Scope:
- Implement 6 core endpoints:
  - `POST /v1/expenses` — Create expense (draft)
  - `GET /v1/expenses` — List expenses (pagination/filter/sort)
  - `GET /v1/expenses/:id` — Fetch single expense
  - `PATCH /v1/expenses/:id` — Update expense fields
  - `POST /v1/expenses/:id/submit` — Submit for approval
  - `POST /v1/expenses/:id/cancel` — Cancel (workflow-aware)
- Input validation (DTOs, ranges, enums, required fields).
- Tenant isolation enforcement (tenant_id in auth context).
- Optimistic concurrency control (version field, 409 handling).
- Domain event emission (notifications, OCR queue jobs).
- Audit event creation (append-only).
- Standard error responses per OpenAPI contract.
- Correlation ID injection and response headers.
- Rate limiting per tenant/user.

### Out of Scope:
- Policy engine implementation (stub only; actual evaluation in separate subtask).
- OCR pipeline (receipts enqueued; OCR worker handles processing).
- Notification dispatch (events emitted; notification service consumes).
- Mobile-specific endpoints (APIs are client-agnostic).
- Advance/reimbursement operations (separate subtasks).

---

## 9) Technical Implementation Details:

### Backend (NestJS + Node.js):

#### Service Architecture:
```
ExpenseModule
├── ExpenseController (HTTP handlers)
├── ExpenseService (business logic)
├── ExpenseRepository (Prisma queries)
├── PolicyEvaluator (policy checks)
├── AuditLogger (append-only events)
└── EventPublisher (BullMQ jobs)
```

#### Key Components:

**1. ExpenseController**
- Routes:
  - `POST /v1/expenses` → `createExpense()`
  - `GET /v1/expenses` → `listExpenses()`
  - `GET /v1/expenses/:id` → `getExpenseById()`
  - `PATCH /v1/expenses/:id` → `updateExpense()`
  - `POST /v1/expenses/:id/submit` → `submitExpense()`
  - `POST /v1/expenses/:id/cancel` → `cancelExpense()`
- Guards: `AuthGuard`, `RolesGuard` (enforce tenant scoping)
- Pipes: `ValidationPipe` (DTO validation)

**2. ExpenseService**
- Manages business logic:
  - Validate state transitions (e.g., only draft → submit, not rejected → submit)
  - Trigger policy evaluations
  - Emit domain events
  - Record audit events
- Methods:
  ```typescript
  createExpense(tenantId, createDto): Promise<ExpenseDto>
  listExpenses(tenantId, query): Promise<PaginatedExpenseDto>
  getExpenseById(tenantId, expenseId): Promise<ExpenseDto>
  updateExpense(tenantId, expenseId, updateDto, version): Promise<ExpenseDto>
  submitExpense(tenantId, expenseId, version): Promise<ExpenseDto>
  cancelExpense(tenantId, expenseId, reason, version): Promise<ExpenseDto>
  ```

**3. ExpenseRepository (Prisma)**
- Encapsulate all DB queries
- Enforce tenant scoping in all WHERE clauses
- Handle optimistic locking (version field)
- Return raw domain objects; service layer handles DTOs

**4. PolicyEvaluator**
- Stub implementation initially (actual engine in separate subtask)
- Interface:
  ```typescript
  evaluate(tenantId, expense, action): Promise<PolicyEvalResult>
  // Returns: { allowed: bool, warnings: [], blocks: [] }
  ```

**5. AuditLogger**
- Append-only writes to `AuditEvent` table
- Store: tenantId, userId, entityType, entityId, action, before/after JSON, timestamp, correlationId
- Methods:
  ```typescript
  log(event: AuditEvent): Promise<void>
  ```

**6. EventPublisher**
- Emit domain events to BullMQ:
  - `expense.created` → trigger OCR for receipts
  - `expense.submitted` → notify approvers
  - `expense.cancelled` → release reserved funds (future)

#### Data Flow Example (Create):
```
POST /v1/expenses
  → AuthGuard (verify JWT + tenant)
  → ValidationPipe (DTO validation)
  → ExpenseController.createExpense()
    → ExpenseService.createExpense()
      → ExpenseRepository.create() [MSSQL INSERT]
      → AuditLogger.log() [audit event]
      → EventPublisher.emit('expense.created')
      → Return ExpenseDto
    → Interceptor adds X-Correlation-Id header
  → 201 Created + ExpenseDto
```

---

### Frontend (React 19 + Material UI):
- **Out of scope for this subtask** but backend must support:
  - Typed API client consumption
  - Loading/error/empty states
  - Retry handling (e.g., on 409, merge conflict dialog)

---

### Database (MSSQL + Prisma):

#### Schema Changes (Prisma):
```prisma
model Expense {
  id            String   @id @default(cuid())
  tenantId      String   
  employeeId    String   
  reportId      String?  
  
  // Core fields
  amount        Decimal  @db.Decimal(18, 2)
  currency      String   @db.Char(3)
  category      String   
  description   String?
  status        String   @default("DRAFT") // DRAFT, SUBMITTED, PENDING_APPROVAL, APPROVED, REJECTED, CANCELLED
  
  // FX fields
  originalAmount     Decimal? @db.Decimal(18, 2)
  originalCurrency   String?  @db.Char(3)
  fxRate            Decimal? @db.Decimal(10, 6)
  fxTimestamp       DateTime?
  fxSource          String?  // "openexchangerates", "xe", etc.
  normalizedAmount  Decimal  @db.Decimal(18, 2)
  
  // Policy evaluation
  policyEvalResult  Json?    // { allowed: bool, warnings: [], blocks: [], timestamp }
  
  // Concurrency
  version           Int      @default(1)
  
  // Audit
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  createdBy         String   
  updatedBy         String   
  
  // Relations
  tenant            Company  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  employee          Employee @relation(fields: [employeeId], references: [id])
  report            ExpenseReport? @relation(fields: [reportId], references: [id])
  receipts          Receipt[]
  approvals         Approval[]
  auditEvents       AuditEvent[]
  
  @@unique([tenantId, id])
  @@index([tenantId, status])
  @@index([tenantId, createdAt])
  @@index([tenantId, employeeId])
}

model Receipt {
  id              String   @id @default(cuid())
  expenseId       String   
  tenantId        String   
  gcsPath         String   
  contentType     String   
  
  ocrStatus       String   @default("PENDING") // PENDING, PROCESSING, SUCCESS, FAILED, NEEDS_REVIEW
  ocrResult       Json?    // { amount, merchant, date, confidence, fields: {} }
  
  createdAt       DateTime @default(now())
  
  expense         Expense  @relation(fields: [expenseId], references: [id], onDelete: Cascade)
  tenant          Company  @relation(fields: [tenantId], references: [id])
  
  @@unique([tenantId, id])
}

model AuditEvent {
  id              String   @id @default(cuid())
  tenantId        String   
  
  entityType      String   // "Expense", "ExpenseReport", etc.
  entityId        String   
  action          String   // "CREATE", "UPDATE", "SUBMIT", "APPROVE"
  
  actor           String   // userId
  before          Json?    // snapshot before
  after           Json?    // snapshot after
  
  correlationId   String   
  timestamp       DateTime @default(now())
  
  @@unique([tenantId, id])
  @@index([tenantId, entityType, entityId])
  @@index([tenantId, timestamp])
}
```

#### Migrations:
- Generate Prisma migration: `prisma migrate dev --name add_expense_schema`
- Verify idempotency and rollback ability

#### Indexes:
- `(tenantId, status)` — for filtering by status
- `(tenantId, createdAt)` — for sorting
- `(tenantId, employeeId)` — for user's own expenses
- AuditEvent: `(tenantId, entityType, entityId)` and `(tenantId, timestamp)`

---

## 10) API Details:

### Endpoint #1: Create Expense
**POST /v1/expenses**

**Request Headers:**
```
Authorization: Bearer <JWT>
X-Correlation-Id: <uuid>
X-Tenant-Id: <tenant-id> [optional; inferred from JWT if not provided]
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 1500.00,
  "currency": "INR",
  "category": "MEALS",
  "description": "Client lunch meeting",
  "receiptFileUrls": [
    "gs://emt-receipts-prod/tenant-123/receipt-abc.jpg"
  ],
  "customFields": {
    "project": "PROJECT-456"
  }
}
```

**Response: 201 Created**
```json
{
  "id": "exp_001",
  "tenantId": "tenant_123",
  "employeeId": "emp_456",
  "amount": 1500.00,
  "currency": "INR",
  "status": "DRAFT",
  "normalizedAmount": 1500.00,
  "version": 1,
  "createdAt": "2026-05-08T10:00:00Z",
  "createdBy": "emp_456",
  "_links": {
    "self": "/v1/expenses/exp_001",
    "submit": "/v1/expenses/exp_001/submit"
  }
}
```

**Validation Rules:**
- `amount` > 0 and ≤ policy max per category
- `currency` is valid ISO 4217 code
- `category` is in predefined enum
- `description` ≤ 500 chars
- `receiptFileUrls` are valid GCS paths

**Error Responses:**
- **400 Bad Request:**
  ```json
  {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "amount", "message": "Must be > 0" },
      { "field": "category", "message": "Invalid category" }
    ],
    "correlationId": "corr_123"
  }
  ```
- **403 Forbidden:**
  ```json
  {
    "code": "FORBIDDEN",
    "message": "Access denied to this tenant",
    "correlationId": "corr_123"
  }
  ```

---

### Endpoint #2: List Expenses
**GET /v1/expenses**

**Query Parameters:**
```
page=1
limit=20
status=DRAFT,SUBMITTED
sortBy=createdAt
sortOrder=desc
employeeId=emp_456
category=MEALS
dateFrom=2026-05-01
dateTo=2026-05-08
```

**Response: 200 OK**
```json
{
  "data": [
    {
      "id": "exp_001",
      "tenantId": "tenant_123",
      "employeeId": "emp_456",
      "amount": 1500.00,
      "currency": "INR",
      "status": "DRAFT",
      "normalizedAmount": 1500.00,
      "createdAt": "2026-05-08T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  },
  "correlationId": "corr_123"
}
```

**Validation:**
- `page` ≥ 1
- `limit` between 1 and 100
- `status` values in enum
- `sortBy` in allowed fields

**Security:**
- Return only expenses for authenticated tenant
- Manager/Finance roles can see subordinates' expenses (RBAC)

---

### Endpoint #3: Get Expense by ID
**GET /v1/expenses/:id**

**Response: 200 OK**
```json
{
  "id": "exp_001",
  "tenantId": "tenant_123",
  "employeeId": "emp_456",
  "amount": 1500.00,
  "currency": "INR",
  "originalAmount": 1500.00,
  "originalCurrency": "INR",
  "fxRate": 1.0,
  "status": "DRAFT",
  "normalizedAmount": 1500.00,
  "category": "MEALS",
  "description": "Client lunch meeting",
  "policyEvalResult": {
    "allowed": true,
    "warnings": [],
    "timestamp": "2026-05-08T10:05:00Z"
  },
  "version": 1,
  "receipts": [
    {
      "id": "rcpt_001",
      "gcsPath": "gs://emt-receipts-prod/tenant-123/receipt-abc.jpg",
      "ocrStatus": "PENDING"
    }
  ],
  "approvals": [],
  "createdAt": "2026-05-08T10:00:00Z",
  "updatedAt": "2026-05-08T10:00:00Z",
  "_links": {
    "self": "/v1/expenses/exp_001",
    "update": "/v1/expenses/exp_001",
    "submit": "/v1/expenses/exp_001/submit"
  }
}
```

**Error Responses:**
- **404 Not Found:**
  ```json
  {
    "code": "NOT_FOUND",
    "message": "Expense not found",
    "correlationId": "corr_123"
  }
  ```

---

### Endpoint #4: Update Expense
**PATCH /v1/expenses/:id**

**Request Headers:**
```
If-Match: <version> [optimistic locking]
```

**Request Body:**
```json
{
  "amount": 1600.00,
  "description": "Client lunch meeting (revised)",
  "category": "MEALS"
}
```

**Response: 200 OK**
```json
{
  "id": "exp_001",
  "amount": 1600.00,
  "version": 2,
  "updatedAt": "2026-05-08T10:10:00Z",
  ...
}
```

**Validation:**
- Only DRAFT expenses can be updated
- `version` header must match current; reject if mismatch

**Error Responses:**
- **409 Conflict:**
  ```json
  {
    "code": "CONFLICT",
    "message": "Resource was modified; your version is outdated",
    "currentVersion": 2,
    "correlationId": "corr_123"
  }
  ```

---

### Endpoint #5: Submit Expense
**POST /v1/expenses/:id/submit**

**Request Body:**
```json
{
  "reportId": "report_789",
  "comment": "Please review"
}
```

**Response: 200 OK**
```json
{
  "id": "exp_001",
  "status": "SUBMITTED",
  "version": 2,
  "submittedAt": "2026-05-08T10:15:00Z",
  "policyEvalResult": {
    "allowed": true,
    "warnings": [],
    "timestamp": "2026-05-08T10:15:00Z"
  },
  "_links": {
    "approvals": "/v1/expenses/exp_001/approvals"
  }
}
```

**Validation:**
- Only DRAFT expenses can be submitted
- All required fields populated
- Policy evaluation passes (or warnings accepted)

**Business Logic:**
1. Trigger policy evaluation (stub for now)
2. If blocked, return 400 with policy result
3. If warnings, allow submit but return warnings
4. Transition status to SUBMITTED
5. Emit domain event `expense.submitted` (notifies approvers)
6. Create audit event

**Error Responses:**
- **400 Bad Request (Policy Blocked):**
  ```json
  {
    "code": "POLICY_VIOLATION",
    "message": "Expense violates policy",
    "policyResult": {
      "allowed": false,
      "blocks": [
        { "rule": "MAX_DAILY_MEALS", "message": "Daily limit exceeded" }
      ]
    },
    "correlationId": "corr_123"
  }
  ```

---

### Endpoint #6: Cancel Expense
**POST /v1/expenses/:id/cancel**

**Request Body:**
```json
{
  "reason": "Submitted by mistake",
  "version": 2
}
```

**Response: 200 OK**
```json
{
  "id": "exp_001",
  "status": "CANCELLED",
  "version": 3,
  "cancelledAt": "2026-05-08T10:20:00Z"
}
```

**Validation:**
- Expense not already CANCELLED or REIMBURSED
- Only creator can cancel (unless Finance role)
- Reason required if SUBMITTED or later

**Business Logic:**
1. Validate state transition
2. Update status to CANCELLED
3. Emit domain event `expense.cancelled`
4. Create audit event

---

## 11) Validation Rules:

### Input Validation (DTOs):
```typescript
class CreateExpenseDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(1000000)
  amount: number;

  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/)
  currency: string;

  @IsString()
  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @IsOptional()
  receiptFileUrls?: string[];
}

class UpdateExpenseDto extends PartialType(CreateExpenseDto) {
  @IsInt()
  @Min(1)
  version: number;
}
```

### Business Logic Validation:
- Expense amount must be > 0
- Currency must be valid ISO 4217
- Category must be in allowed enum
- Only DRAFT expenses can be edited
- Only Draft/Submitted expenses can be cancelled
- Receipt URLs must be valid GCS paths

---

## 12) Error Handling Requirements:

### Standard Error Response Structure:
```json
{
  "code": "ERROR_CODE",
  "message": "Human readable message",
  "details": [
    { "field": "fieldName", "message": "reason" }
  ],
  "correlationId": "corr_123",
  "timestamp": "2026-05-08T10:00:00Z"
}
```

### Error Codes (map to HTTP status):
| Code | HTTP | Scenario |
|------|------|----------|
| `VALIDATION_ERROR` | 400 | Invalid input |
| `POLICY_VIOLATION` | 400 | Policy blocks action |
| `UNAUTHORIZED` | 401 | Missing/invalid JWT |
| `FORBIDDEN` | 403 | Cross-tenant access; insufficient role |
| `NOT_FOUND` | 404 | Expense doesn't exist |
| `CONFLICT` | 409 | Version mismatch (optimistic lock) |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit hit |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Handling Strategy:
- Catch all errors in global exception filter
- Log error + correlationId
- Return standardized error response
- Never leak stack traces or PII in response

---

## 13) Logging & Observability Requirements:

### Structured Logging (JSON):
```json
{
  "timestamp": "2026-05-08T10:00:00Z",
  "level": "INFO",
  "correlationId": "corr_123",
  "service": "expense-api",
  "action": "create_expense",
  "tenantId": "tenant_123",
  "userId": "emp_456",
  "method": "POST",
  "path": "/v1/expenses",
  "status": 201,
  "duration_ms": 150,
  "message": "Expense created successfully"
}
```

### Log Levels:
- **INFO:** Normal operations (create, list, submit)
- **WARN:** Policy warnings, validation warnings
- **ERROR:** Policy blocks, not found, internal errors
- **DEBUG:** SQL queries (dev only), full payloads

### Key Metrics (Prometheus):
```
emt_expense_requests_total{method, status, endpoint}
emt_expense_latency_ms{percentile}
emt_expense_created_total{tenant_id}
emt_expense_submitted_total{tenant_id}
emt_policy_evaluation_failures_total{tenant_id, rule}
emt_optimistic_lock_conflicts_total{tenant_id}
```

### Tracing (OpenTelemetry):
- Span per HTTP request: `POST /v1/expenses`
- Child spans: database, policy evaluation, event publishing
- Propagate trace context to async jobs

### Correlation ID:
- Generate if missing: `X-Correlation-Id` header
- Propagate to all logs, metrics, traces
- Include in error responses
- Use for customer support lookups

---

## 14) Security Considerations:

### Authentication:
- Require valid JWT on all endpoints
- Verify issuer and audience
- Extract `tenantId`, `userId`, `roles` from JWT claims

### Authorization:
- Enforce tenant scoping (DENY-BY-DEFAULT)
- Employees see only own expenses (unless manager/finance)
- Managers see team expenses
- Finance sees all expenses
- Implement via `@RequireRoles()` decorator

### Input Validation:
- Whitelist allowed fields; reject unknowns
- Validate data types, ranges, formats
- Sanitize strings (no SQL injection, XSS)
- Limit payload size (e.g., 5MB for receipts)

### Data Protection:
- Do NOT log sensitive fields: amounts (PII), receipt content
- Use redaction middleware
- Encrypt receipts in storage (KMS)
- No plaintext passwords/tokens in code

### Audit & Compliance:
- Every write operation creates audit event
- Immutable append-only audit logs
- Audit events include actor, action, before/after
- Query audit logs for compliance investigations

### Rate Limiting:
- Per-tenant: 1000 requests/hour
- Per-user: 100 requests/minute
- Endpoint-specific limits for risky ops (submit: 10/minute)

---

## 15) Dependencies:

### Internal Services/Modules:
1. **AuthGuard** — JWT validation and user context injection
2. **RolesGuard** — RBAC enforcement
3. **TenantContext** — Tenant scoping middleware
4. **PolicyEvaluator** (stub) — Policy evaluation interface
5. **AuditLogger** — Append-only audit event recording
6. **EventPublisher** (BullMQ) — Domain event emission
7. **ExpenseRepository** (Prisma) — Data access layer

### External Dependencies:
- **Prisma ORM** — Database access
- **NestJS** — HTTP framework
- **BullMQ** — Task queue
- **GCP Secret Manager** — Configuration secrets

### Database:
- MSSQL instance deployed and accessible
- `Expense`, `Receipt`, `AuditEvent` tables created via migration

### Configuration:
- `JWT_ISSUER`, `JWT_AUDIENCE` in Secret Manager
- Database connection string

### Third-Party APIs:
- None directly in this subtask (policy engine and OCR are separate)

---

## 16) Acceptance Criteria:

### Functional:
- **Given** I am an authenticated employee in Company A
  **When** I `POST /v1/expenses` with valid data
  **Then** the response is `201 Created` with the expense in `DRAFT` status

- **Given** I am an employee with a draft expense
  **When** I `PATCH /v1/expenses/:id` with updated amount and correct version
  **Then** the expense is updated and version increments

- **Given** I am an employee with a draft expense
  **When** I `POST /v1/expenses/:id/submit`
  **Then** the status transitions to `SUBMITTED` and approvers are notified

- **Given** I am an authenticated employee
  **When** I `GET /v1/expenses?status=SUBMITTED&sortBy=createdAt&sortOrder=desc`
  **Then** the response includes pagination metadata and correctly sorted results

- **Given** Two concurrent requests update the same expense with different versions
  **When** the second request arrives
  **Then** the response is `409 Conflict` with the current version

- **Given** I am an employee in Company A trying to access an expense in Company B
  **When** I `GET /v1/expenses/exp_company_b`
  **Then** the response is `403 Forbidden` and an audit event is logged

### Non-Functional:
- API response time < 200ms (p95) for single expense GET
- List endpoint < 500ms (p95) for 1000-expense scan
- All requests include `X-Correlation-Id` in response
- All errors follow standard error envelope

### Quality:
- Test coverage > 90% (unit + integration)
- All endpoints have OpenAPI specs with examples
- No sensitive data in logs or error responses
- All database queries use parameterized statements

---

## 17) Testing Requirements:

### Unit Tests (Jest):
**File:** `src/modules/expense/expense.service.spec.ts`

```typescript
describe('ExpenseService', () => {
  describe('createExpense', () => {
    it('should create expense in DRAFT status', async () => {
      // Arrange
      const tenantId = 'tenant_123';
      const createDto = { amount: 100, currency: 'INR', category: 'MEALS' };
      
      // Act
      const result = await service.createExpense(tenantId, createDto);
      
      // Assert
      expect(result.status).toBe('DRAFT');
      expect(result.version).toBe(1);
    });

    it('should reject invalid amount', async () => {
      // Arrange
      const createDto = { amount: 0, currency: 'INR', category: 'MEALS' };
      
      // Act & Assert
      await expect(service.createExpense(tenantId, createDto))
        .rejects
        .toThrow(ValidationException);
    });
  });

  describe('submitExpense', () => {
    it('should transition DRAFT to SUBMITTED', async () => {
      // Test state transition logic
    });

    it('should emit expense.submitted event', async () => {
      // Test event publishing
    });
  });

  describe('updateExpense', () => {
    it('should reject update if version mismatch', async () => {
      // Test optimistic locking
    });
  });
});
```

### Integration Tests (Jest + Supertest):
**File:** `src/modules/expense/expense.controller.spec.ts`

```typescript
describe('ExpenseController (Integration)', () => {
  describe('POST /v1/expenses', () => {
    it('should create expense and return 201', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/expenses')
        .set('Authorization', `Bearer ${validJwt}`)
        .send({ amount: 100, currency: 'INR', category: 'MEALS' })
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.status).toBe('DRAFT');
    });

    it('should reject cross-tenant access', async () => {
      await request(app.getHttpServer())
        .post('/v1/expenses')
        .set('Authorization', `Bearer ${otherTenantJwt}`)
        .send(createDto)
        .expect(403);
    });
  });

  describe('GET /v1/expenses', () => {
    it('should list with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/expenses?page=1&limit=10')
        .set('Authorization', `Bearer ${validJwt}`)
        .expect(200);

      expect(response.body.pagination).toBeDefined();
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });
  });
});
```

### E2E Tests (Playwright):
**File:** `e2e/expense-lifecycle.spec.ts`

```typescript
test.describe('Expense Lifecycle', () => {
  test('should create, edit, and submit expense', async ({ page, authenticatedContext }) => {
    // 1. Navigate to expense creation
    // 2. Fill form with valid data
    // 3. Submit and verify redirect to expense detail
    // 4. Edit expense and verify update
    // 5. Submit and verify status change
  });

  test('should show policy warning on submit', async ({ page }) => {
    // Create high-value expense
    // Submit and verify warning dialog
    // Accept warning and submit
  });
});
```

### Contract Tests (Pact):
- Consumer: web/mobile clients
- Provider: expense API
- Verify request/response formats match OpenAPI

### Performance Tests (k6):
```javascript
import http from 'k6/http';

export default function () {
  http.get('http://localhost:3000/v1/expenses?page=1&limit=100', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

export const options = {
  vus: 50,
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};
```

---

## 18) Story Points:
**8 points**

### Rationale:
- **6 endpoints** with overlapping concerns (auth, validation, tenancy)
- **Optimistic locking** requires careful testing
- **Audit logging** adds complexity
- **Domain events** integration with BullMQ
- **Comprehensive testing** (unit + integration + E2E)
- **Well-defined OpenAPI contract** exists (reduces scope)

**Time estimate:** 8–10 business days for experienced team

---

## 19) Definition of Done:

### Code:
- [ ] All 6 endpoints implemented per OpenAPI spec
- [ ] All DTOs with validation decorators
- [ ] Global exception filter + standard error responses
- [ ] Correlation ID injection + propagation
- [ ] Rate limiting middleware applied

### Testing:
- [ ] Unit tests > 90% coverage (expense.service, expense.repository)
- [ ] Integration tests for all 6 endpoints + RBAC + 409 conflict
- [ ] E2E test for full create → submit flow
- [ ] Performance test confirms p95 latency targets
- [ ] All tests passing in CI

### Database:
- [ ] Prisma migration created and tested
- [ ] Schema includes tenantId, version, audit fields
- [ ] Indexes created per design
- [ ] Rollback tested

### Documentation:
- [ ] OpenAPI spec updated to match implementation
- [ ] README with endpoint examples
- [ ] Error codes documented
- [ ] Runbook for common issues (409 conflict, validation errors)

### Observability:
- [ ] Structured logging in place (JSON, correlation IDs)
- [ ] Prometheus metrics registered
- [ ] OpenTelemetry spans configured
- [ ] Dashboards/alerts created for key metrics

### Security:
- [ ] Auth tests confirm JWT validation
- [ ] RBAC tests confirm cross-tenant rejection
- [ ] Input validation tests for injection attacks
- [ ] PII redaction in logs confirmed
- [ ] Rate limiting tested

### Deployment:
- [ ] Code reviewed and approved
- [ ] Merged to main branch
- [ ] Docker image built and pushed
- [ ] Deployed to dev environment
- [ ] Smoke tests passing in dev

---

## 20) Rollback Plan:

### Deployment Rollback:
- If critical bug post-deploy, revert commit or trigger previous image version
- Database: migrations are idempotent; no data loss expected

### Feature Rollback:
- Use feature flag `EXPENSE_API_ENABLED` to disable endpoints if needed
- No customer impact if flagged off before public release

### Data Rollback:
- Audit trail immutable; can query historical states
- If corrupt expense created, mark as CANCELLED (no delete)

---

## 21) Known Risks & Mitigations:

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Optimistic locking conflicts under high concurrency | Medium | Load test; document 409 handling in UI |
| Policy evaluation performance if complex rules | High | Implement policy engine caching (separate subtask) |
| Audit log disk usage growth | Medium | Implement retention/archival policy (separate subtask) |
| Cross-tenant data leak | Critical | Unit tests with cross-tenant assertions; code review |

---

## 22) Success Metrics:

- [ ] All endpoints passing contract tests
- [ ] p95 latency < 200ms (single) < 500ms (list)
- [ ] Zero 500 errors in production
- [ ] Audit trail 100% coverage
- [ ] Rate limiting effective (no DDoS)
- [ ] Web UI successfully consumes APIs without retry storms

````
