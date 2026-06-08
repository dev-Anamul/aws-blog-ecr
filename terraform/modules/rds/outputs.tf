output "endpoint" {
  value = aws_db_instance.this.address
}

output "port" {
  value = aws_db_instance.this.port
}

output "database_name" {
  value = aws_db_instance.this.db_name
}

output "database_url_secret_arn" {
  value = aws_secretsmanager_secret.database_url.arn
}
