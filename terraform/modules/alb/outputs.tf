output "arn" {
  value = aws_lb.this.arn
}

output "dns_name" {
  value = aws_lb.this.dns_name
}

output "backend_target_group_arn" {
  value = aws_lb_target_group.backend.arn
}

output "frontend_target_group_arn" {
  value = aws_lb_target_group.frontend.arn
}

output "http_listener_arn" {
  value = try(aws_lb_listener.http[0].arn, aws_lb_listener.http_redirect[0].arn)
}
