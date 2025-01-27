# Makefile for E-commerce Platform

.PHONY: help build test clean docker-up docker-down

help:
	@echo "Available commands:"
	@echo "  make build        - Build all services"
	@echo "  make test         - Run all tests"
	@echo "  make clean        - Clean up build artifacts"
	@echo "  make docker-up    - Start all services using Docker Compose"
	@echo "  make docker-down  - Stop all services"

build:
	for service in services/*; do \
		if [ -f $$service/package.json ]; then \
			cd $$service && npm install && cd ../..; \
		fi \
	done

test:
	for service in services/*; do \
		if [ -f $$service/package.json ]; then \
			cd $$service && npm test && cd ../..; \
		fi \
	done

clean:
	find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

# Docker commands
docker-up:
	docker-compose up --build -d

docker-down:
	docker-compose down

# Development environment setup
dev-setup:
	mkdir -p services/user-service/src/{controllers,models,middlewares,routes,services,utils,config}
	mkdir -p services/product-service/src/{controllers,models,routes,services,cache,config}
	mkdir -p services/cart-service/src/{controllers,models,routes,services,config}
	mkdir -p services/order-service/src/{controllers,models,routes,services,events,config}
	mkdir -p services/payment-service/src/{controllers,providers,routes,services,config}
	mkdir -p services/notification-service/src/{controllers,providers,templates,services,config}
	mkdir -p infrastructure/{terraform/{modules,environments},kubernetes/{base,overlays},nginx/conf.d,monitoring/{prometheus,grafana,elk}}
	mkdir -p docs/{api,architecture,deployment}
	mkdir -p .github/workflows
	mkdir -p scripts