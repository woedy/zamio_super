#!/bin/bash

echo "🧹 Cleaning up frontend build artifacts..."

# Stop the frontend container
echo "Stopping zamio_frontend container..."
docker stop zamio_frontend 2>/dev/null || true
docker rm zamio_frontend 2>/dev/null || true

# Clean up local build artifacts in all frontend apps
echo "Cleaning local build artifacts..."
rm -rf zamio_frontend/dist zamio_frontend/build zamio_frontend/.next
rm -rf zamio_admin/dist zamio_admin/build zamio_admin/.next  
rm -rf zamio_stations/dist zamio_stations/build zamio_stations/.next
rm -rf zamio_publisher/dist zamio_publisher/build zamio_publisher/.next

# Clean up node_modules cache
echo "Cleaning node_modules cache..."
rm -rf zamio_frontend/node_modules/.cache
rm -rf zamio_admin/node_modules/.cache
rm -rf zamio_stations/node_modules/.cache
rm -rf zamio_publisher/node_modules/.cache

# Clean Docker system
echo "Cleaning Docker system..."
docker system prune -f

echo "🚀 Restarting frontend services..."
cd zamio_backend
docker-compose -f docker-compose.local.yml up -d zamio_frontend

echo "✅ Done! Frontend should be starting up..."
echo "📱 Access the artist portal at: http://localhost:9002"

# Show logs
echo "📋 Showing frontend logs (Ctrl+C to exit)..."
docker-compose -f docker-compose.local.yml logs -f zamio_frontend