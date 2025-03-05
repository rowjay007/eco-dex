output "server_id" {
  description = "The ID of the PostgreSQL server"
  value       = azurerm_postgresql_flexible_server.main.id
}

output "server_name" {
  description = "The name of the PostgreSQL server"
  value       = azurerm_postgresql_flexible_server.main.name
}

output "server_fqdn" {
  description = "The FQDN of the PostgreSQL server"
  value       = azurerm_postgresql_flexible_server.main.fqdn
}

output "database_name" {
  description = "The name of the created database"
  value       = azurerm_postgresql_flexible_server_database.main.name
}

output "administrator_login" {
  description = "The administrator login for the PostgreSQL server"
  value       = var.administrator_login
  sensitive   = true
}

output "resource_group_name" {
  description = "The name of the resource group containing the PostgreSQL server"
  value       = azurerm_resource_group.postgresql.name
}

output "connection_string" {
  description = "The connection string for the PostgreSQL database"
  value       = "postgresql://${var.administrator_login}@${azurerm_postgresql_flexible_server.main.name}:${var.administrator_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/${var.database_name}"
  sensitive   = true
}