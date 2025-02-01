.PHONY: help dev build start watch db-init

help:
	@echo "Available commands:"
	@echo "  make dev         - Start development server with watch mode"
	@echo "  make build       - Build the application"
	@echo "  make start       - Start the production server"
	@echo "  make db-init     - Initialize database connection"

dev: db-init
	npm run dev

build:
	npm run build

start: db-init build
	npm start

watch:
	nodemon --watch 'src/**/*.ts' --exec 'ts-node' src/app.ts

db-init:
	@echo "Checking database connection..."
	@node -e "const {config}=require('dotenv');config();const {Pool}=require('pg');const pool=new Pool({user:process.env.DB_USER,password:process.env.DB_PASSWORD,host:process.env.DB_HOST,port:process.env.DB_PORT,database:process.env.DB_NAME});pool.query('SELECT NOW()').then(()=>{console.log('Database connection successful!');process.exit(0);}).catch(err=>{console.error('Database connection failed:',err.message);process.exit(1);});"