# Logging & Monitoring Security

## Application Logging
- A global exception handler is implemented in the FastAPI backend to catch all unhandled `500` errors.
- Raw stack traces are **never** returned to the client. The client receives a generic `{"detail": "Internal Server Error"}` response.
- Full stack traces and context are logged internally via the standard Python `logging` module to `stdout/stderr`.

## Audit Logging
- Critical endpoints (such as `auth/login` and admin endpoints) should log the `user_id` or `email` performing the action, timestamp, and IP address for forensic tracking.

## Centralized Monitoring
- Logs are scraped by Promtail and forwarded to Loki in the monitoring stack for centralized querying and alerts.
