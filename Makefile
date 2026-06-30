# ============================================================
# Makefile — DriveSmart DevOps Commands
# ============================================================
# Usage: make <target>
# 
# Prerequisites:
#   - Docker & Docker Compose v2
#   - Node.js 22+ (for local development)
#   - GNU Make
# ============================================================

# Default target
.DEFAULT_GOAL := help

# ============================================================
# Variables
# ============================================================
PROJECT_NAME := drivesmart
REGISTRY := ghcr.io/drivesmart-traffic-rules-learning-platform
IMAGE_TAG ?= $(shell git rev-parse --short HEAD 2>/dev/null || echo "latest")
COMPOSE_FILES := -f docker-compose.yml
ENV_FILE := .env

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# ============================================================
# Help
# ============================================================
.PHONY: help
help: ## Show this help message
	@echo ""
	@echo "$(BLUE)DriveSmart DevOps Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

# ============================================================
# Docker Commands
# ============================================================
.PHONY: docker-build docker-up docker-down docker-logs docker-clean

docker-build: ## Build all Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker compose $(COMPOSE_FILES) build --no-cache

docker-build-frontend: ## Build frontend Docker image
	@echo "$(BLUE)Building frontend image...$(NC)"
	docker build -f Dockerfile.frontend -t $(REGISTRY)/frontend:$(IMAGE_TAG) .

docker-build-backend: ## Build backend Docker image
	@echo "$(BLUE)Building backend image...$(NC)"
	docker build -f Dockerfile.backend -t $(REGISTRY)/backend:$(IMAGE_TAG) .

docker-up: ## Start all services in detached mode
	@echo "$(BLUE)Starting services...$(NC)"
	docker compose $(COMPOSE_FILES) up -d
	@echo "$(GREEN)Services started!$(NC)"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:3002"

docker-down: ## Stop all services
	@echo "$(YELLOW)Stopping services...$(NC)"
	docker compose $(COMPOSE_FILES) down

docker-logs: ## View logs from all services
	@docker compose $(COMPOSE_FILES) logs -f

docker-logs-frontend: ## View frontend logs
	@docker compose $(COMPOSE_FILES) logs -f frontend

docker-logs-backend: ## View backend logs
	@docker compose $(COMPOSE_FILES) logs -f backend

docker-clean: ## Remove all containers, volumes, and images
	@echo "$(RED)Cleaning Docker resources...$(NC)"
	docker compose $(COMPOSE_FILES) down -v --rmi all
	@echo "$(GREEN)Docker cleanup complete!$(NC)"

docker-restart: docker-down docker-up ## Restart all services

# ============================================================
# Development Commands
# ============================================================
.PHONY: dev install test test-unit test-e2e lint format typecheck

install: ## Install npm dependencies
	@echo "$(BLUE)Installing dependencies...$(NC)"
	npm ci

dev: ## Start development server
	@echo "$(BLUE)Starting development server...$(NC)"
	npm run dev

dev-all: ## Start frontend and backend dev servers
	@echo "$(BLUE)Starting all development servers...$(NC)"
	npm run dev:all

dev-backend: ## Start backend server only
	@echo "$(BLUE)Starting backend server...$(NC)"
	npm run dev:server

# ============================================================
# Testing Commands
# ============================================================
test: ## Run all tests (unit + e2e)
	@echo "$(BLUE)Running all tests...$(NC)"
	npm run test:run
	npm run test:e2e

test-unit: ## Run unit tests with Vitest
	@echo "$(BLUE)Running unit tests...$(NC)"
	npm run test:run -- --coverage

test-unit-watch: ## Run unit tests in watch mode
	@echo "$(BLUE)Running unit tests (watch mode)...$(NC)"
	npm run test

test-unit-ui: ## Run unit tests with UI
	@echo "$(BLUE)Running unit tests with UI...$(NC)"
	npm run test:ui

