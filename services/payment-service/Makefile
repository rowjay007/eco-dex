.PHONY: install build dev test lint clean migrate generate docker-build docker-run

all: install build

install:
	npm install

build:
	npm run build

dev:
	npm run dev

test:
	npm run test

lint:
	npm run lint

clean:
	rm -rf dist
	rm -rf coverage

migrate:
	npm run migrate

generate:
	npm run generate

docker-build:
	docker build -t eco-dex/payment-service .

docker-run:
	docker run -p 3005:3005 \
		--env-file .env \
		eco-dex/payment-service

help:
	@echo "Available targets:"
	@echo "  install     - Install dependencies"
	@echo "  build      - Build the application"
	@echo "  dev        - Run in development mode"
	@echo "  test       - Run tests"
	@echo "  lint       - Run linter"
	@echo "  clean      - Clean build artifacts"
	@echo "  migrate    - Run database migrations"
	@echo "  generate   - Generate database types"
	@echo "  docker-build - Build Docker image"
	@echo "  docker-run   - Run Docker container"
