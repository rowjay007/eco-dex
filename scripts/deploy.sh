#!/bin/bash

# Deployment script for eco-dex services
set -e

# Color codes for output
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

# Default values
ENVIRONMENT="development"
SERVICES="all"

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Help message
show_help() {
    echo "Usage: $0 [-e <environment>] [-s <services>]"
    echo "Options:"
    echo "  -e  Target environment (development|staging|production) [default: development]"
    echo "  -s  Services to deploy (comma-separated, or 'all') [default: all]"
    echo "  -h  Show this help message"
    exit 0
}

# Parse command line arguments
while getopts "e:s:h" opt; do
    case $opt in
        e) ENVIRONMENT="$OPTARG" ;;
        s) SERVICES="$OPTARG" ;;
        h) show_help ;;
        ?) show_help ;;
    esac
 done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    log_error "Invalid environment: $ENVIRONMENT"
fi

# Deploy a single service
deploy_service() {
    local service=$1
    log_info "Deploying $service to $ENVIRONMENT..."

    # Check if service directory exists
    if [ ! -d "services/$service" ]; then
        log_error "Service '$service' not found"
    fi

    # Build and push Docker image
    docker build -t "eco-dex/$service:latest" "services/$service" || log_error "Failed to build $service"
    
    if [ "$ENVIRONMENT" != "development" ]; then
        # Tag and push to registry (adjust registry URL as needed)
        docker tag "eco-dex/$service:latest" "registry.example.com/eco-dex/$service:latest"
        docker push "registry.example.com/eco-dex/$service:latest" || log_warn "Failed to push $service image"
    fi

    # Apply Kubernetes manifests if not in development
    if [ "$ENVIRONMENT" != "development" ]; then
        kubectl apply -k "infrastructure/kubernetes/overlays/$ENVIRONMENT/$service" || log_warn "Failed to apply K8s manifests for $service"
    fi

    log_info "$service deployment completed"
}

# Main deployment process
main() {
    log_info "Starting deployment to $ENVIRONMENT environment"

    # Deploy all services or specific ones
    if [ "$SERVICES" = "all" ]; then
        for service in services/*; do
            if [ -d "$service" ]; then
                deploy_service "$(basename $service)"
            fi
        done
    else
        IFS=',' read -ra SERVICE_ARRAY <<< "$SERVICES"
        for service in "${SERVICE_ARRAY[@]}"; do
            deploy_service "$service"
        done
    fi

    log_info "Deployment completed successfully!"
}

# Execute main function
main