#!/bin/bash

# Clean up Docker containers and images
echo "Stopping and removing containers..."
docker-compose -f ../zamio_backend/docker-compose.local.yml down

echo "Removing dangling images and volumes..."
docker system prune -f
docker volume prune -f

echo "Cleaning local build artifacts..."
rm -rf dist build .next node_modules/.cache

echo "Restarting services..."
docker-compose -f ../zamio_backend/docker-compose.local.yml up -d

echo "Done! Services should be starting up..."