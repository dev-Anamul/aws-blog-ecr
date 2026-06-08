locals {
  name_prefix = "${var.project_name}-${var.environment}"

  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }

  app_base_url = var.enable_https ? "https://${module.alb.dns_name}" : "http://${module.alb.dns_name}"

  cors_origins = join(
    ",",
    concat([local.app_base_url], var.additional_cors_origins),
  )
}
