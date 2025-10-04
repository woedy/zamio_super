# Design Document

## Overview

The current Docker build failure occurs because each frontend service's build context is limited to its own directory (e.g., `../zamio_admin`), but the services depend on a shared package located at `../packages/ui-theme`. Docker cannot access files outside the build context, resulting in "invalid file request" errors when trying to copy `node_modules/@zamio/ui-theme`.

This design implements a solution using an expanded build context that includes both the frontend application and the shared packages directory. We'll update the Dockerfiles to use a multi-stage build approach and modify the docker-compose configuration to set the appropriate build context.

## Architecture

### Build Context Strategy

Instead of building from each frontend directory individually, we'll:

1. Set the build context to the repository root (one level up from zamio_backend)
2. Use Dockerfile paths relative to the root
3. Copy the shared packages directory into the Docker image during build
4. Maintain volume mounts for development hot-reloading

### Directory Structure

```
zamio/                          # Root (new build context)
├── packages/
│   └── ui-theme/              # Shared package
├── zamio_frontend/            # Artist portal
├── zamio_admin/               # Admin dashboard
├── zamio_publisher/           # Publisher portal
├── zamio_stations/            # Station portal
└── zamio_backend/
    └── docker-compose.local.yml
```

## Components and Interfaces

### 1. Updated Dockerfiles

Each frontend Dockerfile will be restructured to:

- Accept the root directory as build context
- Copy both the application code and shared packages
- Use multi-stage builds for optimization
- Support both development and production modes

**Dockerfile Structure:**

```dockerfile
# Stage 1: Base with dependencies
FROM node:16 AS base
WORKDIR /app

# Copy shared package first
COPY packages/ui-theme ./packages/ui-theme

# Copy application package files
COPY zamio_[app]/package*.json ./zamio_[app]/

# Install dependencies
WORKDIR /app/zamio_[app]
RUN npm install

# Stage 2: Development
FROM base AS development
WORKDIR /app/zamio_[app]
COPY zamio_[app] .
CMD ["npm", "run", "dev"]

# Stage 3: Production build
FROM base AS builder
WORKDIR /app/zamio_[app]
COPY zamio_[app] .
RUN npm run build

# Stage 4: Production serve
FROM node:16-alpine AS production
WORKDIR /app
COPY --from=builder /app/zamio_[app]/dist ./dist
COPY --from=builder /app/zamio_[app]/package*.json ./
RUN npm install --production
CMD ["npm", "run", "preview"]
```

### 2. Docker Compose Configuration

Update `docker-compose.local.yml` to:

- Change build context from `../zamio_[app]` to `..` (root)
- Specify the Dockerfile path relative to root
- Add target stage for development builds
- Maintain existing volume mounts and environment variables

**Key Changes:**

```yaml
zamio_frontend:
  build:
    context: ..                          # Root directory
    dockerfile: zamio_frontend/Dockerfile
    target: development                   # Use dev stage
  volumes:
    - ../zamio_frontend:/app/zamio_frontend
    - ../packages:/app/packages           # Mount shared packages
    - /app/zamio_frontend/node_modules    # Preserve node_modules
```

### 3. Shared Package Handling

The `@zamio/ui-theme` package will be:

- Copied into the Docker image during build (for dependency resolution)
- Mounted as a volume during development (for hot-reloading)
- Built if necessary before frontend builds

## Data Models

No data model changes required. This is purely an infrastructure change.

## Error Handling

### Build Failures

- **Missing shared package**: If `packages/ui-theme` doesn't exist, the build will fail with a clear error. Solution: Ensure the package exists before building.
- **Dependency conflicts**: If version mismatches occur, npm will report them during install. Solution: Align dependency versions across packages.
- **Context size**: Large build contexts can slow builds. Solution: Use `.dockerignore` to exclude unnecessary files.

### Runtime Errors

- **Module not found**: If volume mounts are incorrect, imports will fail. Solution: Verify volume mount paths in docker-compose.
- **Hot reload not working**: If shared package changes don't reflect. Solution: Ensure both app and packages directories are mounted.

