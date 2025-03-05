# Infrastructure Configuration

This directory contains all infrastructure configurations for the Eco-Dex e-commerce platform using Azure cloud services.

## Directory Structure

```
├── terraform/           # Infrastructure as Code configurations
│   ├── modules/        # Reusable Terraform modules
│   ├── environments/   # Environment-specific configurations
│   └── backend.tf      # Terraform backend configuration
├── kubernetes/         # Kubernetes manifests
│   ├── base/          # Base configurations
│   └── overlays/      # Environment-specific overlays
├── nginx/             # API Gateway configuration
└── monitoring/        # Monitoring stack setup
```

## Components

### Terraform
- **modules/kubernetes**: Azure Kubernetes Service (AKS) cluster configuration
- **modules/database**: Azure Database for PostgreSQL setup
- **modules/monitoring**: Azure Monitor and Log Analytics configuration

### Kubernetes
- Base configurations for all microservices
- Environment-specific overlays using Kustomize

### Nginx
- API Gateway configuration
- SSL/TLS settings

### Monitoring
- Prometheus for metrics collection
- Grafana for visualization
- ELK Stack for log aggregation

## Getting Started

1. Set up Azure credentials
2. Initialize Terraform
3. Apply infrastructure configurations
4. Deploy Kubernetes resources

Refer to specific component documentation for detailed setup instructions.

## Best Practices

- Use Terraform workspaces for environment isolation
- Follow GitOps workflow for Kubernetes deployments
- Implement proper secret management
- Regular infrastructure backup and disaster recovery testing
- Monitor and optimize resource usage