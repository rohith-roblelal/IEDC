# Production Release Checklist

Use this checklist for every production deployment to ensure consistency, stability, and operational readiness.

## 1. Pre-Deployment (Staging Gate)

### Go / No-Go Approval
- [ ] Product Owner approved release
- [ ] Engineering Lead approved release
- [ ] All CI/CD checks passing
- [ ] No active P1/P2 incidents

### Validation
- [ ] **Artifact Promotion:** Verify the exact Docker image/build artifact being deployed is the one tested in Staging. Do not rebuild.
- [ ] **Rollback Artifact:** Previous production Docker image verified and available for immediate rollback.
- [ ] **Database Migrations:** Run `alembic upgrade head` in Staging. Verify they are idempotent and succeed without errors.
- [ ] **Dependency Freeze:** Ensure `requirements.txt` and `package-lock.json` have no pending unpinned dependencies.
- [x] **Secrets Rotation:** Verify no secrets were committed to Git or Docker images. Rotate any compromised secrets.
- [ ] **Origin Shielding:** Verify that Render/Backend origin is protected by the `X-Backend-Secret` configuration and cannot be accessed directly bypassing the CDN.

## 2. Staging Validation
- [ ] **Smoke Tests:** Execute `k6 run load-tests/smoke.js` against the staging environment.
- [ ] **Resilience Tests:** Execute `k6 run k6/load_test.js` against the staging environment to verify rate limits and DoS protections.
- [ ] **E2E Validation:** Run Playwright E2E suite against staging to confirm core user flows.
- [ ] **Observability Verification:**
  - [ ] Metrics populate in Prometheus/Grafana.
  - [ ] Traces appear in Tempo.
  - [ ] Sentry captures a manual test exception.
  - [ ] Alerts fire and resolve correctly.
- [ ] **Disaster Recovery Rehearsal:** (Quarterly only) Run `scripts/restore_db.sh` to validate backup integrity.

## 3. Production Deployment
- [ ] **Announce:** Notify the team of the impending release window.
- [ ] **Maintenance Mode:** Enable maintenance mode (if required for incompatible DB schema changes).
- [ ] **Deploy:** Promote the staging artifact to Production.
- [ ] **Migrate:** Run database migrations on Production.
- [ ] **Maintenance Mode:** Disable maintenance mode after successful deployment.

## 4. Post-Deployment Verification
- [ ] **Production Smoke Tests:**
  - [ ] Homepage loads
  - [ ] Login works
  - [ ] Admin dashboard loads
  - [ ] Health endpoint returns 200
  - [ ] API documentation accessible
  - [ ] Event registration works
- [ ] **External Integrations:**
  - [x] Supabase Storage
  - [ ] Email provider
  - [ ] OAuth providers
  - [ ] Analytics & Error reporting
- [ ] **Cache Verification:**
  - [ ] Redis healthy
  - [ ] Cache warming completed
  - [ ] CDN cache invalidated (if applicable)

## 5. Post-Deployment Monitoring (First 24-48 Hours)
- [ ] **Business Metrics:** Monitor successful logins, event registrations, startup submissions, and gallery uploads.
- [ ] **Error Rates:** Monitor Grafana / Sentry for any spike in 5xx errors or unhandled exceptions.
- [ ] **Latency (P95/P99):** Verify API response times remain within the < 300ms SLO.
- [ ] **Resource Usage:** Check CPU, Memory, and Database Connection Pool metrics to ensure no memory leaks or connection exhaustion.
- [ ] **Background Jobs:** 
  - [ ] Scheduler running
  - [ ] Cron jobs executing
  - [ ] Email queue healthy
  - [ ] Retry queue empty
- [ ] **Alert Tuning:** Adjust alert thresholds if false positives create noise.

## 6. Release Documentation
- [ ] GitHub Release published
- [ ] Release notes updated
- [ ] Deployment timestamp recorded
- [ ] Version tag created

## 7. Rollback Procedure (If necessary)
- [ ] If critical failures occur, deploy the previous known-good Docker image via GitHub Actions (`production.yml` workflow).
- [ ] If database schema changes are incompatible, run `alembic downgrade -1` before code rollback.
- [ ] **Rollback Validation:**
  - [ ] Smoke tests pass
  - [ ] Monitoring healthy
  - [ ] Database accessible
  - [ ] Queue processing restored
