variable "name_prefix" {
  type = string
}

variable "database_url_secret_arn" {
  type = string
}

variable "github_repository" {
  type    = string
  default = ""
}

variable "ecr_backend_repository_arn" {
  type = string
}

variable "ecr_frontend_repository_arn" {
  type = string
}

variable "tags" {
  type    = map(string)
  default = {}
}
