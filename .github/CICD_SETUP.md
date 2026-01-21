# CI/CD Setup Guide - Tomoro Bridging

## Overview
This document provides complete setup instructions for the CI/CD pipeline that automatically builds, tests, and deploys the Tomoro Bridging application using GitHub Actions and Docker.

## Architecture

```
┌─────────────────┐
│  GitHub PR      │──▶ Quality Checks (TypeScript, Lint, Audit, Build)
└─────────────────┘

┌─────────────────┐
│  Push to main   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ Stage 1: Build & Push Docker Image                         │
│ - Build Docker image                                        │
│ - Push to ghcr.io/humplus-it/tomoro-bridging:sha-xxxxx    │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ Stage 2: Deploy Staging (Auto)                             │
│ - Pull image from ghcr.io                                  │
│ - Deploy to /var/www/tomoro-staging                        │
│ - URL: http://172.104.61.233:3001                          │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ Stage 3: Deploy Production (Manual Approval Required)      │
│ - Pull SAME image from ghcr.io                             │
│ - Deploy to /var/www/tomoro-production                     │
│ - URL: http://172.104.61.233:3000                          │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

### 1. GitHub Container Registry (ghcr.io) Setup

#### Create Personal Access Token
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Fill in:
   - **Note**: `GHCR Token for Tomoro-Bridging CI/CD`
   - **Expiration**: No expiration (or 1 year)
   - **Scopes**: 
     - ✅ `write:packages`
     - ✅ `read:packages` (auto-selected)
     - ✅ `delete:packages` (optional)
4. Click "Generate token"
5. **COPY THE TOKEN** (you won't see it again!)

### 2. GitHub Secrets Configuration

Go to your repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

#### Existing Secrets (from delta-app)
- ✅ `SSH_PRIVATE_KEY` - SSH private key for server access
- ✅ `SSH_HOST` - Server IP: `172.104.61.233`
- ✅ `SSH_USERNAME` - SSH username for deployment
- ✅ `SSH_PORT` - SSH port (default: `22`)

#### New Secrets (for tomoro-bridging)
| Secret Name | Value | Description |
|-------------|-------|-------------|
| `GHCR_TOKEN` | *your token from step 1* | GitHub Container Registry access token |
| `DEPLOY_PATH_TOMORO_STAGING` | `/var/www/tomoro-staging` | Staging deployment directory |
| `DEPLOY_PATH_TOMORO_PRODUCTION` | `/var/www/tomoro-production` | Production deployment directory |

### 3. Server Requirements

Your server (`172.104.61.233`) must have:
- ✅ Docker Engine (version 20.10+)
- ✅ Docker Compose (version 2.0+)
- ✅ SSH access configured
- ✅ Ports available:
  - `3000` - Production web app
  - `3001` - Staging web app
  - `5432` - Production PostgreSQL
  - `5433` - Staging PostgreSQL (optional, if running both)

#### Verify Server Setup
```bash
ssh user@172.104.61.233

# Check Docker
docker --version
docker compose version

# Check ports
sudo netstat -tulpn | grep -E ':(3000|3001|5432|5433)'

# Create deployment directories
sudo mkdir -p /var/www/tomoro-staging
sudo mkdir -p /var/www/tomoro-production
sudo mkdir -p /var/www/backups/tomoro-staging
sudo mkdir -p /var/www/backups/tomoro-production

# Set permissions (adjust user as needed)
sudo chown -R $USER:$USER /var/www/tomoro-*
sudo chown -R $USER:$USER /var/www/backups/tomoro-*
```

## Deployment Environments

### Staging
- **URL**: http://172.104.61.233:3001
- **Path**: `/var/www/tomoro-staging`
- **Deployment**: Automatic on push to `main`
- **Database**: `tomoro_staging` (PostgreSQL in Docker)
- **Container Names**:
  - `tomoro-staging-web`
  - `tomoro-staging-db`

### Production
- **URL**: http://172.104.61.233:3000
- **Path**: `/var/www/tomoro-production`
- **Deployment**: Manual approval required
- **Database**: `tomoro_production` (PostgreSQL in Docker)
- **Container Names**:
  - `tomoro-production-web`
  - `tomoro-production-db`

## Environment Variables

### Server-Side Configuration

Each environment needs a `.env.production` file on the server:

**Staging** (`/var/www/tomoro-staging/.env.production`):
```env
ACCURATE_API_TOKEN=dummy_token_testing_only
ACCURATE_SIGNATURE_SECRET=dummy_secret_testing_only
ACCURATE_HOST=https://account.accurate.id
ACCURATE_STRING_TO_SIGN={METHOD}:{PATH}:{TIMESTAMP}
ACCURATE_SIGNATURE_DIGEST=hex

DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=tomoro_staging
DB_USERNAME=postgres
DB_PASSWORD=staging_password_change_me
```

**Production** (`/var/www/tomoro-production/.env.production`):
```env
ACCURATE_API_TOKEN=production_token_here
ACCURATE_SIGNATURE_SECRET=production_secret_here
ACCURATE_HOST=https://account.accurate.id
ACCURATE_STRING_TO_SIGN={METHOD}:{PATH}:{TIMESTAMP}
ACCURATE_SIGNATURE_DIGEST=hex

DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=tomoro_production
DB_USERNAME=postgres
DB_PASSWORD=strong_production_password_here
```

> **Note**: The workflow will create default `.env.production` files if they don't exist, but you should update them with proper values.

## How to Use

### Triggering Deployments

#### Automatic Staging Deployment
1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit: `git commit -m "feat: add new feature"`
3. Push to GitHub: `git push origin feature/my-feature`
4. Create Pull Request to `main`
5. **PR Checks will run automatically** (TypeScript, Lint, Audit, Build)
6. After PR is merged to `main`:
   - Docker image is built and pushed to ghcr.io
   - Staging deployment happens automatically
   - Check http://172.104.61.233:3001

#### Manual Production Deployment
1. After staging is verified, go to GitHub Actions tab
2. Find the workflow run for your commit
3. Click on "Deploy to Production" stage
4. Click "Review deployments"
5. Select "production" environment
6. Click "Approve and deploy"
7. Production deployment will start
8. Check http://172.104.61.233:3000

### Manual Workflow Trigger
You can also trigger the pipeline manually:
1. Go to Actions tab
2. Select "Main Delivery Pipeline"
3. Click "Run workflow"
4. Select branch (usually `main`)
5. Click "Run workflow"

## Monitoring & Logs

### View Deployment Logs
```bash
# SSH to server
ssh user@172.104.61.233

# Staging logs
cd /var/www/tomoro-staging
docker compose logs -f web
docker compose logs -f db

# Production logs
cd /var/www/tomoro-production
docker compose logs -f web
docker compose logs -f db
```

### Check Container Status
```bash
# List all tomoro containers
docker ps -a | grep tomoro

# Check specific container
docker inspect tomoro-production-web
```

### Database Access
```bash
# Connect to staging database
docker exec -it tomoro-staging-db psql -U postgres -d tomoro_staging

# Connect to production database
docker exec -it tomoro-production-db psql -U postgres -d tomoro_production
```

## Rollback Procedures

### Rollback Production Deployment

#### Method 1: Redeploy Previous Image
```bash
ssh user@172.104.61.233
cd /var/www/tomoro-production

# Find previous image tag from GitHub Actions history
export IMAGE_TAG=sha-abc1234  # Replace with previous commit SHA

# Pull and deploy
docker compose pull
docker compose up -d
```

#### Method 2: Use Docker Backup (if available)
```bash
ssh user@172.104.61.233
cd /var/www/backups/tomoro-production

# List available backups
docker images | grep backup

# Tag backup as rollback
docker tag backup_20260121_140000 ghcr.io/humplus-it/tomoro-bridging:rollback

# Deploy rollback
cd /var/www/tomoro-production
export IMAGE_TAG=rollback
docker compose up -d
```

### Rollback Database (PostgreSQL)

Database backups are stored in Docker volumes. For critical data:

```bash
# Create manual backup before deployment
docker exec tomoro-production-db pg_dump -U postgres tomoro_production > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker exec -i tomoro-production-db psql -U postgres tomoro_production < backup_20260121_140000.sql
```

## Troubleshooting

### Issue: Docker image pull fails
**Symptom**: `Error response from daemon: pull access denied`

**Solution**:
```bash
# Re-login to ghcr.io on server
ssh user@172.104.61.233
echo $GHCR_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

### Issue: Port already in use
**Symptom**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution**:
```bash
# Find process using the port
sudo lsof -i :3000

# Stop conflicting container
docker stop <container_id>

# Or change port in docker-compose.yml
```

### Issue: Database connection refused
**Symptom**: Application logs show `ECONNREFUSED` to database

**Solution**:
```bash
# Check if db container is running
docker ps | grep tomoro-production-db

# Check db logs
docker logs tomoro-production-db

# Verify .env.production has DB_HOST=db (not localhost)
cat /var/www/tomoro-production/.env.production | grep DB_HOST
```

### Issue: Health check fails after deployment
**Symptom**: Deployment succeeds but health check returns 000 or 500

**Solution**:
```bash
# Check application logs
docker logs tomoro-production-web --tail=100

# Check if Next.js is running
docker exec tomoro-production-web ps aux | grep node

# Manually test the endpoint
curl -v http://172.104.61.233:3000
```

## Multi-App Deployment (Delta + Tomoro)

Both applications can run on the same server:

| App | Environment | Port | Path |
|-----|-------------|------|------|
| Delta | Staging | 8081 | `/var/www/delta-staging` |
| Delta | Production | 80 | `/var/www/delta-production` |
| Tomoro | Staging | 3001 | `/var/www/tomoro-staging` |
| Tomoro | Production | 3000 | `/var/www/tomoro-production` |

**No conflicts** as long as ports are different.

## Security Best Practices

1. ✅ **Never commit `.env` files** to Git
2. ✅ **Use GitHub Secrets** for sensitive data
3. ✅ **Rotate passwords** regularly (database, SSH keys)
4. ✅ **Use strong passwords** for production database
5. ✅ **Limit SSH access** (use SSH keys, disable password auth)
6. ✅ **Keep Docker images updated** (Dependabot handles this)
7. ✅ **Review Dependabot PRs** before merging

## Maintenance

### Update Dependencies
Dependabot will automatically create PRs every Monday at 09:00 for:
- NPM packages (grouped by framework)
- GitHub Actions

Review and merge these PRs to keep dependencies up-to-date.

### Clean Up Old Docker Images
```bash
ssh user@172.104.61.233

# Remove unused images (saves disk space)
docker image prune -a -f

# Remove old backup images (keeps last 10)
cd /var/www/backups/tomoro-production
docker images | grep backup | tail -n +11 | awk '{print $3}' | xargs -r docker rmi
```

### Monitor Disk Space
```bash
# Check disk usage
df -h

# Check Docker disk usage
docker system df

# Clean up if needed
docker system prune -a --volumes
```

## Support

For issues or questions:
1. Check GitHub Actions logs
2. Check server logs (`docker compose logs`)
3. Review this documentation
4. Check implementation plan and Docker registry guide in artifacts

---

**Last Updated**: 2026-01-21
**Version**: 1.0.0
