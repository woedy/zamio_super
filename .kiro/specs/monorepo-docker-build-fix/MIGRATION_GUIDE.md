# Docker Build Context Migration Guide

## Overview

This guide will help you migrate your local development environment to the new Docker build configuration that properly handles the monorepo structure with shared packages.

**What Changed**: We've updated the Docker build context from individual frontend directories to the repository root, enabling proper access to the shared `packages/ui-theme` package during builds.

**Why**: The previous configuration caused "invalid file request" errors because Docker couldn't access files outside each service's build context.

## Migration Steps

### Step 1: Pull Latest Changes

```bash
git pull origin main
```

### Step 2: Clean Old Docker Resources

Before rebuilding, clean up old containers, images, and volumes to avoid conflicts:

```bash
# Stop all running containers
docker-compose -f zamio_backend/docker-compose.local.yml down

# Remove old containers and volumes
docker-compose -f zamio_backend/docker-compose.local.yml down -v

# Remove old images (optional but recommended)
docker rmi zamio_backend-zamio_frontend
docker rmi zamio_backend-zamio_admin
docker rmi zamio_backend-zamio_publisher
docker rmi zamio_backend-zamio_stations

# Alternative: Remove all unused images (more aggressive)
docker image prune -a
```

### Step 3: Rebuild Services

Navigate to the backend directory and rebuild all frontend services:

```bash
cd zamio_backend

# Build all frontend services with the new configuration
docker-compose -f docker-compose.local.yml build zamio_frontend zamio_admin zamio_publisher zamio_stations
```

**Expected Build Time**: 
- First build: 5-10 minutes (depending on network speed)
- Subsequent builds: 1-3 minutes (with layer caching)

### Step 4: Start Services

```bash
# Start all services
docker-compose -f docker-compose.local.yml up -d

# Check service status
docker-compose -f docker-compose.local.yml ps
```

### Step 5: Verify Services

Check that all frontend services are accessible:

- **Artist Portal** (zamio_frontend): http://localhost:9002
- **Admin Dashboard** (zamio_admin): http://localhost:9007
- **Publisher Portal** (zamio_publisher): http://localhost:9006
- **Station Portal** (zamio_stations): http://localhost:9005

Open your browser console and verify there are no import errors related to `@zamio/ui-theme`.

## Troubleshooting

### Issue: Build fails with "COPY failed" error

**Symptom**: Error message like `COPY failed: file not found in build context`

**Solution**: 
1. Ensure you're running the build command from the `zamio_backend` directory
2. Verify the `packages/ui-theme` directory exists in the repository root
3. Check that the `.dockerignore` file in the root doesn't exclude necessary files

```bash
# Verify directory structure
ls -la ../packages/ui-theme
```

### Issue: Services fail to start with "port already in use"

**Symptom**: Error message about ports 9002, 9005, 9006, or 9007 being in use

**Solution**:
1. Stop any processes using those ports
2. Or stop old containers that might still be running

```bash
# Find processes using the ports
netstat -ano | findstr :9002
netstat -ano | findstr :9005
netstat -ano | findstr :9006
netstat -ano | findstr :9007

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or stop all Docker containers
docker stop $(docker ps -aq)
```

### Issue: Module not found errors in browser console

**Symptom**: Browser console shows errors like `Cannot find module '@zamio/ui-theme'`

**Solution**:
1. Verify volume mounts are correct in docker-compose.local.yml
2. Rebuild the containers
3. Clear browser cache

```bash
# Rebuild specific service
docker-compose -f docker-compose.local.yml up -d --build zamio_frontend

# Check container logs for errors
docker-compose -f docker-compose.local.yml logs zamio_frontend
```

### Issue: Hot reload not working

**Symptom**: Changes to code don't reflect in the browser

**Solution**:
1. Verify volume mounts include both the app directory and packages directory
2. Check that node_modules is preserved as an anonymous volume
3. Restart the service

```bash
# Restart specific service
docker-compose -f docker-compose.local.yml restart zamio_frontend

# Check volume mounts
docker inspect zamio_backend-zamio_frontend-1 | findstr Mounts -A 20
```

### Issue: Build is very slow

**Symptom**: Build takes longer than 10 minutes

**Solution**:
1. Ensure `.dockerignore` file exists in the repository root
2. Check your internet connection (npm install downloads packages)
3. Verify Docker has sufficient resources allocated

