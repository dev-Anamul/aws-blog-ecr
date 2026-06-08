# Deployment Guide: Local Development to AWS Production

This guide walks through deploying the Simple Blog application using Docker, Amazon ECR, and AWS compute services.

## Overview

1. Build optimized Docker images locally
2. Create Amazon ECR repositories
3. Push tagged images to ECR
4. Deploy containers to AWS (ECS Fargate recommended)
5. Manage secrets and environment configuration
6. Automate with GitHub Actions

## Prerequisites

- AWS account with appropriate IAM permissions
- AWS CLI v2 installed and configured
- Docker installed locally
- GitHub repository for CI/CD (optional but recommended)

## 1. Local Container Validation

Build and run the full stack locally:

```bash
docker compose up --build
```

Verify health endpoints:

```bash
curl http://localhost:8000/health
curl http://localhost:8000/health/ready
curl http://localhost:3000/health
```

## 2. Create Amazon ECR Repositories

Replace `AWS_ACCOUNT_ID` and `AWS_REGION` with your values.

```bash
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=123456789012

aws ecr create-repository \
  --repository-name simple-blog-backend \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256

aws ecr create-repository \
  --repository-name simple-blog-frontend \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256
```

### Image Tagging Strategy

Use immutable tags for traceability:

- `latest` — convenience tag for development/staging
- `<git-sha>` — immutable production tag (recommended)
- `v1.0.0` — semantic version for releases

Example:

```text
123456789012.dkr.ecr.us-east-1.amazonaws.com/simple-blog-backend:abc1234
123456789012.dkr.ecr.us-east-1.amazonaws.com/simple-blog-backend:latest
```

## 3. Authenticate Docker to ECR

```bash
aws ecr get-login-password --region $AWS_REGION \
  | docker login --username AWS --password-stdin \
    $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
```

## 4. Build and Push Images

```bash
export ECR_REGISTRY=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
export IMAGE_TAG=$(git rev-parse --short HEAD)

# Backend
docker build -t $ECR_REGISTRY/simple-blog-backend:$IMAGE_TAG ./backend
docker tag $ECR_REGISTRY/simple-blog-backend:$IMAGE_TAG \
           $ECR_REGISTRY/simple-blog-backend:latest
docker push $ECR_REGISTRY/simple-blog-backend:$IMAGE_TAG
docker push $ECR_REGISTRY/simple-blog-backend:latest

# Frontend (uses relative /api/v1 by default for same-host ALB routing)
docker build -t $ECR_REGISTRY/simple-blog-frontend:$IMAGE_TAG ./frontend
docker tag $ECR_REGISTRY/simple-blog-frontend:$IMAGE_TAG \
           $ECR_REGISTRY/simple-blog-frontend:latest
docker push $ECR_REGISTRY/simple-blog-frontend:$IMAGE_TAG
docker push $ECR_REGISTRY/simple-blog-frontend:latest
```

## 5. Provision Infrastructure with Terraform

The recommended path is to use the Terraform configuration in `terraform/`:

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

This creates a **production-grade, multi-tier VPC**:

| Tier                  | Subnets | Resources                 |
| --------------------- | ------- | ------------------------- |
| Public                | 2 AZs   | ALB, NAT Gateway          |
| Application (private) | 2 AZs   | ECS Fargate tasks         |
| Database (private)    | 2 AZs   | RDS PostgreSQL (Multi-AZ) |

Also provisioned: ECR, Secrets Manager, VPC endpoints, VPC flow logs, least-privilege security groups, and optional GitHub Actions OIDC.

After apply, push images and redeploy ECS services (see `terraform/README.md`).

```bash
terraform output application_url
```

### Terraform + GitHub Actions

1. Set `github_repository = "your-org/simple-blog"` in `terraform.tfvars`
2. `terraform apply`
3. Set GitHub secret `AWS_ROLE_TO_ASSUME` to `terraform output -raw github_actions_role_arn`
4. Set GitHub variables `ECR_BACKEND_REPOSITORY` and `ECR_FRONTEND_REPOSITORY` to match Terraform ECR repo names

## 6. AWS Infrastructure Options

### Recommended: ECS on Fargate (via Terraform)

Use ECS Fargate for production-style container orchestration:

- Application Load Balancer routes traffic to frontend/backend services
- ECS services pull images from ECR
- RDS PostgreSQL for managed database
- Secrets Manager for `DATABASE_URL` and credentials

High-level components:

