# Production Environment Configuration

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "rg-ecodex-prod"
  location = "westeurope"
  tags = {
    Environment = "Production"
    Project     = "EcoDex"
  }
}

# Virtual Network
resource "azurerm_virtual_network" "main" {
  name                = "vnet-ecodex-prod"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  address_space       = ["10.0.0.0/16"]

  tags = {
    Environment = "Production"
    Project     = "EcoDex"
  }
}

# Subnets
resource "azurerm_subnet" "aks" {
  name                 = "snet-aks-prod"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_subnet" "database" {
  name                 = "snet-database-prod"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.2.0/24"]
  
  delegation {
    name = "fs"
    service_delegation {
      name = "Microsoft.DBforPostgreSQL/flexibleServers"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/join/action"
      ]
    }
  }
}

# Private DNS Zone for PostgreSQL
resource "azurerm_private_dns_zone" "postgresql" {
  name                = "ecodex.postgres.database.azure.com"
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_private_dns_zone_virtual_network_link" "postgresql" {
  name                  = "postgresql-vnet-link"
  private_dns_zone_name = azurerm_private_dns_zone.postgresql.name
  resource_group_name   = azurerm_resource_group.main.name
  virtual_network_id    = azurerm_virtual_network.main.id
}

# Database Module
module "database" {
  source = "../../modules/database"

  resource_group_name = "rg-ecodex-db-prod"
  location            = azurerm_resource_group.main.location
  server_name         = "psql-ecodex-prod"
  database_name       = "ecodexdb"
  
  administrator_login    = "ecodexadmin"
  administrator_password = "${var.db_password}"
  
  subnet_id           = azurerm_subnet.database.id
  private_dns_zone_id = azurerm_private_dns_zone.postgresql.id
  
  sku_name = "GP_Standard_D4s_v3"
  storage_mb = 65536
  
  backup_retention_days = 7
  geo_redundant_backup_enabled = true
  
  high_availability_mode = "ZoneRedundant"
  
  tags = {
    Environment = "Production"
    Project     = "EcoDex"
  }
}

# Kubernetes Module
module "kubernetes" {
  source = "../../modules/kubernetes"

  resource_group_name = "rg-ecodex-aks-prod"
  location            = azurerm_resource_group.main.location
  cluster_name        = "aks-ecodex-prod"
  dns_prefix          = "ecodex-prod"
  
  kubernetes_version = "1.26.0"
  node_count        = 3
  vm_size           = "Standard_D4s_v3"
  
  min_node_count = 2
  max_node_count = 5
  
  subnet_id = azurerm_subnet.aks.id
  
  tags = {
    Environment = "Production"
    Project     = "EcoDex"
  }
}

# Monitoring Module
module "monitoring" {
  source = "../../modules/monitoring"

  resource_group_name = "rg-ecodex-monitoring-prod"
  location            = azurerm_resource_group.main.location
  workspace_name      = "log-ecodex-prod"
  
  action_group_name       = "ag-ecodex-prod"
  action_group_short_name = "ecodexprod"
  
  email_receivers = [
    {
      name          = "ops-team"
      email_address = var.ops_team_email
    }
  ]
  
  aks_cluster_name = module.kubernetes.cluster_name
  aks_cluster_id   = module.kubernetes.cluster_id
  
  postgresql_server_name = module.database.server_name
  postgresql_server_id   = module.database.server_id
  
  retention_days = 30
  
  tags = {
    Environment = "Production"
    Project     = "EcoDex"
  }
}