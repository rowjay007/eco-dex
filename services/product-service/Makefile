.PHONY: install build dev start test lint format clean

install:
	npm ci

build:
	npm run build

dev:
	npm run dev

start:
	npm start

test:
	npm test

lint:
	npm run lint

format:
	npm run format

clean:
	rm -rf node_modules dist

docker-build:
	docker build -t eco-dex/product-service .

docker-run:
	docker run -p 3000:3000 --env-file .env eco-dex/product-service