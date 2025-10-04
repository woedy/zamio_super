# Requirements Document

## Introduction

The ZamIO platform consists of multiple frontend applications (zamio_frontend for artists, zamio_admin, zamio_publisher, zamio_stations) that share a common UI theme package located at `packages/ui-theme`. Currently, Docker builds fail with "invalid file request node_modules/@zamio/ui-theme" because the build context for each frontend service doesn't include the shared package directory. This feature will restructure the Docker build configuration to properly handle the monorepo structure and enable successful builds of all frontend services with their shared dependencies.

## Requirements

### Requirement 1: Docker Build Context Configuration

**User Story:** As a developer, I want Docker builds to succeed for all frontend applications, so that I can run the entire platform locally using Docker Compose.

#### Acceptance Criteria

1. WHEN building any frontend service (zamio_frontend, zamio_admin, zamio_publisher, zamio_stations) THEN the build SHALL complete successfully without "invalid file request" errors
2. WHEN the shared ui-theme package is referenced THEN Docker SHALL have access to the package files during the build process
3. WHEN running `docker-compose -f docker-compose.local.yml up -d` THEN all frontend services SHALL build and start successfully

### Requirement 2: Shared Package Accessibility

**User Story:** As a developer, I want the shared @zamio/ui-theme package to be accessible to all frontend applications during Docker builds, so that the applications can use common UI components.

#### Acceptance Criteria

1. WHEN Docker builds a frontend service THEN the build context SHALL include the packages/ui-theme directory
2. WHEN npm install runs in the container THEN the @zamio/ui-theme package SHALL be resolved correctly from the local file path
3. WHEN the application starts THEN it SHALL be able to import and use components from @zamio/ui-theme without errors

### Requirement 3: Development Workflow Preservation

**User Story:** As a developer, I want the Docker build fix to maintain the existing development workflow, so that I don't need to change how I work with the codebase.

#### Acceptance Criteria

1. WHEN making changes to the shared ui-theme package THEN the changes SHALL be reflected in all frontend applications through volume mounts
2. WHEN running in development mode THEN hot module replacement SHALL continue to work for all frontend services
3. WHEN the docker-compose configuration is updated THEN existing environment variables and port mappings SHALL remain unchanged

### Requirement 4: Build Performance Optimization

**User Story:** As a developer, I want Docker builds to complete in a reasonable time, so that I can iterate quickly during development.

#### Acceptance Criteria

1. WHEN building frontend services THEN Docker SHALL leverage layer caching for node_modules
2. WHEN only application code changes THEN Docker SHALL NOT reinstall all dependencies
3. WHEN the shared package hasn't changed THEN Docker SHALL reuse cached layers for that package

### Requirement 5: Multi-Stage Build Support

**User Story:** As a DevOps engineer, I want the Dockerfiles to support both development and production builds, so that the same configuration can be used across environments.

#### Acceptance Criteria

1. WHEN building for development THEN the Dockerfile SHALL use development dependencies and enable hot reload
2. WHEN building for production THEN the Dockerfile SHALL create optimized production builds
3. WHEN switching between environments THEN the appropriate build stage SHALL be selected based on configuration
