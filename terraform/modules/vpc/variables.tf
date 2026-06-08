variable "name_prefix" {
  type = string
}

variable "vpc_cidr" {
  type = string
}

variable "availability_zone_count" {
  description = "Number of AZs to span (minimum 2 for HA)."
  type        = number
  default     = 2
}

variable "single_nat_gateway" {
  description = "Use one NAT gateway instead of one per AZ (lower cost, reduced HA)."
  type        = bool
  default     = false
}

variable "enable_vpc_endpoints" {
  description = "Create VPC endpoints for AWS services (ECR, S3, Secrets Manager, CloudWatch Logs)."
  type        = bool
  default     = true
}

variable "tags" {
  type    = map(string)
  default = {}
}
