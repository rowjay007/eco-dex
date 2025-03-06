#!/bin/bash

# Setup script for eco-dex development environment
set -e

# Color codes for output
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

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

# Check required tools
check_requirements() {
    log_info "Checking required tools..."
    
    command -v docker >/dev/null 2>&1 || log_error "Docker is required but not installed."
    command -v docker-compose >/dev/null 2>&1 || log_error "Docker Compose is required but not installed."
    command -v node >/dev/null 2>&1 || log_error "Node.js is required but not installed."
    command -v npm >/dev/null 2>&1 || log_error "npm is required but not installed."
    
    log_info "All required tools are available."
}

# Setup environment files
setup_env_files() {
    log_info "Setting up environment files..."
    
    # Copy root .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        cp .env.example .env || log_error "Failed to create root .env file"
    fi
    
    # Setup service-specific .env files
    for service in services/*; do
        if [ -d "$service" ] && [ -f "$service/.env.example" ]; then
            if [ ! -f "$service/.env" ]; then
                cp "$service/.env.example" "$service/.env" || log_warn "Failed to create .env for $service"
            fi
        fi
    done
    
    log_info "Environment files setup completed."
}

# Install dependencies
install_dependencies() {
    log_info "Installing project dependencies..."
    
    # Install root dependencies
    npm install || log_error "Failed to install root dependencies"
    
    # Install service dependencies
    for service in services/*; do
        if [ -d "$service" ] && [ -f "$service/package.json" ]; then
            log_info "Installing dependencies for $(basename $service)..."
            (cd "$service" && npm install) || log_warn "Failed to install dependencies for $(basename $service)"
        fi
    done
    
    log_info "Dependencies installation completed."
}

# Initialize databases
init_databases() {
    log_info "Initializing databases..."
    
    # Run database migrations for each service
    for service in services/*; do
        if [ -d "$service" ] && [ -f "$service/package.json" ]; then
            if grep -q "\"migrate\"" "$service/package.json"; then
                log_info "Running migrations for $(basename $service)..."
                (cd "$service" && npm run migrate) || log_warn "Failed to run migrations for $(basename $service)"
            fi
        fi
    done
    
    log_info "Database initialization completed."
}

# Main setup process
main() {
    log_info "Starting eco-dex setup..."
    
    check_requirements
    setup_env_files
    install_dependencies
    init_databases
    
    log_info "Setup completed successfully!"
    log_info "You can now start the services using: docker-compose up"
}

# Execute main function
main