test-e2e: ## Run E2E tests with Playwright
	@echo "$(BLUE)Running E2E tests...$(NC)"
	npx playwright test

test-e2e-ui: ## Open Playwright UI
	@echo "$(BLUE)Opening Playwright UI...$(NC)"
	npx playwright test --ui

test-e2e-debug: ## Run E2E tests in debug mode
	@echo "$(BLUE)Running E2E tests (debug mode)...$(NC)"
	npx playwright test --debug

test-all: docker-up ## Run full test suite with Docker
	@echo "$(BLUE)Waiting for services...$(NC)"
	@sleep 10
	@make test-unit
	@make test-e2e
	@echo "$(GREEN)All tests passed!$(NC)"

# ============================================================
# Code Quality Commands
# ============================================================
lint: ## Run ESLint
	@echo "$(BLUE)Running ESLint...$(NC)"
	npm run lint

lint-fix: ## Fix ESLint issues automatically
	@echo "$(BLUE)Fixing ESLint issues...$(NC)"
	npm run lint:fix

format: ## Format code with Prettier
	@echo "$(BLUE)Formatting code...$(NC)"
	npm run format

typecheck: ## Run TypeScript type checking
	@echo "$(BLUE)Running TypeScript type check...$(NC)"
	npm run typecheck

check: lint typecheck ## Run all code quality checks

# ============================================================
# Build Commands
# ============================================================
.PHONY: build build-frontend build-backend build-preview clean

build: ## Build production bundle
	@echo "$(BLUE)Building production bundle...$(NC)"
	npm run build

build-frontend: ## Build frontend Docker image
	@echo "$(BLUE)Building frontend...$(NC)"
	docker build -f Dockerfile.frontend -t $(REGISTRY)/frontend:$(IMAGE_TAG) .

build-backend: ## Build backend Docker image
	@echo "$(BLUE)Building backend...$(NC)"
	docker build -f Dockerfile.backend -t $(REGISTRY)/backend:$(IMAGE_TAG) .

build-preview: ## Preview production build locally
	@echo "$(BLUE)Starting preview server...$(NC)"
	npm run preview

clean: ## Clean build artifacts
	@echo "$(BLUE)Cleaning build artifacts...$(NC)"
	npm run clean
	rm -rf node_modules/.vite
	rm -rf playwright-report
	rm -rf test-results
	rm -rf coverage
	rm -rf .nyc_output
	@echo "$(GREEN)Cleanup complete!$(NC)"

# ============================================================
# CI/CD Commands
# ============================================================
.PHONY: ci ci-build ci-test ci-deploy

ci: docker-up ## Run CI pipeline locally
	@echo "$(BLUE)Running CI pipeline...$(NC)"
	@sleep 5
	@make check
	@make test-unit
	@echo "$(GREEN)CI pipeline passed!$(NC)"

ci-build: docker-up ## Build images for CI
	@echo "$(BLUE)Building for CI...$(NC)"
	@sleep 5
	@make build
	@echo "$(GREEN)Build complete!$(NC)"

ci-test: ## Run CI tests
	@echo "$(BLUE)Running CI tests...$(NC)"
	@sleep 10
	@make check
	@make test-unit
	@echo "$(GREEN)CI tests passed!$(NC)"

# ============================================================
# Deployment Commands
# ============================================================
.PHONY: deploy deploy-staging deploy-production

deploy-staging: ## Deploy to staging environment
	@echo "$(BLUE)Deploying to staging...$(NC)"
	REGISTRY=$(REGISTRY) IMAGE_TAG=$(IMAGE_TAG) docker compose -f docker-compose.staging.yml up -d
	@echo "$(GREEN)Staging deployed!$(NC)"

deploy-production: ## Deploy to production environment
	@echo "$(RED)Deploying to production...$(NC)"
	@read -p "Are you sure? (y/N) " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		REGISTRY=$(REGISTRY) IMAGE_TAG=$(IMAGE_TAG) docker compose -f docker-compose.production.yml up -d; \
		echo "$(GREEN)Production deployed!$(NC)"; \
	else \
		echo "$(YELLOW)Deployment cancelled.$(NC)"; \
	fi

