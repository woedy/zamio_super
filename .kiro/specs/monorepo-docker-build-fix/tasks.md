# Implementation Plan

- [x] 1. Create root-level .dockerignore file

  - Create `.dockerignore` in the repository root directory
  - Add exclusions for node_modules, .git, build artifacts, and documentation
  - Ensure sensitive files like .env are excluded
  - _Requirements: 1.1, 4.2_

- [x] 2. Update zamio_frontend Dockerfile with multi-stage build

  - Rewrite `zamio_frontend/Dockerfile` to use root context
  - Implement multi-stage build with base, development, builder, and production stages
  - Copy packages/ui-theme directory in base stage

  - Set correct working directories for each stage
  - _Requirements: 1.1, 2.1, 2.2, 5.1, 5.2_

- [x] 3. Update zamio_admin Dockerfile with multi-stage build

  - Rewrite `zamio_admin/Dockerfile` to use root context
  - Implement multi-stage build structure matching zamio_frontend
  - Copy packages/ui-theme directory in base stage
  - Ensure proper working directory paths
  - _Requirements: 1.1, 2.1, 2.2, 5.1, 5.2_

- [x] 4. Update zamio_publisher Dockerfile with multi-stage build

  - Rewrite `zamio_publisher/Dockerfile` to use root context
  - Implement multi-stage build structure matching zamio_frontend
  - Copy packages/ui-theme directory in base stage
  - Configure correct working directories
  - _Requirements: 1.1, 2.1, 2.2, 5.1, 5.2_

- [x] 5. Update zamio_stations Dockerfile with multi-stage build

  - Rewrite `zamio_stations/Dockerfile` to use root context
  - Implement multi-stage build structure matching zamio_frontend
  - Copy packages/ui-theme directory in base stage
  - Set appropriate working directory paths
  - _Requirements: 1.1, 2.1, 2.2, 5.1, 5.2_

- [x] 6. Update docker-compose.local.yml for zamio_frontend service

  - Change build context from `../zamio_frontend` to `..` (root)
  - Update dockerfile path to `zamio_frontend/Dockerfile`
  - Add `target: development` to use development stage
  - Update volume mounts to include packages directory
  - Adjust volume paths to work with new context
  - _Requirements: 1.1, 1.3, 2.1, 3.1, 3.2_

- [x] 7. Update docker-compose.local.yml for zamio_admin service

  - Change build context from `../zamio_admin` to `..` (root)
  - Update dockerfile path to `zamio_admin/Dockerfile`
  - Add `target: development` to use development stage
  - Update volume mounts to include packages directory
  - Adjust volume paths for new context
  - _Requirements: 1.1, 1.3, 2.1, 3.1, 3.2_

- [x] 8. Update docker-compose.local.yml for zamio_publisher service

  - Change build context from `../zamio_publisher` to `..` (root)
  - Update dockerfile path to `zamio_publisher/Dockerfile`
  - Add `target: development` to use development stage
  - Update volume mounts to include packages directory
  - Adjust volume paths for new context
  - _Requirements: 1.1, 1.3, 2.1, 3.1, 3.2_

- [x] 9. Update docker-compose.local.yml for zamio_stations service

  - Change build context from `../zamio_stations` to `..` (root)
  - Update dockerfile path to `zamio_stations/Dockerfile`
  - Add `target: development` to use development stage
  - Update volume mounts to include packages directory
  - Adjust volume paths for new context
  - _Requirements: 1.1, 1.3, 2.1, 3.1, 3.2_

- [x] 10. Test build process for all frontend services

  - Run `docker-compose -f docker-compose.local.yml build zamio_frontend zamio_admin zamio_publisher zamio_stations`
  - Verify all builds complete without "invalid file request" errors
  - Check build logs for any warnings or issues
  - Verify layer caching is working for subsequent builds
  - _Requirements: 1.1, 1.3, 4.1, 4.2_

- [x] 11. Test service startup and accessibility

  - Run `docker-compose -f docker-compose.local.yml up -d`
  - Verify all frontend services start successfully
  - Check service status with `docker-compose ps`
  - Access each frontend application in browser (ports 9002, 9005, 9006, 9007)
  - Verify no console errors related to missing modules
  - _Requirements: 1.3, 2.3, 3.3_

- [x] 12. Test shared package imports and rendering

  - Access zamio_frontend and verify UI components from @zamio/ui-theme render
  - Access zamio_admin and verify shared components work
  - Access zamio_publisher and verify shared components work
  - Access zamio_stations and verify shared components work
  - Check browser console for any import errors
  - _Requirements: 2.2, 2.3_

- [ ] 13. Test hot reload functionality

  - Make a change to a file in zamio_frontend/src
  - Verify the change reflects immediately without rebuild
  - Make a change to a component in packages/ui-theme
  - Verify the change reflects in all frontend applications
  - Test hot reload for each frontend service
  - _Requirements: 3.1, 3.2_

-

- [x] 14. Update LOCAL_DEVELOPMENT.md documentation



  - Update `zamio_backend/_DeploySteps/LOCAL_DEVELOPMENT.md` with any new instructions
  - Document the new build context approach
  - Add troubleshooting section for common issues
  - Include notes about the .dockerignore file
  - _Requirements: 1.3, 3.3_

- [x] 15. Create migration guide for team

  - Document steps for developers to update their local environments
  - Include commands to clean old containers and images
  - Provide troubleshooting tips for common migration issues
  - Add notes about build time expectations
  - _Requirements: 1.3, 3.3_
