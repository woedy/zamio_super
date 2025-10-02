# ZamIO Technology Stack

## Backend (Django)
- **Framework**: Django 5.1+ with Django REST Framework
- **Database**: PostgreSQL (primary), Redis (caching/sessions)
- **Authentication**: DRF Token Auth with JWT migration planned
- **Background Tasks**: Celery with Redis broker, Celery Beat for scheduling
- **Audio Processing**: librosa, ffmpeg-python for stream capture and fingerprinting
- **Fingerprinting**: xxhash64 stored as BigInt, librosa for audio analysis
- **ASGI**: Daphne for WebSocket support via Django Channels

## Frontend Applications
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 4.4+
- **Styling**: TailwindCSS 3.2+ with custom presets
- **UI Components**: Chakra UI, Headless UI, Lucide React icons
- **Charts**: ApexCharts, Chart.js, Recharts
- **HTTP Client**: Axios
- **Routing**: React Router DOM 6+
- **State Management**: React hooks, React Hot Toast for notifications

## Mobile App
- **Framework**: Flutter 3.4+
- **Language**: Dart
- **Key Packages**: flutter_sound, firebase_messaging, sqflite, connectivity_plus

## Development Tools
- **Code Quality**: Prettier, ESLint, flutter_lints
- **Testing**: Vitest, Playwright (E2E), pytest (backend), Jest-axe (accessibility)
- **Containerization**: Docker with Docker Compose for local development

## Common Commands

### Backend (Django)
```bash
# Local development with Docker Compose
docker-compose -f docker-compose.local.yml up -d
docker-compose -f docker-compose.local.yml exec zamio_app python manage.py migrate
docker-compose -f docker-compose.local.yml exec -it zamio_app python manage.py createsuperuser

# Direct Django commands (if running locally)
python manage.py runserver
python manage.py migrate
python manage.py collectstatic
python manage.py shell
```

### Frontend Applications
```bash
# Development
npm install
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build

# Testing (zamio_frontend only)
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests with Playwright
npm run test:coverage # Run tests with coverage
```

### Mobile App (Flutter)
```bash
flutter pub get      # Install dependencies
flutter run          # Run on connected device/emulator
flutter build apk    # Build Android APK
flutter build ios    # Build iOS app
flutter test         # Run tests
```

## Environment Configuration
- Backend uses `.env.local` for local development
- Frontend apps use `VITE_API_URL` environment variable
- Docker Compose handles service orchestration with predefined ports:
  - Django API: 9001
  - Frontend apps: 9002, 9005
  - PostgreSQL: 9003
  - Redis: 9004

## Architecture Notes
- Microservices approach with separate frontend applications for different user types
- Shared UI theme package in `packages/ui-theme`
- Containerized deployment with Coolify support
- Audio processing pipeline uses librosa for fingerprinting and ffmpeg for stream capture