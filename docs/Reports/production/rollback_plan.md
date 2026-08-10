# Rollback Plan

## Overview
This document outlines the procedures to rollback the application in case a critical failure is detected post-deployment.

## 1. Frontend Rollback
If the UI is broken or unusable:
- **Vercel / Managed Hosting:** Navigate to the project dashboard and click "Promote to Production" on the previous successful deployment.
- **Manual Node Hosting:** 
  1. `git checkout <previous-stable-commit>`
  2. `npm ci`
  3. `npm run build`
  4. Restart the Node process.

## 2. Backend Rollback
If the API is throwing 500 errors or failing to start:
- **Cloud/Docker Hosting:** Redeploy the previous known-good Docker image tag via CI/CD, or run `docker compose up -d` with the previous image version in `docker-compose.yml`.
- **Bare-metal Hosting:** 
  1. `git checkout <previous-stable-commit>`
  2. Restart the Uvicorn process.

## 3. Database Rollback
If a database migration corrupted data or caused downtime:
1. **Downgrade Schema:** Identify the previous Alembic revision ID.
   ```bash
   alembic downgrade <previous-revision-id>
   ```
2. **Restore from Backup (Severe Data Loss):** 
   - If using Neon DB, use the Neon Console to restore the database to a Point-In-Time just prior to the deployment.
   - If using manual backups, execute: `psql -U neondb_owner -d neondb < backup.sql`

## 4. Incident Response Checklist
- [ ] Acknowledge the issue and assess the impact (is the site completely down, or is it a specific feature?).
- [ ] Execute Frontend Rollback if it is a UI regression.
- [ ] Execute Backend Rollback if it is an API regression.
- [ ] Verify Database Schema compatibility before rolling back the backend.
- [ ] Notify stakeholders of the rollback and expected resolution timeline.
- [ ] Analyze the logs (Sentry / Server logs) in the non-production environment to identify the root cause.
