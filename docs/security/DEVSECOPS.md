# DevSecOps

## Secrets Management
- All secrets are injected at runtime via environment variables.
- `.env` files must be included in `.gitignore`.
- Secrets should be rotated every 90 days or immediately following a suspected compromise.

## Dependency Scanning
- `npm audit` and `pip-audit` should be run as part of the CI pipeline.
- High and Critical severity vulnerabilities must break the build.
