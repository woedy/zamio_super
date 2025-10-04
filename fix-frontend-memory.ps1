# PowerShell script to fix frontend memory issues

Write-Host "🧹 Cleaning up frontend build artifacts..." -ForegroundColor Yellow

# Stop the frontend container
Write-Host "Stopping zamio_frontend container..." -ForegroundColor Blue
docker stop zamio_frontend 2>$null
docker rm zamio_frontend 2>$null

# Clean up local build artifacts in all frontend apps
Write-Host "Cleaning local build artifacts..." -ForegroundColor Blue
if (Test-Path "zamio_frontend/dist") { Remove-Item -Recurse -Force "zamio_frontend/dist" }
if (Test-Path "zamio_frontend/build") { Remove-Item -Recurse -Force "zamio_frontend/build" }
if (Test-Path "zamio_frontend/.next") { Remove-Item -Recurse -Force "zamio_frontend/.next" }

if (Test-Path "zamio_admin/dist") { Remove-Item -Recurse -Force "zamio_admin/dist" }
if (Test-Path "zamio_admin/build") { Remove-Item -Recurse -Force "zamio_admin/build" }
if (Test-Path "zamio_admin/.next") { Remove-Item -Recurse -Force "zamio_admin/.next" }

if (Test-Path "zamio_stations/dist") { Remove-Item -Recurse -Force "zamio_stations/dist" }
if (Test-Path "zamio_stations/build") { Remove-Item -Recurse -Force "zamio_stations/build" }
if (Test-Path "zamio_stations/.next") { Remove-Item -Recurse -Force "zamio_stations/.next" }

if (Test-Path "zamio_publisher/dist") { Remove-Item -Recurse -Force "zamio_publisher/dist" }
if (Test-Path "zamio_publisher/build") { Remove-Item -Recurse -Force "zamio_publisher/build" }
if (Test-Path "zamio_publisher/.next") { Remove-Item -Recurse -Force "zamio_publisher/.next" }

# Clean up node_modules cache
Write-Host "Cleaning node_modules cache..." -ForegroundColor Blue
if (Test-Path "zamio_frontend/node_modules/.cache") { Remove-Item -Recurse -Force "zamio_frontend/node_modules/.cache" }
if (Test-Path "zamio_admin/node_modules/.cache") { Remove-Item -Recurse -Force "zamio_admin/node_modules/.cache" }
if (Test-Path "zamio_stations/node_modules/.cache") { Remove-Item -Recurse -Force "zamio_stations/node_modules/.cache" }
if (Test-Path "zamio_publisher/node_modules/.cache") { Remove-Item -Recurse -Force "zamio_publisher/node_modules/.cache" }

# Clean Docker system
Write-Host "Cleaning Docker system..." -ForegroundColor Blue
docker system prune -f

Write-Host "🚀 Rebuilding and restarting frontend services..." -ForegroundColor Green
Set-Location zamio_backend
docker-compose -f docker-compose.local.yml build zamio_frontend
docker-compose -f docker-compose.local.yml up -d zamio_frontend

Write-Host "✅ Done! Frontend should be starting up..." -ForegroundColor Green
Write-Host "📱 Access the artist portal at: http://localhost:9002" -ForegroundColor Cyan

# Show logs
Write-Host "📋 Showing frontend logs (Ctrl+C to exit)..." -ForegroundColor Yellow
docker-compose -f docker-compose.local.yml logs -f zamio_frontend