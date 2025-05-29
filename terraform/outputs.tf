output "ecr_repository_url" {
  value = aws_ecr_repository.medusa_ecr.repository_url
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.medusa_cluster.name
}

output "medusa_service_name" {
  value = aws_ecs_service.medusa_service.name
}

