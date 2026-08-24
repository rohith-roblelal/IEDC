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
- [ ] **Release Freeze:**
  - [ ] Git commit SHA recorded.
  - [ ] Docker image digest recorded.
  - [ ] Frontend deployment version recorded.
  - [ ] Backend deployment version recorded.
  - [ ] No source changes between staging validation and production promotion.
- [ ] **Origin Shielding:** Verify that requests reaching the backend directly are rejected and that the CDN/proxy path supplies the required secret. Verify the secret cannot be exposed through frontend bundles, logs, errors, or response headers.

## 2. Staging Validation
- [ ] **Smoke Tests:** Execute manual or automated smoke tests against the staging environment.
- [ ] **E2E Validation:** Run core user flows against staging to confirm functionality.
- [ ] **Observability Verification:**
  - [ ] Metrics populate in Prometheus/Grafana.
  - [ ] Traces appear in Tempo.
  - [ ] Sentry captures a manual test exception.
  - [ ] Alerts fire and resolve correctly.
- [ ] **Disaster Recovery Rehearsal:** (Quarterly only) Run `scripts/restore_db.sh` to validate backup integrity.

## 3. Production Deployment
- [ ] **Announce:** Notify the team of the impending release window.
- [ ] **Maintenance Mode:** Enable maintenance mode (if required for incompatible DB schema changes).
- [ ] **Database Backup Validation:** Confirm the latest backup exists, timestamp is acceptable, and database connectivity is healthy. Record the current migration revision before deployment.
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
  - [ ] Analytics & Error reporting
- [ ] **Post-Deployment Security Verification:**
  - [ ] Authentication cookie is `HttpOnly`, `Secure`, and appropriately scoped.
  - [ ] CORS rejects unauthorized origins.
  - [ ] CSP is active.
  - [ ] Rate limiting is active.
  - [ ] Upload magic-byte validation works.
  - [ ] Admin endpoints require the correct authorization.
  - [ ] Sensitive data is absent from logs.
  - [ ] Health/readiness endpoints don't expose secrets or internal infrastructure details.
- [ ] **Cache Verification:**
  - [ ] Redis healthy
  - [ ] Cache warming completed
  - [ ] CDN cache invalidated (if applicable)

## 5. Post-Deployment Monitoring (First 24-48 Hours)
- [ ] **Business Metrics:** Monitor successful logins, event registrations, startup submissions, and gallery uploads.
- [ ] **Error Rates:** Monitor Grafana / Sentry for any spike in 5xx errors or unhandled exceptions.
- [ ] **Latency (P95/P99):** Verify API response times remain within the < 300ms SLO.
- [ ] **Resource Usage:** Check CPU, Memory, and Database Connection Pool metrics to ensure no memory leaks or connection exhaustion.
- [ ] **Alert Tuning:** Adjust alert thresholds if false positives create noise.

## 6. Release Documentation
- [ ] GitHub Release published
- [ ] Release notes updated
- [ ] Deployment timestamp recorded
- [ ] Version tag created

## 7. Rollback Procedure (If necessary)
- [ ] If critical failures occur, deploy the previous known-good Docker image via GitHub Actions (`production.yml` workflow).
- [ ] **Do not automatically downgrade production databases during rollback.** First determine whether the migration is backward-compatible. If it is incompatible, execute the documented database recovery procedure only after confirming backup availability and impact. Prefer restoring application compatibility over destructive schema rollback.
- [ ] **Rollback Validation:**
  - [ ] Smoke tests pass
  - [ ] Monitoring healthy
  - [ ] Database accessible
