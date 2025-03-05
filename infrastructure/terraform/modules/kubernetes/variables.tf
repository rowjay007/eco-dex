variable "resource_group_name" {
  description = "Name of the resource group for AKS cluster"
  type        = string
}

variable "location" {
  description = "Azure region where the AKS cluster will be deployed"
  type        = string
  default     = "westeurope"
}

variable "cluster_name" {
  description = "Name of the AKS cluster"
  type        = string
}

variable "dns_prefix" {
  description = "DNS prefix for the AKS cluster"
  type        = string
}

variable "kubernetes_version" {
  description = "Kubernetes version for the AKS cluster"
  type        = string
  default     = "1.26.0"
}

variable "node_count" {
  description = "Initial number of nodes in the default node pool"
  type        = number
  default     = 2
}

variable "vm_size" {
  description = "Size of the VMs in the default node pool"
  type        = string
  default     = "Standard_D2s_v3"
}

variable "min_node_count" {
  description = "Minimum number of nodes for auto-scaling"
  type        = number
  default     = 1
}

variable "max_node_count" {
  description = "Maximum number of nodes for auto-scaling"
  type        = number
  default     = 5
}

variable "subnet_id" {
  description = "ID of the subnet where the AKS cluster will be deployed"
  type        = string
}

variable "admin_group_object_ids" {
  description = "List of Azure AD group object IDs that will have admin access to the cluster"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Tags to be applied to all resources"
  type        = map(string)
  default     = {}
}