```bash
# Check Docker resource usage
docker stats

# Increase Docker resources in Docker Desktop settings:
# Settings > Resources > Advanced
# Recommended: 4GB RAM, 2 CPUs minimum
```

### Issue: "Cannot connect to Docker daemon"

**Symptom**: Docker commands fail with daemon connection error

**Solution**:
1. Ensure Docker Desktop is running
2. Restart Docker Desktop
3. Check Docker service status

```bash
# On Windows, restart Docker Desktop from the system tray
# Or restart the Docker service
net stop com.docker.service
net start com.docker.service
```

## Common Commands Reference

### Building Services

```bash
# Build all frontend services
docker-compose -f docker-compose.local.yml build zamio_frontend zamio_admin zamio_publisher zamio_stations

# Build specific service
docker-compose -f docker-compose.local.yml build zamio_frontend

# Build without cache (clean build)
docker-compose -f docker-compose.local.yml build --no-cache zamio_frontend
```

### Managing Services

```bash
# Start all services
docker-compose -f docker-compose.local.yml up -d

# Start specific service
docker-compose -f docker-compose.local.yml up -d zamio_frontend

# Stop all services
docker-compose -f docker-compose.local.yml down

# Restart specific service
docker-compose -f docker-compose.local.yml restart zamio_frontend

# View logs
docker-compose -f docker-compose.local.yml logs -f zamio_frontend
```

### Cleaning Up

```bash
# Remove stopped containers
docker-compose -f docker-compose.local.yml rm

# Remove containers and volumes
docker-compose -f docker-compose.local.yml down -v

# Remove all unused Docker resources
docker system prune -a --volumes
```

## What to Expect

### Build Times

- **First build after migration**: 5-10 minutes
  - Downloads Node.js base image
  - Installs all npm dependencies
  - Copies application code

- **Subsequent builds** (with code changes): 1-3 minutes
  - Reuses cached layers for dependencies
  - Only rebuilds changed layers

- **Builds with dependency changes**: 3-5 minutes
  - Reinstalls dependencies
  - Rebuilds affected layers

### Development Workflow

The development workflow remains unchanged:

1. Make changes to your code
2. Changes are reflected immediately via hot reload (no rebuild needed)
3. Changes to `packages/ui-theme` are reflected in all frontend apps
4. Only rebuild when Dockerfile or dependencies change

### Disk Space

The new build configuration uses slightly more disk space due to:
- Larger build context (includes packages directory)
- Multi-stage builds (intermediate layers)

**Estimated disk usage per service**: 500MB - 1GB

To reclaim disk space periodically:
```bash
docker system prune -a --volumes
```

## Key Changes Summary

### Dockerfile Changes
- Build context changed from service directory to repository root
- Multi-stage builds added (base, development, builder, production)
- Shared packages copied during build
- Working directory paths updated

### Docker Compose Changes
- Build context: `context: ..` (repository root)
- Dockerfile path: `dockerfile: zamio_[app]/Dockerfile`
- Build target: `target: development`
- Volume mounts: Added `../packages:/app/packages`

### New Files
- `.dockerignore` in repository root (excludes unnecessary files from build context)

## Need Help?

If you encounter issues not covered in this guide:

1. Check the container logs:
   ```bash
   docker-compose -f docker-compose.local.yml logs zamio_frontend
   ```

2. Verify the build context and Dockerfile:
   ```bash
   docker-compose -f docker-compose.local.yml config
   ```

3. Try a clean rebuild:
   ```bash
   docker-compose -f docker-compose.local.yml down -v
   docker-compose -f docker-compose.local.yml build --no-cache
   docker-compose -f docker-compose.local.yml up -d
   ```

4. Contact the DevOps team or check the project documentation in `zamio_backend/_DeploySteps/LOCAL_DEVELOPMENT.md`

## Rollback Instructions

If you need to rollback to the previous configuration:

```bash
# Stop services
docker-compose -f docker-compose.local.yml down -v

# Checkout previous commit
git checkout <previous-commit-hash>

# Rebuild with old configuration
docker-compose -f docker-compose.local.yml build
docker-compose -f docker-compose.local.yml up -d
```

Note: Rollback is not recommended as it will reintroduce the build errors with shared packages.
