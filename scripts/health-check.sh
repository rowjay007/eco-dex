#!/bin/bash

# Health check script for eco-dex services
set -e

# Color codes for output
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

# Default values
TIMEOUT=5
VERBOSE=false

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Help message
show_help() {
    echo "Usage: $0 [-t <timeout>] [-v]"
    echo "Options:"
    echo "  -t  Timeout in seconds for each health check [default: 5]"
    echo "  -v  Verbose output"
    echo "  -h  Show this help message"
    exit 0
}

# Parse command line arguments
while getopts "t:vh" opt; do
    case $opt in
        t) TIMEOUT="$OPTARG" ;;
        v) VERBOSE=true ;;
        h) show_help ;;
        ?) show_help ;;
    esac
done

# Check if a service is healthy
check_service() {
    local service=$1
    local port=$2
    local endpoint=${3:-/health}
    local status

    if $VERBOSE; then
        log_info "Checking $service on port $port..."
    fi

    status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $TIMEOUT http://localhost:$port$endpoint)

    if [ "$status" = "200" ]; then
        log_info "✓ $service is healthy"
        return 0
    else
        log_error "✗ $service is not healthy (Status: $status)"
        return 1
    fi
}

# Check infrastructure services
check_infrastructure() {
    local failed=0

    log_info "Checking infrastructure services..."

    # Check PostgreSQL
    if nc -z localhost 5432 2>/dev/null; then
        log_info "✓ PostgreSQL is running"
    else
        log_error "✗ PostgreSQL is not running"
        ((failed++))
    fi

    # Check Redis
    if nc -z localhost 6379 2>/dev/null; then
        log_info "✓ Redis is running"
    else
        log_error "✗ Redis is not running"
        ((failed++))
    fi

    # Check Kafka
    if nc -z localhost 9092 2>/dev/null; then
        log_info "✓ Kafka is running"
    else
        log_error "✗ Kafka is not running"
        ((failed++))
    fi

    return $failed
}

# Check all microservices
check_microservices() {
    local failed=0

    log_info "Checking microservices..."

    # Check User Service
    check_service "User Service" 3001 || ((failed++))

    # Check Product Service
    check_service "Product Service" 3002 || ((failed++))

    # Check Cart Service
    check_service "Cart Service" 3003 || ((failed++))

    # Check Order Service
    check_service "Order Service" 3004 || ((failed++))

    # Check Payment Service
    check_service "Payment Service" 3005 || ((failed++))

    # Check Notification Service
    check_service "Notification Service" 3006 || ((failed++))

    return $failed
}

# Main health check process
main() {
    local infra_status=0
    local services_status=0

    log_info "Starting health checks..."

    check_infrastructure
    infra_status=$?

    check_microservices
    services_status=$?

    if [ $infra_status -eq 0 ] && [ $services_status -eq 0 ]; then
        log_info "All systems are healthy!"
        exit 0
    else
        log_error "Some systems are unhealthy. Please check the logs above."
        exit 1
    fi
}

# Execute main function
main