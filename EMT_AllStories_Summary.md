````markdown
# Jira Stories Summary — All Generated Stories Ready for Jira

**Date:** 2026-05-08  
**Status:** ✅ Complete — 4 Production-Ready Stories Generated

---

## 📋 Stories Generated

### Story 1: Implement Expense Lifecycle APIs ✅ (Already in Jira)
**File:** `EMT_Jira_Subtask_DetailedTemplate.md`  
**Story Points:** 8  
**Phase:** Phase 2 (Backend Implementation)  
**Complexity:** High  
**Status:** Created in Jira

---

### Story 2: Implement Policy Engine Service ⭐ NEW
**File:** `EMT_Story_PolicyEngine.md`  
**Direct Link:** https://github.com/mishra-umesh/Copliot/blob/main/EMT_Story_PolicyEngine.md  
**Title:** Implement Policy Engine service (evaluation + conflict resolution + versioning)  
**Story Points:** 8  
**Phase:** Phase 2 (Backend Implementation)  
**Complexity:** High  

**Key Deliverables:**
- Rule evaluator (deterministic evaluation)
- Conflict resolver (priority-based merging)
- Policy caching (Redis)
- Policy versioning (immutable snapshots)
- 6 API endpoints (create, list, evaluate, activate, audit)

**Technical Scope:**
- RuleEvaluator service
- ConflictResolver logic
- Redis caching strategy
- Prisma schema (Policy, PolicyVersion, PolicyAuditEvent)
- BDD acceptance criteria

**Acceptance Criteria Highlights:**
```
✓ Deterministic evaluation (same input = same output)
✓ Conflict resolution works via priority system
✓ p95 evaluation latency < 50ms
✓ Cache hit rate > 95%
✓ All changes auditable
```

---

### Story 3: Implement Workflow Engine ⭐ NEW
**File:** `EMT_Story_WorkflowEngine.md`  
**Direct Link:** https://github.com/mishra-umesh/Copliot/blob/main/EMT_Story_WorkflowEngine.md  
**Title:** Implement Workflow Engine service (state machine + approval lifecycle + SLA escalation)  
**Story Points:** 8  
**Phase:** Phase 2 (Backend Implementation)  
**Complexity:** High  

**Key Deliverables:**
- State machine (valid transitions)
- Approval task management
- SLA/escalation jobs (BullMQ)
- Delegation logic
- Send-back + resubmit workflows

**Technical Scope:**
- StateMachine validation
- ApprovalManager service
- SLAManager (BullMQ jobs)
- Prisma schema (Workflow, WorkflowInstance, Approval, WorkflowTransition)
- 6 API endpoints (approve, reject, send-back, delegate, list, history)

**Acceptance Criteria Highlights:**
```
✓ Invalid transitions rejected (409)
✓ SLA reminders sent on time
✓ Escalation rules applied deterministically
✓ Delegation works correctly
✓ All transitions audited with timestamps + actors
```

---

### Story 4: Implement OCR Integration ⭐ NEW
**File:** `EMT_Story_OCRIntegration.md`  
**Direct Link:** https://github.com/mishra-umesh/Copliot/blob/main/EMT_Story_OCRIntegration.md  
**Title:** Implement OCR integration with Google Document AI (async pipeline + human correction)  
**Story Points:** 8  
**Phase:** Phase 4 (OCR, WhatsApp, Integrations)  
**Complexity:** High  

**Key Deliverables:**
- Google Document AI integration
- Async BullMQ worker for OCR jobs
- Image preprocessing (orientation, resize)
- Confidence scoring + low-confidence routing
- Manual correction workflow
- Retry mechanism (exponential backoff + DLQ)

**Technical Scope:**
- DocumentAIClient wrapper
- ImagePreprocessor service
- OCRWorker (BullMQ)
- Prisma schema (ReceiptOCR, OCRAuditEvent)
- 4 API endpoints (enqueue, get result, correct, status)

**Acceptance Criteria Highlights:**
```
✓ OCR completes in < 2 minutes (p95)
✓ Confidence scoring accurate
✓ Retry mechanism handles transient failures
✓ Low-confidence receipts routed to manual review
✓ Corrections reduce re-submission rate
```

---

## 🎯 How to Create These Stories in Jira

### For Each Story:

**Step 1: Copy from GitHub**
```
Open: https://github.com/mishra-umesh/Copliot/blob/main/EMT_Story_[Name].md
```

**Step 2: In Jira, click "Create Issue"**
```
Issue Type: Story
Project: EMT
Parent Epic: EMT Expense Management Module
```

**Step 3: Fill in Fields**

| Field | Source (from MD) |
|-------|------------------|
| **Summary** | Title (section 1) |
| **Description** | Sections 6-8 (Summary + Technical Description + Scope) |
| **Story Points** | Section 18 (8 points for all) |
| **Priority** | High |
| **Labels** | From section 5 (e.g., backend, policy-engine, phase-2) |
| **Acceptance Criteria** | Section 17 (copy all criteria) |

**Step 4: Click "Create"**

---

## 📊 Story Breakdown

| Story | Points | Phase | Complexity | Dependencies |
|-------|--------|-------|-----------|--------------|
| Expense APIs | 8 | 2 | High | None (foundational) |
| Policy Engine | 8 | 2 | High | Expense APIs |
| Workflow Engine | 8 | 2 | High | Expense APIs, Policy Engine |
| OCR Integration | 8 | 4 | High | Expense APIs, Receipt storage |

**Total:** 32 story points (4 weeks for team of 2-3 engineers)

---

