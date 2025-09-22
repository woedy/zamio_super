# ZamIO Technology Stack

## Backend (zamio_backend)
- **Framework**: Django 5.1+ with Django REST Framework
- **Database**: PostgreSQL 15
- **Cache/Queue**: Redis + Celery for background tasks
- **Audio Processing**: librosa, ffmpeg-python for fingerprinting
- **Authentication**: JWT tokens via djangorestframework-simplejwt
- **Server**: Daphne (ASGI) with Channels for WebSocket support

## Frontend Applications
All frontends use the same modern React stack:
- **Framework**: React 18 + Vite 4
- **Styling**: TailwindCSS + Chakra UI components
- **Charts**: ApexCharts, Chart.js, Recharts
- **Maps**: Leaflet + React Leaflet
- **HTTP**: Axios for API calls
- **Routing**: React Router DOM v6

### Applications
- **zamio_frontend**: Artist portal (port 9002/4173)
- **zamio_admin**: Admin dashboard (port 9007/4176)  
- **zamio_publisher**: Publisher portal (port 9006/4175)
- **zamio_stations**: Station portal (port 9005/4174)

## Mobile App (zamio_app)
- **Framework**: Flutter 3.4+
- **Audio**: flutter_sound for recording
- **Background**: flutter_foreground_task for continuous capture
- **Storage**: shared_preferences, path_provider
- **HTTP**: Standard Dart http package

## Development Environment
- **Containerization**: Docker + Docker Compose
- **Local Ports**: Backend (9001), Frontend apps (9002, 9005-9007), DB (9003), Redis (9004)
- **Environment**: `.env.local` files for configuration

## Common Commands

### Backend Development
```bash
# Start all services (Windows)
start-local.bat

# Start services (cross-platform)
docker-compose -f docker-compose.local.yml up -d

# Django commands
docker-compose -f docker-compose.local.yml exec zamio_app python manage.py migrate
docker-compose -f docker-compose.local.yml exec zamio_app python manage.py createsuperuser
docker-compose -f docker-compose.local.yml exec zamio_app python manage.py collectstatic --noinput

# Stop services
stop-local.bat  # Windows
docker-compose -f docker-compose.local.yml down
```

### Frontend Development
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

### Mobile Development
```bash
# Install dependencies
flutter pub get

# Run app
flutter run

# Build
flutter build apk  # Android
flutter build ios  # iOS
```

## API Conventions
- RESTful endpoints under `/api/`
- JWT authentication via Authorization header
- camelCase in frontend, snake_case in backend (convert in services)
- Standardized error responses and loading states