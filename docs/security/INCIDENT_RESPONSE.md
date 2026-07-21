# Incident Response Plan

## 1. Preparation
Ensure logging and monitoring (Prometheus, Grafana, Loki) are active. Maintain off-site backups of the Supabase database.

## 2. Identification
Monitor alerts from Alertmanager. Investigate spikes in 5xx errors or sudden drops in authentication success rates.

## 3. Containment
- Isolate affected containers.
- If database breach is suspected, rotate all Supabase API keys and database passwords.
- Implement aggressive rate limiting or temporary IP blocks via reverse proxy/WAF.

## 4. Eradication & Recovery
Patch identified vulnerabilities. Restore database from known good backup if data corruption occurred. 

## 5. Lessons Learned
Conduct a blameless post-mortem within 48 hours of incident resolution. Update `RISK_REGISTER.md` accordingly.
