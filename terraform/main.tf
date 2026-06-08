module "vpc" {
  source = "./modules/vpc"

  name_prefix             = local.name_prefix
  vpc_cidr                = var.vpc_cidr
  availability_zone_count = var.availability_zone_count
  single_nat_gateway      = var.single_nat_gateway
  enable_vpc_endpoints    = var.enable_vpc_endpoints
  tags                    = local.common_tags
}

module "security" {
  source = "./modules/security"

  name_prefix = local.name_prefix
  vpc_id      = module.vpc.vpc_id
  tags        = local.common_tags
}

module "ecr" {
  source = "./modules/ecr"

  name_prefix = local.name_prefix
  tags        = local.common_tags
}

module "rds" {
  source = "./modules/rds"

  name_prefix            = local.name_prefix
  vpc_id                 = module.vpc.vpc_id
  database_subnet_ids    = module.vpc.database_subnet_ids
  security_group_id      = module.security.rds_security_group_id
  db_name                = var.db_name
  db_username            = var.db_username
  db_instance_class      = var.db_instance_class
  db_allocated_storage   = var.db_allocated_storage
  db_multi_az            = var.db_multi_az
  db_deletion_protection = var.db_deletion_protection
  tags                   = local.common_tags
}

module "alb" {
  source = "./modules/alb"

  name_prefix         = local.name_prefix
  vpc_id              = module.vpc.vpc_id
  public_subnet_ids   = module.vpc.public_subnet_ids
  security_group_id   = module.security.alb_security_group_id
  enable_https        = var.enable_https
  acm_certificate_arn = var.acm_certificate_arn
  tags                = local.common_tags
}

module "iam" {
  source = "./modules/iam"

  name_prefix                 = local.name_prefix
  database_url_secret_arn     = module.rds.database_url_secret_arn
  github_repository           = var.github_repository
  ecr_backend_repository_arn  = module.ecr.backend_repository_arn
  ecr_frontend_repository_arn = module.ecr.frontend_repository_arn
  tags                        = local.common_tags
}

module "ecs" {
  source = "./modules/ecs"

  name_prefix                = local.name_prefix
  environment                = var.environment
  aws_region                 = var.aws_region
  subnet_ids                 = module.vpc.app_subnet_ids
  assign_public_ip           = false
  backend_security_group_id  = module.security.ecs_backend_security_group_id
  frontend_security_group_id = module.security.ecs_frontend_security_group_id
  backend_target_group_arn   = module.alb.backend_target_group_arn
  frontend_target_group_arn  = module.alb.frontend_target_group_arn
  backend_image              = "${module.ecr.backend_repository_url}:${var.backend_image_tag}"
  frontend_image             = "${module.ecr.frontend_repository_url}:${var.frontend_image_tag}"
  backend_cpu                = var.backend_cpu
  backend_memory             = var.backend_memory
  frontend_cpu               = var.frontend_cpu
  frontend_memory            = var.frontend_memory
  backend_desired_count      = var.backend_desired_count
  frontend_desired_count     = var.frontend_desired_count
  execution_role_arn         = module.iam.ecs_execution_role_arn
  task_role_arn              = module.iam.ecs_task_role_arn
  database_url_secret_arn    = module.rds.database_url_secret_arn
  cors_origins               = local.cors_origins
  tags                       = local.common_tags

  depends_on = [module.rds, module.alb]
}
