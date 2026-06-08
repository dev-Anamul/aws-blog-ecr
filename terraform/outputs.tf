output "application_url" {
  description = "Public URL for the blog application."
  value       = local.app_base_url
}

output "alb_dns_name" {
  description = "ALB DNS name."
  value       = module.alb.dns_name
}

output "vpc_id" {
  description = "VPC ID."
  value       = module.vpc.vpc_id
}

output "availability_zones" {
  description = "AZs used by the deployment."
  value       = module.vpc.availability_zones
}

output "public_subnet_ids" {
  description = "Public tier subnet IDs (ALB, NAT)."
  value       = module.vpc.public_subnet_ids
}

output "app_subnet_ids" {
  description = "Private application tier subnet IDs (ECS)."
  value       = module.vpc.app_subnet_ids
}

output "database_subnet_ids" {
  description = "Private database tier subnet IDs (RDS)."
  value       = module.vpc.database_subnet_ids
}

output "nat_gateway_ids" {
  description = "NAT Gateway IDs."
  value       = module.vpc.nat_gateway_ids
}

output "ecr_backend_repository_url" {
  description = "ECR repository URL for backend images."
  value       = module.ecr.backend_repository_url
}

output "ecr_frontend_repository_url" {
  description = "ECR repository URL for frontend images."
  value       = module.ecr.frontend_repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name."
  value       = module.ecs.cluster_name
}

output "ecs_backend_service_name" {
  description = "ECS backend service name."
  value       = module.ecs.backend_service_name
}

output "ecs_frontend_service_name" {
  description = "ECS frontend service name."
  value       = module.ecs.frontend_service_name
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint (private, database tier)."
  value       = module.rds.endpoint
  sensitive   = true
}

output "database_url_secret_arn" {
  description = "Secrets Manager ARN for DATABASE_URL."
  value       = module.rds.database_url_secret_arn
}

output "github_actions_role_arn" {
  description = "IAM role ARN for GitHub Actions OIDC (if configured)."
  value       = module.iam.github_actions_role_arn
}

output "backend_log_group" {
  description = "CloudWatch log group for backend."
  value       = module.ecs.backend_log_group
}

output "frontend_log_group" {
  description = "CloudWatch log group for frontend."
  value       = module.ecs.frontend_log_group
}

output "vpc_flow_log_group" {
  description = "CloudWatch log group for VPC flow logs."
  value       = module.vpc.vpc_flow_log_group
}
