# SGM (Sales Governance Manager) - Backlog

## Knowledge Base Documentation

**Priority:** Low | **Status:** Stub files created | **Created:** 2026-01-17

### Overview

KB stub files exist for all 70 routes in SGM. These need to be fleshed out with actual documentation.

### Tasks

All KB stubs are located in `knowledge/ui/pages/` with status `stub` in their frontmatter.

#### Core Dashboard (7 pages)
- [ ] `/` - Home page
- [x] `/dashboard` - Main dashboard ✅
- [ ] `/pulse` - Activity pulse/dashboard
- [ ] `/analytics` - Analytics overview
- [ ] `/reports` - Reports
- [ ] `/search` - Global search
- [ ] `/notifications` - Notifications

#### Plans & Policies (11 pages)
- [ ] `/plans` - Plan list
- [ ] `/plans/[id]` - Plan detail
- [ ] `/plans/new` - Create new plan
- [ ] `/plans/document/[planCode]` - Plan document
- [ ] `/plans/remediation/[planCode]` - Plan remediation
- [ ] `/policies` - Policies list
- [ ] `/documents` - Document list
- [ ] `/documents/[id]` - Document detail
- [ ] `/documents/[id]/versions` - Document versions
- [ ] `/documents/library` - Document library
- [ ] `/documents/new` - Create new document
- [ ] `/documents/upload` - Upload document

#### Governance (9 pages)
- [ ] `/governance-framework` - Governance framework
- [ ] `/governance-framework/[id]` - Framework detail
- [ ] `/governance-framework/primer` - Framework primer
- [ ] `/governance-matrix` - Governance matrix
- [ ] `/governance/upload` - Upload governance docs
- [ ] `/framework` - Framework
- [ ] `/framework/primer` - Framework primer
- [ ] `/committees` - Committees
- [ ] `/decisions` - Decisions

#### Workflow (7 pages)
- [ ] `/approvals` - Approvals list
- [ ] `/approvals/[id]` - Approval detail
- [ ] `/cases` - Cases list
- [ ] `/cases/analytics` - Case analytics
- [ ] `/cases/sla` - Case SLA tracking
- [ ] `/tasks` - Task management
- [ ] `/calendar` - Calendar

#### Client Management (7 pages)
- [ ] `/client/[tenantSlug]` - Client overview
- [ ] `/client/[tenantSlug]/coverage` - Client coverage
- [ ] `/client/[tenantSlug]/gaps` - Client gaps
- [ ] `/client/[tenantSlug]/plans` - Client plans
- [ ] `/client/[tenantSlug]/policies` - Client policies
- [ ] `/client/[tenantSlug]/roadmap` - Client roadmap
- [ ] `/compare` - Compare clients

#### Templates (6 pages)
- [ ] `/templates` - Template list
- [ ] `/templates/[id]` - Template detail
- [ ] `/templates/builder` - Template builder
- [ ] `/templates/import` - Import template
- [ ] `/templates/new` - Create new template
- [ ] `/demo-library` - Demo library

#### Operations (9 pages)
- [ ] `/operate` - Operations
- [ ] `/oversee` - Oversight
- [ ] `/design` - Design
- [ ] `/dispute` - Disputes
- [ ] `/compliance` - Compliance
- [ ] `/audit` - Audit
- [ ] `/links` - Links
- [ ] `/settings` - Settings
- [ ] `/settings/ai` - AI settings
- [ ] `/settings/client` - Client settings
- [ ] `/settings/metrics` - Metrics settings
- [ ] `/settings/module` - Module settings
- [ ] `/settings/profile` - Profile settings

#### Admin (2 pages)
- [ ] `/admin/onboard` - Onboarding
- [ ] `/admin/users` - User management

#### Auth (3 pages)
- [ ] `/auth/signin` - Sign in
- [ ] `/auth/signout` - Sign out
- [ ] `/auth/error` - Auth error

#### AI & Test (3 pages)
- [ ] `/__ai/health` - AI health check
- [ ] `/test-module` - Test module
- [ ] `/test/content-renderer` - Content renderer test
- [ ] `/test/governance-upload` - Governance upload test

### How to Complete

1. Open each stub file in `knowledge/ui/pages/`
2. Review the corresponding page component in `app/`
3. Document purpose, features, and usage
4. Update frontmatter: set `owner`, update `lastUpdated`, change `status` to `complete`

### Tracking

Run `pnpm run kb:report` to see current coverage status in AICR KBCC dashboard.

---

*Generated automatically during KBCC integration.*