# ============================================================
# Database Commands
# ============================================================
.PHONY: db-migrate db-seed db-reset db-console

db-migrate: ## Run database migrations
	@echo "$(BLUE)Running database migrations...$(NC)"
	docker compose $(COMPOSE_FILES) exec backend npm run db:migrate

db-seed: ## Seed database with test data
	@echo "$(BLUE)Seeding database...$(NC)"
	docker compose $(COMPOSE_FILES) exec backend npm run db:seed

db-reset: ## Reset database (WARNING: destroys all data)
	@echo "$(RED)Resetting database...$(NC)"
	@read -p "This will delete all data. Continue? (y/N) " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose $(COMPOSE_FILES) exec postgres psql -U postgres -d drivesmart -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"; \
		docker compose $(COMPOSE_FILES) exec backend npm run db:migrate; \
		echo "$(GREEN)Database reset complete!$(NC)"; \
	else \
		echo "$(YELLOW)Reset cancelled.$(NC)"; \
	fi

db-console: ## Open PostgreSQL console
	docker compose $(COMPOSE_FILES) exec postgres psql -U postgres -d drivesmart

# ============================================================
# Utility Commands
# ============================================================
.PHONY: ps inspect-networks health-check ports

ps: ## Show running containers
	@docker compose $(COMPOSE_FILES) ps

inspect-networks: ## Show Docker networks
	@docker network ls | grep $(PROJECT_NAME)

health-check: ## Check health of all services
	@echo "$(BLUE)Checking service health...$(NC)"
	@curl -s http://localhost:3000/health && echo " $(GREEN)Frontend: OK$(NC)" || echo " $(RED)Frontend: FAIL$(NC)"
	@curl -s http://localhost:3002/api/listening/health && echo " $(GREEN)Backend: OK$(NC)" || echo " $(RED)Backend: FAIL$(NC)"

ports: ## Show exposed ports
	@echo "$(BLUE)Exposed Ports:$(NC)"
	@docker compose $(COMPOSE_FILES) ps --format "table {{.Name}}\t{{.Ports}}"

# ============================================================
# Security Commands
# ============================================================
.PHONY: security-scan security-update-deps

security-scan: ## Run security vulnerability scan
	@echo "$(BLUE)Running security scan...$(NC)"
	@docker run --rm -v $(PWD):/src aquasec/trivy fs --security-checks vuln /src

security-check-deps: ## Check for vulnerable dependencies
	@echo "$(BLUE)Checking dependencies...$(NC)"
	npm audit --audit-level=high

# ============================================================
# Maintenance Commands
# ============================================================
.PHONY: backup backup-db restore-db update-deps

backup: ## Backup application data
	@echo "$(BLUE)Creating backup...$(NC)"
	mkdir -p backups/$(shell date +%Y%m%d_%H%M%S)
	docker compose $(COMPOSE_FILES) exec -T postgres pg_dump -U postgres drivesmart > backups/$(shell date +%Y%m%d_%H%M%S)/database.sql
	@echo "$(GREEN)Backup created in backups/$(shell date +%Y%m%d_%H%M%S)/$(NC)"

backup-db: backup ## Backup database (alias)

restore-db: ## Restore database from backup
	@echo "$(RED)Restoring database...$(NC)"
	@read -p "Enter backup file path: " BACKUP_FILE; \
	docker compose $(COMPOSE_FILES) exec -T postgres psql -U postgres -d drivesmart < $$BACKUP_FILE; \
	echo "$(GREEN)Database restored!$(NC)"

update-deps: ## Update npm dependencies
	@echo "$(BLUE)Updating dependencies...$(NC)"
	npm update
	@echo "$(GREEN)Dependencies updated!$(NC)"

# ============================================================
# Version & Info
# ============================================================
.PHONY: version info

