@echo off
echo 🧹 Cleaning up frontend build artifacts...

echo Stopping zamio_frontend container...
docker stop zamio_frontend >nul 2>&1
docker rm zamio_frontend >nul 2>&1

echo Cleaning local build artifacts...
if exist "zamio_frontend\dist" rmdir /s /q "zamio_frontend\dist"
if exist "zamio_frontend\build" rmdir /s /q "zamio_frontend\build"
if exist "zamio_frontend\.next" rmdir /s /q "zamio_frontend\.next"

if exist "zamio_admin\dist" rmdir /s /q "zamio_admin\dist"
if exist "zamio_admin\build" rmdir /s /q "zamio_admin\build"
if exist "zamio_admin\.next" rmdir /s /q "zamio_admin\.next"

if exist "zamio_stations\dist" rmdir /s /q "zamio_stations\dist"
if exist "zamio_stations\build" rmdir /s /q "zamio_stations\build"
if exist "zamio_stations\.next" rmdir /s /q "zamio_stations\.next"

if exist "zamio_publisher\dist" rmdir /s /q "zamio_publisher\dist"
if exist "zamio_publisher\build" rmdir /s /q "zamio_publisher\build"
if exist "zamio_publisher\.next" rmdir /s /q "zamio_publisher\.next"

echo Cleaning node_modules cache...
if exist "zamio_frontend\node_modules\.cache" rmdir /s /q "zamio_frontend\node_modules\.cache"
if exist "zamio_admin\node_modules\.cache" rmdir /s /q "zamio_admin\node_modules\.cache"
if exist "zamio_stations\node_modules\.cache" rmdir /s /q "zamio_stations\node_modules\.cache"
if exist "zamio_publisher\node_modules\.cache" rmdir /s /q "zamio_publisher\node_modules\.cache"

echo Cleaning Docker system...
docker system prune -f

echo 🚀 Rebuilding and restarting frontend services...
cd zamio_backend
docker-compose -f docker-compose.local.yml build zamio_frontend
docker-compose -f docker-compose.local.yml up -d zamio_frontend

echo ✅ Done! Frontend should be starting up...
echo 📱 Access the artist portal at: http://localhost:9002

echo 📋 Showing frontend logs (Ctrl+C to exit)...
docker-compose -f docker-compose.local.yml logs -f zamio_frontend