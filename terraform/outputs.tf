output "ecs_cluster" {
  value = aws_ecs_cluster.medusa.name
}

output "service_name" {
  value = aws_ecs_service.medusa.name
}