version: ## Show current version
	@echo "Current version: $(IMAGE_TAG)"
	@git describe --tags --abbrev=0 2>/dev/null || echo "No tags found"

info: ## Show environment information
	@echo "$(BLUE)DriveSmart Environment Info$(NC)"
	@echo ""
	@echo "Node version:    $$(node --version)"
	@echo "npm version:     $$(npm --version)"
	@echo "Docker version:  $$(docker --version)"
	@echo "Compose version: $$(docker compose version)"
	@echo "Git commit:      $(shell git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
	@echo "Image tag:       $(IMAGE_TAG)"
	@echo ""

# ============================================================
# Tagging & Release
# ============================================================
.PHONY: tag tag-patch tag-minor tag-major release

tag: ## Tag the current commit for release
	@echo "$(BLUE)Creating tag...$(NC)"
	git tag -a $(IMAGE_TAG) -m "Release $(IMAGE_TAG)"
	git push origin $(IMAGE_TAG)

tag-patch: ## Create a patch release (v1.0.x)
	@VERSION=$$(git describe --tags --abbrev=0 2>/dev/null || echo "v1.0.0"); \
	MAJOR=$${VERSION%%.*}; \
	REST=$${VERSION#*.}; \
	MINOR=$${REST%%.*}; \
	PATCH=$${REST#*.}; \
	NEW_PATCH=$$((PATCH + 1)); \
	NEW_VERSION="$$MAJOR.$$MINOR.$$NEW_PATCH"; \
	echo "Creating tag $$NEW_VERSION"; \
	git tag -a $$NEW_VERSION -m "Release $$NEW_VERSION"; \
	git push origin $$NEW_VERSION

tag-minor: ## Create a minor release (v1.x.0)
	@VERSION=$$(git describe --tags --abbrev=0 2>/dev/null || echo "v1.0.0"); \
	MAJOR=$${VERSION%%.*}; \
	REST=$${VERSION#*.}; \
	MINOR=$${REST%%.*}; \
	NEW_MINOR=$$((MINOR + 1)); \
	NEW_VERSION="$$MAJOR.$$NEW_MINOR.0"; \
	echo "Creating tag $$NEW_VERSION"; \
	git tag -a $$NEW_VERSION -m "Release $$NEW_VERSION"; \
	git push origin $$NEW_VERSION

tag-major: ## Create a major release (x.0.0)
	@VERSION=$$(git describe --tags --abbrev=0 2>/dev/null || echo "v1.0.0"); \
	MAJOR=$${VERSION%%.*}; \
	NEW_MAJOR=$$((MAJOR + 1)); \
	NEW_VERSION="$$NEW_MAJOR.0.0"; \
	echo "Creating tag $$NEW_VERSION"; \
	git tag -a $$NEW_VERSION -m "Release $$NEW_VERSION"; \
	git push origin $$NEW_VERSION

release: tag ## Create a release (alias for tag)

# ============================================================
# Documentation
# ============================================================
.PHONY: docs docs-serve

docs: ## Generate documentation
	@echo "$(BLUE)Generating documentation...$(NC)"
	@# Add documentation generation commands here
	@echo "$(GREEN)Documentation ready!$(NC)"

# ============================================================
# Kubernetes (Optional)
# ============================================================
.PHONY: k8s-apply k8s-delete k8s-logs k8s-status

k8s-apply: ## Apply Kubernetes manifests
	@echo "$(BLUE)Applying Kubernetes manifests...$(NC)"
	kubectl apply -f k8s/

k8s-delete: ## Delete Kubernetes resources
	@echo "$(RED)Deleting Kubernetes resources...$(NC)"
	kubectl delete -f k8s/

k8s-logs: ## Show Kubernetes logs
	@kubectl logs -f -l app=$(PROJECT_NAME)

k8s-status: ## Show Kubernetes deployment status
	@kubectl get pods -l app=$(PROJECT_NAME)
