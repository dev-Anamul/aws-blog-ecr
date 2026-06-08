output "vpc_id" {
  value = aws_vpc.this.id
}

output "vpc_cidr" {
  value = aws_vpc.this.cidr_block
}

output "availability_zones" {
  value = local.azs
}

output "public_subnet_ids" {
  description = "Public subnets for ALB and NAT Gateways."
  value       = aws_subnet.public[*].id
}

output "app_subnet_ids" {
  description = "Private application subnets for ECS tasks."
  value       = aws_subnet.app[*].id
}

output "database_subnet_ids" {
  description = "Private database subnets for RDS (no internet route)."
  value       = aws_subnet.database[*].id
}

# Backward-compatible alias
output "private_subnet_ids" {
  description = "Alias for app_subnet_ids."
  value       = aws_subnet.app[*].id
}

output "nat_gateway_ids" {
  value = aws_nat_gateway.this[*].id
}

output "vpc_flow_log_group" {
  value = aws_cloudwatch_log_group.vpc_flow.name
}
