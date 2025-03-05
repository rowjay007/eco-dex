variable "resource_group_name" {
  description = "Name of the resource group for PostgreSQL server"
  type        = string
}

variable "location" {
  description = "Azure region where the PostgreSQL server will be deployed"
  type        = string
  default     = "westeurope"
}

variable "server_name" {
  description = "Name of the PostgreSQL server"
  type        = string
}

variable "postgresql_version" {
  description = "Version of PostgreSQL to use"
  type        = string
  default     = "14"
}

variable "administrator_login" {
  description = "Administrator login for PostgreSQL server"
  type        = string
}

variable "administrator_password" {
  description = "Administrator password for PostgreSQL server"
  type        = string
  sensitive   = true
}

variable "database_name" {
  description = "Name of the database to create"
  type        = string
}

variable "subnet_id" {
  description = "ID of the subnet where the PostgreSQL server will be deployed"
  type        = string
}

variable "private_dns_zone_id" {
  description = "ID of the private DNS zone for PostgreSQL server"
  type        = string
}

variable "storage_mb" {
  description = "Storage size in MB"
  type        = number
  default     = 32768
}

variable "sku_name" {
  description = "SKU name for the PostgreSQL server"
  type        = string
  default     = "GP_Standard_D2s_v3"
}

variable "backup_retention_days" {
  description = "Backup retention days for the server"
  type        = number
  default     = 7
}

variable "geo_redundant_backup_enabled" {
  description = "Enable geo-redundant backups"
  type        = bool
  default     = false
}

variable "high_availability_mode" {
  description = "High availability mode for the server"
  type        = string
  default     = "ZoneRedundant"
}

variable "standby_availability_zone" {
  description = "Availability zone for the standby server"
  type        = string
  default     = "2"
}

variable "maintenance_window_day" {
  description = "Day of week for maintenance window"
  type        = number
  default     = 0
}

variable "maintenance_window_hour" {
  description = "Hour of day for maintenance window"
  type        = number
  default     = 0
}

variable "maintenance_window_minute" {
  description = "Minute of hour for maintenance window"
  type        = number
  default     = 0
}

variable "firewall_rules" {
  description = "Map of firewall rules to create"
  type = map(object({
    start_ip = string
    end_ip   = string
  }))
  default = {}
}

variable "tags" {
  description = "Tags to be applied to all resources"
  type        = map(string)
  default     = {}
}