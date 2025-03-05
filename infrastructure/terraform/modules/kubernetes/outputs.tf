output "cluster_id" {
  description = "The ID of the AKS cluster"
  value       = azurerm_kubernetes_cluster.aks.id
}

output "cluster_name" {
  description = "The name of the AKS cluster"
  value       = azurerm_kubernetes_cluster.aks.name
}

output "resource_group_name" {
  description = "The name of the resource group where the AKS cluster is deployed"
  value       = azurerm_resource_group.aks.name
}

output "kube_config" {
  description = "Kubeconfig for connecting to the cluster"
  value       = azurerm_kubernetes_cluster.aks.kube_config_raw
  sensitive   = true
}

output "cluster_fqdn" {
  description = "The FQDN of the AKS cluster"
  value       = azurerm_kubernetes_cluster.aks.fqdn
}

output "cluster_endpoint" {
  description = "The endpoint for the Kubernetes API"
  value       = azurerm_kubernetes_cluster.aks.kube_config[0].host
}

output "identity_principal_id" {
  description = "The Principal ID of the System Assigned Managed Identity"
  value       = azurerm_kubernetes_cluster.aks.identity[0].principal_id
}