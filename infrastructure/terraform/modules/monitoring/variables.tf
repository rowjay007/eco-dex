variable "resource_group_name" {
  description = "Name of the resource group for monitoring resources"
  type        = string
}

variable "location" {
  description = "Azure region where the monitoring resources will be deployed"
  type        = string
  default     = "westeurope"
}

variable "workspace_name" {
  description = "Name of the Log Analytics workspace"
  type        = string
}

variable "workspace_sku" {
  description = "SKU of the Log Analytics workspace"
  type        = string
  default     = "PerGB2018"
}

variable "retention_days" {
  description = "Number of days to retain logs"
  type        = number
  default     = 30
}

variable "action_group_name" {
  description = "Name of the Azure Monitor action group"
  type        = string
}

variable "action_group_short_name" {
  description = "Short name of the Azure Monitor action group"
  type        = string
}

variable "email_receivers" {
  description = "List of email receivers for alerts"
  type = list(object({
    name          = string
    email_address = string
  }))
  default = []
}

variable "webhook_receivers" {
  description = "List of webhook receivers for alerts"
  type = list(object({
    name        = string
    service_uri = string
  }))
  default = []
}

variable "aks_cluster_name" {
  description = "Name of the AKS cluster for diagnostics settings"
  type        = string
}

variable "aks_cluster_id" {
  description = "Resource ID of the AKS cluster"
  type        = string
}

variable "aks_diagnostic_logs" {
  description = "List of diagnostic log categories to enable for AKS"
  type        = list(string)
  default     = ["kube-apiserver", "kube-controller-manager", "kube-scheduler", "kube-audit"]
}

variable "postgresql_server_name" {
  description = "Name of the PostgreSQL server for diagnostics settings"
  type        = string
}

variable "postgresql_server_id" {
  description = "Resource ID of the PostgreSQL server"
  type        = string
}

variable "postgresql_diagnostic_logs" {
  description = "List of diagnostic log categories to enable for PostgreSQL"
  type        = list(string)
  default     = ["PostgreSQLLogs", "QueryStoreRuntimeStatistics", "QueryStoreWaitStatistics"]
}

variable "tags" {
  description = "Tags to be applied to all resources"
  type        = map(string)
  default     = {}
}