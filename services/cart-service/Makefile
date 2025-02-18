.PHONY: build test dev docker-build docker-push clean

# Variables
SERVICE_NAME=cart-service
DOCKER_REGISTRY=your-registry
DOCKER_IMAGE=$(DOCKER_REGISTRY)/$(SERVICE_NAME)
DOCKER_TAG=$(shell git rev-parse --short HEAD)

# Development commands
build:
	npm run build

dev:
	npm run dev

test:
	npm run test

test-unit:
	npm run test:unit

test-integration:
	npm run test:integration

lint:
	npm run lint

format:
	npm run format

# Docker commands
docker-build:
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .

docker-push:
	docker push $(DOCKER_IMAGE):$(DOCKER_TAG)

# Database commands
db-setup:
	npm run drizzle:setup

# Cleanup
clean:
	rm -rf dist
	rm -rf node_modules