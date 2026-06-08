output "alb_security_group_id" {
  value = aws_security_group.alb.id
}

output "ecs_frontend_security_group_id" {
  value = aws_security_group.ecs_frontend.id
}

output "ecs_backend_security_group_id" {
  value = aws_security_group.ecs_backend.id
}

output "rds_security_group_id" {
  value = aws_security_group.rds.id
}