## Testing Strategy

### Unit Testing

Not applicable - this is an infrastructure change.

### Integration Testing

1. **Build Test**: Verify all frontend services build successfully
   ```bash
   docker-compose -f docker-compose.local.yml build zamio_frontend zamio_admin zamio_publisher zamio_stations
   ```

2. **Start Test**: Verify all services start without errors
   ```bash
   docker-compose -f docker-compose.local.yml up -d
   docker-compose -f docker-compose.local.yml ps
   ```

3. **Import Test**: Verify shared package imports work
   - Access each frontend application
   - Check browser console for import errors
   - Verify UI components from @zamio/ui-theme render correctly

4. **Hot Reload Test**: Verify development workflow
   - Make a change to a component in packages/ui-theme
   - Verify the change reflects in all frontend applications
   - Make a change to an application file
   - Verify hot reload works

### Performance Testing

1. **Build Time**: Measure build time before and after changes
2. **Layer Caching**: Verify that unchanged layers are cached
3. **Startup Time**: Ensure container startup time is acceptable

### Validation Checklist

- [ ] All four frontend services build without errors
- [ ] All four frontend services start and are accessible
- [ ] Shared UI components render correctly in all applications
- [ ] Hot reload works for application code changes
- [ ] Hot reload works for shared package changes
- [ ] Build times are reasonable (< 5 minutes for clean build)
- [ ] Subsequent builds use cached layers effectively
- [ ] No regression in existing functionality

## Implementation Notes

### .dockerignore Files

Create `.dockerignore` in the root directory to exclude:
- `node_modules` directories (except when explicitly copied)
- `.git` directory
- Build artifacts
- Documentation files
- Test files

### Port Mappings

Maintain existing port mappings:
- zamio_frontend (artist): 9002:5173
- zamio_admin: 9007:4176
- zamio_publisher: 9006:4175
- zamio_stations: 9005:4174

### Environment Variables

No changes to environment variables required. All existing variables will be preserved.

### Backward Compatibility

This change modifies the build process but maintains:
- Same runtime behavior
- Same API endpoints
- Same development workflow
- Same environment configuration

## Alternative Approaches Considered

### 1. Copy Shared Package During Build (Rejected)

Copy the built shared package into each frontend's node_modules before building.

**Pros**: Simpler Dockerfile
**Cons**: Requires building shared package separately, doesn't support hot reload

### 2. Publish Shared Package to Registry (Rejected)

Publish @zamio/ui-theme to npm or a private registry.

**Pros**: Standard approach, works with existing Dockerfiles
**Cons**: Adds complexity, requires registry setup, slows development workflow

### 3. Monorepo Build Tool (Rejected)

Use tools like Turborepo or Nx to manage builds.

**Pros**: Optimized for monorepos, handles dependencies automatically
**Cons**: Significant refactoring required, learning curve, overkill for current needs

### 4. Expanded Build Context (Selected)

Use root directory as build context with multi-stage builds.

**Pros**: Minimal changes, supports hot reload, standard Docker practices
**Cons**: Slightly larger build context (mitigated by .dockerignore)

## Security Considerations

- Ensure `.dockerignore` excludes sensitive files (.env, secrets)
- Verify that only necessary files are copied into images
- Maintain principle of least privilege for container users
- No new security vulnerabilities introduced

## Deployment Impact

### Local Development

- Developers will need to rebuild containers after pulling changes
- Command remains the same: `docker-compose -f docker-compose.local.yml up -d --build`

### Production Deployment

- If using the same Dockerfiles for production, update CI/CD pipelines to use root context
- Coolify deployments may need build context adjustments
- Consider using production target stage for optimized builds

## Migration Path

1. Update all frontend Dockerfiles with new multi-stage structure
2. Update docker-compose.local.yml with new build contexts
3. Create root-level .dockerignore file
4. Test builds locally
5. Update documentation
6. Communicate changes to team
7. Update CI/CD pipelines if applicable
