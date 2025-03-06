# Production Environment Variables

variable "db_password" {
  description = "The administrator password for the PostgreSQL server"
  type        = string
  sensitive   = true
}

variable "ops_team_email" {
  description = "Email address for the operations team to receive alerts"
  type        = string
}

variable "environment" {
  description = "The environment name"
  type        = string
  default     = "production"
}

variable "location" {
  description = "The Azure region where resources will be created"
  type        = string
  default     = "westeurope"
}

variable "tags" {
  description = "Additional tags for all resources"
  type        = map(string)
  default     = {}
}