# Deployment Security

## Docker Configuration
- Base images must be pinned to specific SHA hashes or minor versions. Do not use `latest`.
- Containers must not run as the `root` user. Use `USER appuser` directives.
- Use read-only root filesystems where possible.

## CI/CD (GitHub Actions)
- Branch protection rules require at least one approving review before merging to `main`.
- Secrets used in GitHub Actions are stored in encrypted repository secrets.
- SAST tools (e.g., CodeQL) should scan the repository on every pull request.
