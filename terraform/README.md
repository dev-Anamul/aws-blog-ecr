# Terraform Infrastructure

Production-grade, multi-tier AWS architecture for the Simple Blog application.

## Architecture

```text
                         Internet
                            │
                            ▼
              ┌─────────────────────────────┐
              │  Public Subnets (2 AZs)     │
              │  ┌─────────┐  ┌──────────┐  │
              │  │   ALB   │  │   NAT    │  │
              │  └────┬────┘  └────▲─────┘  │
              └───────┼───────────┼────────┘
                      │           │
              ┌───────┼───────────┼────────┐
              │  App Subnets (2 AZs)     │
              │  ┌────┴────┐  ┌────┴────┐  │
              │  │ECS Front│  │ECS Back │  │
              │  └─────────┘  └────┬────┘  │
              └────────────────────┼────────┘
                                   │
              ┌────────────────────┼────────┐
              │  Database Subnets (2 AZs)   │
              │         ┌──────────┴───┐    │
              │         │  RDS (Multi-AZ)│  │
              │         └──────────────┘    │
              └─────────────────────────────┘
```

### Traffic flow

1. Internet → **ALB** (public subnets)
2. ALB → **ECS tasks** (private app subnets) via security group rules
3. ECS backend → **RDS** (private database subnets) via security group rules
4. ECS outbound → **NAT Gateway** (public subnets) or **VPC endpoints** (AWS APIs)

### Security segmentation

| Tier | Subnets | Resources | Internet access |
|------|---------|-----------|-----------------|
| Public | `10.0.0.0/24`, `10.0.1.0/24` | ALB, NAT Gateway | Inbound from internet (ALB only) |
| Application | `10.0.10.0/24`, `10.0.11.0/24` | ECS Fargate | Outbound via NAT / VPC endpoints only |
| Database | `10.0.20.0/24`, `10.0.21.0/24` | RDS PostgreSQL | None |

### ALB path routing

```text
/           -> frontend (port 80)
/api/*      -> backend  (port 8000)
/health*    -> backend  (port 8000)
```

Frontend uses relative API paths (`/api/v1`) — no per-environment backend URL required.

## Well-Architected features

- **Security**: Tiered subnets, least-privilege security groups, encrypted RDS, Secrets Manager, VPC flow logs
- **Reliability**: 2+ AZs, RDS Multi-AZ, NAT per AZ, ECS circuit breaker with rollback
- **Performance**: VPC endpoints reduce NAT latency for AWS API calls
- **Operational excellence**: Container Insights, CloudWatch logs, VPC flow logs

## Prerequisites

- Terraform >= 1.6
- AWS CLI configured
- Docker images pushed to ECR after first apply

## Quick Start

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

## Deploy Application Images

```bash
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export ECR_REGISTRY=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

aws ecr get-login-password --region $AWS_REGION \
  | docker login --username AWS --password-stdin $ECR_REGISTRY

docker build -t simple-blog-backend ./backend
docker tag simple-blog-backend:latest $(terraform output -raw ecr_backend_repository_url):latest
docker push $(terraform output -raw ecr_backend_repository_url):latest

docker build -t simple-blog-frontend ./frontend
docker tag simple-blog-frontend:latest $(terraform output -raw ecr_frontend_repository_url):latest
docker push $(terraform output -raw ecr_frontend_repository_url):latest

aws ecs update-service --cluster $(terraform output -raw ecs_cluster_name) \
  --service $(terraform output -raw ecs_backend_service_name) --force-new-deployment

aws ecs update-service --cluster $(terraform output -raw ecs_cluster_name) \
  --service $(terraform output -raw ecs_frontend_service_name) --force-new-deployment
```

Open: `terraform output application_url`

## Cost tuning (non-production)

For a lower-cost dev environment, override in `terraform.tfvars`:

```hcl
environment            = "dev"
single_nat_gateway     = true   # one NAT instead of per-AZ
db_multi_az            = false
db_deletion_protection = false
backend_desired_count  = 1
frontend_desired_count = 1
```

## Modules

| Module | Purpose |
|--------|---------|
| `modules/vpc` | 3-tier VPC, NAT, VPC endpoints, flow logs |
| `modules/security` | Least-privilege security groups |
| `modules/ecr` | Container registries |
| `modules/rds` | Multi-AZ PostgreSQL + Secrets Manager |
| `modules/alb` | ALB with path-based routing |
| `modules/iam` | ECS roles + GitHub OIDC |
| `modules/ecs` | Fargate services in private app subnets |

## Destroy

```bash
terraform destroy
```

Set `db_deletion_protection = false` before destroying if enabled.
