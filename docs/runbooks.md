# Operational Runbooks

This document provides response procedures for the alerts configured in `config/alertmanager.yml` and `config/alert.rules.yml`.

## Alert: HighErrorRate
**Condition:** Error Rate > 1% for 5 minutes.
**Runbook:**
1. Check the `API Metrics` Grafana dashboard to confirm the spike.
2. Filter Sentry by the `fastapi` project and look for new Unhandled Exceptions introduced in the last hour.
3. Review recent GitHub Actions deployments to `production`.
4. If a regression was introduced, immediately dispatch the `production.yml` workflow with the previous stable `version` tag to rollback.

## Alert: HighLatency
**Condition:** P95 Latency > 500ms for 10 minutes.
**Runbook:**
1. Check the `Database Metrics` dashboard for slow queries or connection pool exhaustion.
2. Check `Redis Metrics` for cache hit rate drops (meaning the DB is taking the full load).
3. Inspect OpenTelemetry traces in Grafana Tempo to isolate which span (e.g. `SELECT from events`, `fetch external API`) is introducing the latency.

## Alert: DatabaseDown
**Condition:** `up{job="fastapi_backend"}` == 0 or explicit DB health check fails.
**Runbook:**
1. Check the Render dashboard for the PostgreSQL instance status (is it out of memory/disk?).
2. Check the `docker-compose` or PaaS logs for the `db` container.
3. If the DB crashed completely and data is corrupted, initiate the Disaster Recovery plan (`scripts/restore_db.sh`).
