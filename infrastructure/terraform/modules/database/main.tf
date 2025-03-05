# Azure Database for PostgreSQL Module

resource "azurerm_resource_group" "postgresql" {
  name     = var.resource_group_name
  location = var.location
  tags     = var.tags
}

resource "azurerm_postgresql_flexible_server" "main" {
  name                = var.server_name
  resource_group_name = azurerm_resource_group.postgresql.name
  location            = azurerm_resource_group.postgresql.location
  version             = var.postgresql_version
  delegated_subnet_id = var.subnet_id
  private_dns_zone_id = var.private_dns_zone_id

  administrator_login    = var.administrator_login
  administrator_password = var.administrator_password

  storage_mb = var.storage_mb
  sku_name   = var.sku_name

  backup_retention_days = var.backup_retention_days
  geo_redundant_backup_enabled = var.geo_redundant_backup_enabled

  high_availability {
    mode                      = var.high_availability_mode
    standby_availability_zone = var.standby_availability_zone
  }

  maintenance_window {
    day_of_week  = var.maintenance_window_day
    start_hour   = var.maintenance_window_hour
    start_minute = var.maintenance_window_minute
  }

  tags = var.tags
}

resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = var.database_name
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "main" {
  for_each = var.firewall_rules

  name             = each.key
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = each.value.start_ip
  end_ip_address   = each.value.end_ip
}