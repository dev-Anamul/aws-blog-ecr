# Simple Blog

A production-minded blog post CRUD application built to learn AWS containerization and deployment workflows, especially Amazon ECR.

## Architecture

```text
┌─────────────┐     HTTP      ┌─────────────┐     SQL      ┌─────────────┐
│   React     │ ────────────► │   FastAPI   │ ───────────► │ PostgreSQL  │
│  (Nginx)    │               │   Backend   │              │             │
└─────────────┘               └─────────────┘              └─────────────┘
       │                             │
       └──────── Docker images ──────┘
                         │
                         ▼
                  Amazon ECR ──► ECS / App Runner
```

## Features

- Create, list, view, update, and delete blog posts
- Versioned REST API (`/api/v1`)
- Structured logging and health/readiness endpoints
- Multi-stage Docker builds for frontend and backend
- Local development with Docker Compose
- GitHub Actions CI and ECR deployment workflow

## Project Structure

```text
simple-blog/
├── backend/                 # FastAPI service
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── routers/
│   │   ├── models/
│   │   └── schemas/
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── uv.lock
├── frontend/                # React + Vite SPA
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── pnpm-lock.yaml
├── docker-compose.yml
├── .github/workflows/
└── docs/DEPLOYMENT.md
```

## Prerequisites

- [Docker](https://www.docker.com/) for containerized development and deployment
- [uv](https://docs.astral.sh/uv/) for backend dependency management
- [pnpm](https://pnpm.io/) for frontend dependency management

## Quick Start (Local Development)

### Option 1: Docker Compose (recommended)

```bash
docker compose up --build
```

Services:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432

### Option 2: Run services individually

Backend:

```bash
cd backend
cp .env.example .env
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm dev
```

Start PostgreSQL locally or via Docker:

```bash
docker run --name simple-blog-db \
  -e POSTGRES_DB=simple_blog \
  -e POSTGRES_USER=blog_user \
  -e POSTGRES_PASSWORD=blog_password \
  -p 5432:5432 \
  -d postgres:16-alpine
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Liveness check |
| GET | `/health/ready` | Readiness check (database) |
| GET | `/api/v1/posts` | List posts |
| GET | `/api/v1/posts/{id}` | Get one post |
| POST | `/api/v1/posts` | Create post |
| PUT | `/api/v1/posts/{id}` | Update post |
| DELETE | `/api/v1/posts/{id}` | Delete post |

## Environment Configuration

Backend settings are loaded from environment variables. See `backend/.env.example`.

### Frontend API URL (same-host / ALB path routing)

The frontend defaults to a **relative** API base path:

```env
VITE_API_BASE_URL=/api/v1
```

With an Application Load Balancer on one domain:

```text
https://example.com/          -> frontend
https://example.com/api/v1/*    -> backend
```

The browser calls `/api/v1/posts` on the same host, so you do **not** need a separate backend URL in production. One frontend image works for every environment behind path-based routing.

For local split-service development (`pnpm dev` + backend on `:8060`), keep the relative path and let Vite proxy `/api` to the backend. See `frontend/.env.example`.

## Docker Images

Build locally:

```bash
docker build -t simple-blog-backend ./backend
docker build -t simple-blog-frontend ./frontend
```

Both images include health checks and run as non-root users where applicable.

## AWS Deployment (Terraform)

Infrastructure is defined in [`terraform/`](terraform/README.md):

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform apply
```

This provisions VPC, ECR, RDS, ECS Fargate, ALB path routing, and Secrets Manager.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full workflow from local development to production.

## CI/CD

- `.github/workflows/ci.yml` — lint/build validation and Docker image build checks
- `.github/workflows/deploy-ecr.yml` — build and push images to Amazon ECR on `main`

Required GitHub configuration:

- Secret: `AWS_ROLE_TO_ASSUME`
- Variables: `AWS_REGION`, `ECR_BACKEND_REPOSITORY`, `ECR_FRONTEND_REPOSITORY`

## Production Practices Included

- API versioning (`/api/v1`)
- Input validation with Pydantic
- Structured logging
- Health and readiness probes
- Multi-stage Docker builds
- Environment-based configuration
- Separate frontend/backend services
- Non-root container users
- CORS configuration
- Error handling middleware

## License

MIT
