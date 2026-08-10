# IEDC SNMIMT Platform — System Overview & Documentation Index

Welcome to the IEDC SNMIMT project! If you are new to the team or the codebase, this document is your starting point. It provides a high-level overview of the system architecture and serves as an index to all other technical documentation in this repository.

---

## Project Status

**Current Status:** Production Release Candidate

**Completed**
- Backend implementation
- Frontend implementation
- Security hardening
- Performance optimization
- Accessibility improvements
- SEO optimization
- Production infrastructure

**In Progress**
- Final production verification
- Release sign-off

**Next Milestone**
- Production deployment

---

## 1. System Architecture

The IEDC SNMIMT Platform is a modern, full-stack web application designed to manage events, startups, gallery assets, and team information.

### Technology Stack
- **Frontend (Web):** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion for animations.
- **Backend (API):** FastAPI (Python 3.10+), Pydantic for schema validation, SQLAlchemy (ORM), Alembic (Migrations).
- **Database:** PostgreSQL (Hosted on Neon).
- **Storage:** Supabase Storage (used for storing images like Gallery uploads and Event banners).
- **Deployment:** Vercel (Frontend), Docker/Bare-metal VPS (Backend).

For an in-depth breakdown of the system components, data flows, and security domains, see the [Architecture Diagram & Detailed Overview](../Production_System_Architecture.md).

---

## 2. Repository Structure

```text
backend/
frontend/
docs/
reports/
scripts/
docker/
```

- **backend/** – FastAPI API, models, services, migrations.
- **frontend/** – Next.js application.
- **docs/** – Architecture, PRD/TRD, operational documentation.
- **reports/** – Production verification and audit reports.
- **scripts/** – Automation and maintenance scripts.
- **docker/** – Container and deployment configuration.

---

## 3. Technical Documentation Index

To navigate the `docs/` folder effectively, here is a breakdown of what each file and folder contains:

### Product & Requirements
- [**prd.md**](../prd.md): Product Requirements Document. Explains *what* we are building and the core business logic.
- [**trd.md**](../trd.md): Technical Requirements Document. Explains the technical constraints and specific tech choices.

### Project Tracking & Progress
- [**progress_tracker.md**](../progress_tracker.md): The master checklist of all sprints, tasks, and production release phases.
- [**production_audit.md**](../production_audit.md): Notes on the massive production QA and audit process.

### Operations & Deployment
- [**CLOUD_DEPLOYMENT.md**](../CLOUD_DEPLOYMENT.md): Guide for provisioning a Linux VPS (EC2/DigitalOcean) and deploying the backend via Docker and Caddy.
- [**runbooks.md**](../runbooks.md): Operational runbooks (e.g., how to run database migrations, how to clear caches).
- [**RELEASE_CHECKLIST.md**](../RELEASE_CHECKLIST.md): The exact checklist used when promoting code from Staging to Production.

### Security
- [**security/**](../security/): Directory containing detailed threat models and JWT validation flows.
- [**security_audit.md**](../security_audit.md): Results from security vulnerability scans and remediation steps.

### Production Reports
- [**Reports/production/**](../Reports/production/): Final artifacts from our pre-launch production verification (deployment plan, rollback plan, infrastructure verification).

### Bugs & Hotfixes
- [**Bug_found.md**](../Bug_found.md) & [**bug_fix.md**](../bug_fix.md): Historical logs of critical bugs encountered during development and how they were patched.

---

## 4. Prerequisites

Before setting up the project locally, ensure you have the following installed:
- Node.js 22+
- Python 3.11+
- PostgreSQL 16+
- Docker & Docker Compose (optional)
- Git

---

## 5. Getting Started Locally

1. **Environment Variables:** Copy the example environment files and configure them.
   - Frontend: Copy `frontend/.env.example` to `frontend/.env` (if exists) or create `.env` with required values.
   - Backend: Copy `backend/.env.example` to `backend/.env` and update the Database URL.
2. **Database:** Ensure you have access to the PostgreSQL database URL. Add it to `backend/.env`.
3. **Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   alembic upgrade head
   uvicorn app.main:app --reload
   ```
4. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 6. Common Commands

### Frontend

```bash
npm run dev
npm run build
npm run lint
```

### Backend

```bash
uvicorn app.main:app --reload
alembic upgrade head
pytest
```

---

## 7. Contributing Workflow

1. **Branching:** Create a new branch from `main` (e.g., `feature/event-registration` or `fix/gallery-upload`).
2. **Commits:** Write clear and descriptive commit messages.
3. **Pull Requests:** Push your branch and open a PR against `main`. Ensure all CI/CD checks (linting, tests, build) pass before requesting a review.
4. **Testing:** Run local tests and verify responsive layouts before submitting.

---

## 8. Support

For architecture questions, consult the documentation in `docs/` first. If the answer is not available, contact the project maintainer or create an issue in the repository.

Welcome aboard, and happy coding!
