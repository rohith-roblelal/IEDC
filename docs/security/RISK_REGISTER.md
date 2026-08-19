# Risk Register

| ID | Risk | Likelihood | Impact | Mitigation Strategy | Status |
|---|---|---|---|---|---|
| R01 | Cross-Site Scripting (XSS) | Low | High | Enforce CSP; rely on React auto-escaping. | Mitigated |
| R02 | SQL Injection | Low | High | Use Supabase ORM/Parameterized queries exclusively. | Mitigated |
| R03 | DDoS / Brute Force | Med | Med | Implement `slowapi` rate limiting on all endpoints. | Mitigated |
| R04 | Unauthorized Data Access | Low | High | Enforce Supabase Row Level Security (RLS). | Mitigated |
