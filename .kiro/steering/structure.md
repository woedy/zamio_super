# ZamIO Project Structure

## Repository Organization

The ZamIO platform is organized as a multi-application monorepo with separate directories for each component:

```
zamio/
├── zamio_backend/          # Django API backend
├── zamio_frontend/         # Artist web portal (React)
├── zamio_admin/           # Admin dashboard (React)
├── zamio_publisher/       # Publisher portal (React)
├── zamio_stations/        # Station portal (React)
├── zamio_app/             # Mobile app (Flutter)
└── docs/                  # Project documentation
```

## Backend Structure (zamio_backend/)

Django apps organized by domain:

```
zamio_backend/
├── core/                  # Django settings and configuration
├── accounts/              # User authentication and accounts
├── artists/               # Artist profiles and management
├── stations/              # Radio station management
├── music_monitor/         # Audio fingerprinting and detection
├── publishers/            # Publisher and publishing agreements
├── royalties/             # Royalty calculations and cycles (new)
├── notifications/         # User notifications system
├── fan/                   # Fan engagement features
├── activities/            # User activity tracking
├── bank_account/          # Banking and payment integration
├── mr_admin/              # Admin-specific functionality
├── streamer/              # Streaming features
├── templates/             # Django HTML templates
├── media/                 # User-uploaded files
├── static_cdn/            # Static assets
└── manage.py              # Django management script
```

## Frontend Structure

All React applications follow consistent structure:

```
src/
├── components/            # Reusable UI components
├── pages/                 # Route-level page components
├── services/              # API service functions
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions
├── contexts/              # React context providers
├── assets/                # Static assets (images, icons)
└── styles/                # Global styles and Tailwind config
```

## Mobile App Structure (zamio_app/)

```
lib/
├── main.dart              # App entry point
├── models/                # Data models
├── services/              # API and device services
├── screens/               # UI screens
├── widgets/               # Reusable widgets
└── utils/                 # Utility functions
```

## Configuration Files

### Backend
- `requirements.txt` - Python dependencies
- `docker-compose.local.yml` - Local development setup
- `.env.local` - Environment variables
- `Dockerfile` - Container configuration

### Frontend Applications
- `package.json` - Node.js dependencies and scripts
- `vite.config.js` - Vite build configuration
- `tailwind.config.cjs` - Tailwind CSS configuration
- `.env.local` - Environment variables (VITE_API_URL)

### Mobile
- `pubspec.yaml` - Flutter dependencies
- `analysis_options.yaml` - Dart analysis configuration

## Development Workflow

1. **Backend First**: Start with Django backend development
2. **API Design**: Define REST endpoints before frontend work
3. **Component Isolation**: Build reusable components in each frontend
4. **Mobile Integration**: Connect Flutter app to established APIs
5. **Cross-App Testing**: Use QA user journeys for end-to-end validation

## File Naming Conventions

- **Backend**: snake_case for Python files and Django conventions
- **Frontend**: camelCase for JavaScript/TypeScript, kebab-case for component files
- **Mobile**: snake_case for Dart files following Flutter conventions
- **Documentation**: kebab-case for markdown files

## Key Integration Points

- All frontends connect to single Django backend via `/api/` endpoints
- Shared authentication via JWT tokens
- Consistent error handling and loading states across applications
- Docker Compose orchestrates all services for local development