```text
Internet
   │
   ▼
Application Load Balancer (https://example.com)
   ├── /api/*   ──► ECS Service: backend (port 8000)
   ├── /health* ──► ECS Service: backend (port 8000)  # target group health checks
   └── /*       ──► ECS Service: frontend (port 80)
                         │
                         ▼
                   RDS PostgreSQL
```

### Alternative: AWS App Runner

App Runner is simpler for learning deployments:

- Create one App Runner service for backend
- Create one App Runner service for frontend
- Point each service to its ECR image
- Configure environment variables in the App Runner console

App Runner handles load balancing and scaling with less infrastructure setup.

## 7. Environment and Secret Management

Never bake secrets into Docker images.

### Backend environment variables

| Variable       | Example                   | Notes                            |
| -------------- | ------------------------- | -------------------------------- |
| `ENVIRONMENT`  | `production`              | Disables debug docs              |
| `DATABASE_URL` | `postgresql://...`        | Store in Secrets Manager         |
| `CORS_ORIGINS` | `https://app.example.com` | Comma-separated                  |
| `LOG_LEVEL`    | `INFO`                    | Use `WARNING` in prod if desired |

### Frontend API configuration

| Variable            | Default   | Notes                                                                              |
| ------------------- | --------- | ---------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | `/api/v1` | Relative path for same-host ALB routing. Override only for split-origin local dev. |

When frontend and backend share one ALB hostname, the browser requests `https://example.com/api/v1/posts`. No per-environment backend URL is baked into the image.

Local Docker Compose simulates this: nginx in the frontend container proxies `/api/` to the backend service.

### AWS Secrets Manager example

Store database credentials:

```bash
aws secretsmanager create-secret \
  --name simple-blog/database-url \
  --secret-string "postgresql://user:pass@rds-endpoint:5432/simple_blog"
```

Reference the secret in ECS task definitions using `secrets` instead of plain `environment` values.

## 8. ECS Task Definition Notes

Backend container:

- Image: ECR backend repository
- Port: `8000`
- Health check command: `curl -f http://localhost:8000/health`
- Environment/secrets from task definition
- CloudWatch Logs driver enabled

Frontend container:

- Image: ECR frontend repository
- Port: `80`
- Health check command: `wget -qO- http://localhost/health`

## 9. GitHub Actions CI/CD

This repository includes:

- `/.github/workflows/ci.yml` — validates builds on pull requests
- `/.github/workflows/deploy-ecr.yml` — pushes images to ECR on `main`

### Required GitHub configuration

Repository secret:

- `AWS_ROLE_TO_ASSUME` — IAM role ARN trusted by GitHub OIDC

Repository variables:

- `AWS_REGION`
- `ECR_BACKEND_REPOSITORY`
- `ECR_FRONTEND_REPOSITORY`

### IAM role trust policy (GitHub OIDC)

Create an IAM role that GitHub Actions can assume:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::AWS_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/simple-blog:*"
        }
      }
    }
  ]
}
```

Attach policies allowing:

- `ecr:GetAuthorizationToken`
- `ecr:BatchCheckLayerAvailability`
- `ecr:CompleteLayerUpload`
- `ecr:InitiateLayerUpload`
- `ecr:PutImage`
- `ecr:UploadLayerPart`

## 10. Observability

### Logging

- Backend emits structured logs to stdout
- Configure ECS/App Runner to ship logs to CloudWatch Logs
- Create metric filters for `ERROR` and `5xx` patterns

### Health checks

- Liveness: `/health`
- Readiness: `/health/ready` (backend only, checks DB connectivity)
- Frontend: `/health` via nginx

Configure ALB target group health checks against these endpoints.

## 11. Production Checklist

- [ ] RDS PostgreSQL with backups enabled
- [ ] Secrets stored in AWS Secrets Manager
- [ ] ECR image scanning enabled
- [ ] Immutable image tags for releases
- [ ] HTTPS enabled on load balancer
- [ ] Restrictive security groups
- [ ] CORS limited to production frontend domain
- [ ] CloudWatch alarms for unhealthy targets
- [ ] Database migrations strategy defined (Alembic included in dependencies)

## 12. Rollback Strategy

Because images are tagged by git SHA:

1. Identify the previous working image tag in ECR
2. Update ECS service/task definition to use that tag
3. Force a new deployment

Example:

```bash
aws ecs update-service \
  --cluster simple-blog \
  --service backend \
  --force-new-deployment
```

## 13. Next Learning Steps

- Add Alembic migrations and run them in CI/CD
- Introduce Terraform or AWS CDK for infrastructure as code
- Add AWS X-Ray or OpenTelemetry tracing
- Configure autoscaling policies on ECS services
- Set up staging and production ECR repositories separately