## 🚀 Recommended Sprint Planning

### Sprint 1 (Week 1-2):
- ✅ **Expense Lifecycle APIs** (8 points)
- ✅ **Policy Engine** (8 points)
- **Total:** 16 points

### Sprint 2 (Week 3-4):
- ✅ **Workflow Engine** (8 points)
- ✅ **OCR Integration** (8 points)
- **Total:** 16 points

---

## 🎓 Team Assignment Recommendation

| Role | Story | Reason |
|------|-------|--------|
| **Backend Lead** | Expense APIs | Foundational; unblocks others |
| **Mid-level Backend** | Policy Engine | Complex logic; mentorship opportunity |
| **Senior Backend** | Workflow Engine | State machine expertise needed |
| **Backend + DevOps** | OCR Integration | Async + infrastructure knowledge |

---

## ✅ What Each Story Contains

### Every Story Includes:

✅ **20 Detailed Sections:**
1. Title
2. Issue Type
3. Parent Epic
4. Priority
5. Labels
6. Summary
7. Technical Description
8. Scope (in/out)
9. Technical Implementation Details
10. API Details (endpoints, schemas, validation)
11. Database Changes (Prisma models, migrations)
12. Error Handling
13. Logging & Observability (JSON logs, metrics, traces)
14. Security Considerations (auth, RBAC, encryption)
15. Dependencies
16. Acceptance Criteria (Gherkin BDD format)
17. Testing Requirements (unit, integration, E2E, performance)
18. Story Points
19. Definition of Done (checklist)
20-22. Additional: Rollback Plan, Risks & Mitigations, Success Metrics

✅ **Production-Grade Content:**
- Concrete API endpoint examples
- Complete Prisma schema
- Test code examples (Jest, Supertest, k6)
- Error codes mapping
- Observability (metrics, logs, traces)
- Security requirements

---

## 📥 Copy Stories to Jira: Step-by-Step

### Copy Policy Engine Story:

1. **Open:** https://github.com/mishra-umesh/Copliot/blob/main/EMT_Story_PolicyEngine.md

2. **Copy to Jira Description:**
   - Section 1: Title → **Summary field**
   - Sections 6-8 → **Description field**
   - Section 16 → **Acceptance Criteria field**
   - Section 17 → **Testing field** (or description)

3. **Set Fields:**
   - Story Points: **8**
   - Priority: **High**
   - Labels: `backend`, `policy-engine`, `phase-2`, `rules-engine`
   - Parent: **EMT Expense Management Module**

4. **Click "Create"**

---

### Repeat for Each Story:
```
Workflow Engine → EMT_Story_WorkflowEngine.md
OCR Integration → EMT_Story_OCRIntegration.md
```

---

## 📋 All Available Documents in Repository

| Document | Purpose | Link | Status |
|----------|---------|------|--------|
| **Epic** | 6-phase roadmap | [View](https://github.com/mishra-umesh/Copliot/blob/main/EMT_Expense_Management_Jira_Epic.md) | ✅ |
| **Story: Expense APIs** | Lifecycle APIs (8 points) | [View](https://github.com/mishra-umesh/Copliot/blob/main/EMT_Jira_Subtask_DetailedTemplate.md) | ✅ In Jira |
| **Story: Policy Engine** | Policy evaluation (8 points) | [View](https://github.com/mishra-umesh/Copliot/blob/main/EMT_Story_PolicyEngine.md) | ⭐ NEW |
| **Story: Workflow Engine** | Approvals + SLA (8 points) | [View](https://github.com/mishra-umesh/Copliot/blob/main/EMT_Story_WorkflowEngine.md) | ⭐ NEW |
| **Story: OCR Integration** | Document AI (8 points) | [View](https://github.com/mishra-umesh/Copliot/blob/main/EMT_Story_OCRIntegration.md) | ⭐ NEW |
| **Summary & Links** | Quick reference | [View](https://github.com/mishra-umesh/Copliot/blob/main/EMT_Tasks_Summary_and_Links.md) | ✅ |
| **MD Mapping Guide** | Which sections → Jira fields | [View](https://github.com/mishra-umesh/Copliot/blob/main/EMT_Jira_MD_Mapping_Guide.md) | ✅ |

---

## 🚀 Next Actions

### Immediate (Today):
```
1. Create 3 new stories in Jira (Policy, Workflow, OCR)
2. Assign to team members
3. Add to sprint planning
```

### This Week:
```
1. Backend team reviews story details
2. Q&A clarification (tag me in comments)
3. Start Sprint 1 (Expense APIs + Policy Engine)
```

### Next Week:
```
1. Code review gates
2. PR quality checks
3. Move stories to In Progress
```

---

## 📞 Questions?

If you need:
- **More stories:** ERP Integration, Frontend components, Database, DevOps, etc.
- **Clarification:** On any technical detail or acceptance criteria
- **Modification:** To any story details

**Just reply with what you need!** 🎯

---

## ✅ Summary

You now have:

| Item | Count | Status |
|------|-------|--------|
| **EPIC** | 1 | ✅ Created in Jira |
| **Stories** | 4 | ✅ 3 NEW ready to create |
| **Story Points** | 32 | ✅ 4 weeks work |
| **Sprints** | 2 | ✅ Recommended plan |
| **Documentation** | 7 files | ✅ All in GitHub |

---

**All stories are production-grade and ready for sprint planning!** 🚀

To create stories in Jira:
1. Open each MD file
2. Copy sections to Jira form
3. Click "Create"
4. Link to Epic
5. Assign to team

**Ready to proceed?** 👍

````
