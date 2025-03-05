# Azure Monitoring Module

resource "azurerm_resource_group" "monitoring" {
  name     = var.resource_group_name
  location = var.location
  tags     = var.tags
}

resource "azurerm_log_analytics_workspace" "main" {
  name                = var.workspace_name
  location            = azurerm_resource_group.monitoring.location
  resource_group_name = azurerm_resource_group.monitoring.name
  sku                 = var.workspace_sku
  retention_in_days   = var.retention_days
  tags                = var.tags
}

resource "azurerm_monitor_action_group" "main" {
  name                = var.action_group_name
  resource_group_name = azurerm_resource_group.monitoring.name
  short_name          = var.action_group_short_name

  dynamic "email_receiver" {
    for_each = var.email_receivers
    content {
      name                    = email_receiver.value.name
      email_address           = email_receiver.value.email_address
      use_common_alert_schema = true
    }
  }

  dynamic "webhook_receiver" {
    for_each = var.webhook_receivers
    content {
      name                    = webhook_receiver.value.name
      service_uri             = webhook_receiver.value.service_uri
      use_common_alert_schema = true
    }
  }
}

resource "azurerm_monitor_diagnostic_setting" "aks" {
  name                       = "${var.aks_cluster_name}-diagnostics"
  target_resource_id         = var.aks_cluster_id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  dynamic "log" {
    for_each = var.aks_diagnostic_logs
    content {
      category = log.value
      enabled  = true

      retention_policy {
        enabled = true
        days    = var.retention_days
      }
    }
  }

  metric {
    category = "AllMetrics"
    enabled  = true

    retention_policy {
      enabled = true
      days    = var.retention_days
    }
  }
}

resource "azurerm_monitor_diagnostic_setting" "postgresql" {
  name                       = "${var.postgresql_server_name}-diagnostics"
  target_resource_id         = var.postgresql_server_id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  dynamic "log" {
    for_each = var.postgresql_diagnostic_logs
    content {
      category = log.value
      enabled  = true

      retention_policy {
        enabled = true
        days    = var.retention_days
      }
    }
  }

  metric {
    category = "AllMetrics"
    enabled  = true

    retention_policy {
      enabled = true
      days    = var.retention_days
    }
  }
}