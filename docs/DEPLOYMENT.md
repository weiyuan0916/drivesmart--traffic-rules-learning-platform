# ============================================================
# DEPLOYMENT.md — DriveSmart Deployment Guide
# Complete CI/CD and Deployment Documentation
# ============================================================

## Table of Contents

1. [Overview](#overview)
2. [CI/CD Pipeline](#cicd-pipeline)
3. [Environment Setup](#environment-setup)
4. [Deployment](#deployment)
5. [Monitoring](#monitoring)
6. [Rollback](#rollback)

---

## Overview

DriveSmart uses a modern CI/CD pipeline with GitHub Actions and Docker.

### Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   GitHub        │────▶│  GitHub        │
│   Repository    │     │  Actions       │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
             ┌──────────┐ ┌──────────┐ ┌──────────┐
             │  Lint &  │ │  Build   │ │  Tests   │
             │  Types   │ │  Docker  │ │  Unit/E2E │
             └────┬─────┘ └────┬─────┘ └────┬─────┘
                  │            │            │
                  └────────────┼────────────┘
                               ▼
                    ┌─────────────────┐
                    │  Security Scan  │
                    │  (Trivy)        │
                    └────────┬────────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                      ▼
             ┌──────────┐          ┌──────────┐
             │ Staging  │          │Production│
             │ Deploy   │─────────▶│ Deploy   │
             └──────────┘          └──────────┘
```

### Services

| Service | Technology | Port | Description |
|---------|------------|------|-------------|
| Frontend | React + Vite + Nginx | 80/3000 | SPA with API proxy |
| Backend | Node.js + Express | 3002 | REST API |
| Database | PostgreSQL | 5432 | Primary database |
| Cache | Redis | 6379 | Session & data cache |

---

## CI/CD Pipeline

### Pipeline Stages

| Stage | Job | Description |
|-------|-----|-------------|
| 1 | Lint & Types | ESLint + TypeScript check |
| 2 | Unit Tests | Vitest with coverage |
| 3 | Build | Docker images (frontend + backend) |
| 4 | E2E Tests | Playwright integration tests |
| 5 | Security | Trivy vulnerability scan |
| 6 | Staging Deploy | Auto-deploy on main/develop |
| 7 | Production Deploy | Auto-deploy on main only |
| 8 | Release | GitHub Release creation |

### Triggers

| Event | Trigger | Pipeline |
|-------|---------|----------|
| Push to main | `git push` | Full CI/CD |
| Push to develop | `git push` | Full CI/CD (staging only) |
| PR opened/synced | - | PR Validation only |
| Release tag | `git tag v*` | Production deploy |
| Manual | Workflow dispatch | Select environment |

### Quality Gates

| Gate | Threshold | Action on Failure |
|------|-----------|-------------------|
| ESLint | 0 warnings | Block pipeline |
| TypeScript | 0 errors | Block pipeline |
| Unit Tests | 80% coverage | Block pipeline |
| E2E Tests | All pass | Block deploy |
| Security Scan | No CRITICAL | Block deploy |

---

## Environment Setup

### Prerequisites

```bash
# Required tools
- Docker >= 24.0
- Docker Compose >= v2
- Node.js >= 22
- GNU Make
```

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/drivesmart-traffic-rules-learning-platform/drivesmart.git
cd drivesmart

# 2. Setup environment
cp .env.example .env.local

# 3. Start services
make docker-up

# 4. Verify
curl http://localhost:3000/health
curl http://localhost:3002/api/listening/health
```

### GitHub Secrets Required

| Secret | Description | Required For |
|--------|-------------|--------------|
| CODECOV_TOKEN | Codecov upload token | Coverage reports |
| GHCR_TOKEN | Container registry | Image push |

---

## Deployment

### Automated Deployment

Deployments are automated through GitHub Actions:

#### Staging (on push to main/develop)
1. Build Docker images
2. Run all tests
3. Security scan
4. Deploy to staging
5. Health check

#### Production (on push to main)
1. Wait for staging to be healthy
2. Deploy to production
3. Health check
4. Create GitHub Release

### Manual Deployment

```bash
# Build images
make docker-build

# Deploy to staging
make deploy-staging

# Deploy to production (with confirmation)
make deploy-production
```

### Docker Commands

```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Clean up everything
docker compose down -v --rmi all
```

---

## Monitoring

### Health Checks

```bash
# Frontend
curl http://localhost:3000/health

# Backend
curl http://localhost:3002/api/listening/health

# PostgreSQL
docker compose exec postgres pg_isready

# Redis
docker compose exec redis redis-cli ping
```

### Container Status

```bash
make ps
make health-check
```

### Logs

```bash
# All services
make docker-logs

# Specific service
make docker-logs-frontend
make docker-logs-backend
```

---

## Rollback

### Docker Compose Rollback

```bash
# View previous versions
docker compose ps

# Rollback to previous version
docker compose down
docker compose up -d

# Or specific version
IMAGE_TAG=v1.2.3 docker compose up -d
```

### Kubernetes Rollback (if applicable)

```bash
# View rollout history
kubectl rollout history deployment/drivesmart-frontend

# Rollback to previous
kubectl rollout undo deployment/drivesmart-frontend

# Rollback to specific version
kubectl rollout undo deployment/drivesmart-frontend --to-revision=2
```

---

## Useful Commands

```bash
# Development
make dev              # Start dev server
make dev-all         # Start all services
make test            # Run tests
make check           # Lint + typecheck

# Docker
make docker-up       # Start services
make docker-down     # Stop services
make docker-logs     # View logs
make docker-restart  # Restart services
make docker-clean    # Clean up

# Deployment
make deploy-staging     # Deploy to staging
make deploy-production   # Deploy to production

# Database
make db-migrate      # Run migrations
make db-seed         # Seed data
make db-reset        # Reset database
make db-console      # Open psql console

# Maintenance
make backup          # Backup data
make security-scan   # Security scan
make update-deps     # Update dependencies
```

---

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>
```

#### Docker Build Fails
```bash
# Clean Docker cache
docker system prune -a
make docker-build
```

#### Tests Failing
```bash
# Run tests with verbose output
npm run test:run -- --reporter=verbose

# Run specific test
npm run test:run -- src/features/xxx.test.ts
```

#### Database Connection
```bash
# Check database health
docker compose ps postgres
docker compose logs postgres

# Reset database
make db-reset
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* docker compose up

# Or for specific service
docker compose logs -f backend
```
