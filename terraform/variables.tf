variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used in resource naming."
  type        = string
  default     = "simple-blog"
}

variable "environment" {
  description = "Deployment environment (dev, staging, production)."
  type        = string
  default     = "production"

  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "environment must be dev, staging, or production."
  }
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zone_count" {
  description = "Number of AZs to span (minimum 2 for HA)."
  type        = number
  default     = 2

  validation {
    condition     = var.availability_zone_count >= 2
    error_message = "availability_zone_count must be at least 2 for high availability."
  }
}

variable "single_nat_gateway" {
  description = "Use one NAT gateway instead of one per AZ (lower cost, reduced HA)."
  type        = bool
  default     = false
}

variable "enable_vpc_endpoints" {
  description = "Create VPC endpoints for AWS services (recommended for production)."
  type        = bool
  default     = true
}

variable "db_name" {
  description = "PostgreSQL database name."
  type        = string
  default     = "simple_blog"
}

variable "db_username" {
  description = "PostgreSQL master username."
  type        = string
  default     = "blog_user"
}

variable "db_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB."
  type        = number
  default     = 20
}

variable "db_multi_az" {
  description = "Enable RDS Multi-AZ for high availability."
  type        = bool
  default     = true
}

variable "db_deletion_protection" {
  description = "Prevent accidental RDS deletion."
  type        = bool
  default     = true
}

variable "backend_image_tag" {
  description = "ECR image tag for the backend service."
  type        = string
  default     = "latest"
}

variable "frontend_image_tag" {
  description = "ECR image tag for the frontend service."
  type        = string
  default     = "latest"
}

variable "backend_cpu" {
  description = "Backend Fargate task CPU units."
  type        = number
  default     = 256
}

variable "backend_memory" {
  description = "Backend Fargate task memory (MiB)."
  type        = number
  default     = 512
}

variable "frontend_cpu" {
  description = "Frontend Fargate task CPU units."
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Frontend Fargate task memory (MiB)."
  type        = number
  default     = 512
}

variable "backend_desired_count" {
  description = "Desired number of backend tasks (spread across AZs)."
  type        = number
  default     = 2
}

variable "frontend_desired_count" {
  description = "Desired number of frontend tasks (spread across AZs)."
  type        = number
  default     = 2
}

variable "enable_https" {
  description = "Enable HTTPS on the ALB (requires acm_certificate_arn)."
  type        = bool
  default     = false

  validation {
    condition     = !var.enable_https || var.acm_certificate_arn != ""
    error_message = "acm_certificate_arn is required when enable_https is true."
  }
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN for HTTPS listener."
  type        = string
  default     = ""
}

variable "github_repository" {
  description = "GitHub repository in org/repo format for OIDC trust (optional)."
  type        = string
  default     = ""
}

variable "additional_cors_origins" {
  description = "Extra CORS origins for local development."
  type        = list(string)
  default     = []
}
