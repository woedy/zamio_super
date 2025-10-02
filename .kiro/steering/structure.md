# ZamIO Project Structure

## Root Directory Organization

```
zamio/
├── zamio_backend/          # Django REST API backend
├── zamio_frontend/         # Artist portal (React/Vite)
├── zamio_admin/           # Admin dashboard (React/Vite)
├── zamio_publisher/       # Publisher portal (React/Vite)
├── zamio_stations/        # Station portal (React/Vite)
├── zamio_app/             # Mobile app (Flutter)
├── packages/              # Shared packages
│   └── ui-theme/          # Shared UI theme components
├── deploy/                # Deployment configurations
├── _TestingGuide/         # Comprehensive testing documentation
└── .SuperTest/            # Super test scenarios
```

## Backend Structure (zamio_backend/)

### Django Apps
- `accounts/` - User authentication and account management
- `artists/` - Artist profiles, tracks, and fingerprinting utilities
- `stations/` - Radio station management and stream monitoring
- `music_monitor/` - Audio matching engine and detection logic
- `publishers/` - Music publisher management
- `royalties/` - Royalty calculation and distribution
- `bank_account/` - Internal wallet and transaction ledger
- `notifications/` - Email/SMS notification system
- `disputes/` - Dispute management workflow
- `activities/` - User activity tracking
- `fan/` - Fan engagement features
- `analytics/` - Data aggregation and reporting
- `mr_admin/` - Administrative tools
- `streamer/` - Streaming functionality

### Key Backend Files
- `core/` - Django settings and configuration
- `manage.py` - Django management commands
- `requirements.txt` - Python dependencies
- `docker-compose.local.yml` - Local development setup
- `Dockerfile` / `Dockerfile.coolify` - Container configurations
- `entrypoint.sh` - Container startup script

## Frontend Applications Structure

Each frontend app follows a similar React/Vite structure:

```
zamio_[app]/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Route-based page components
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── services/         # API service layers
│   ├── types/            # TypeScript type definitions
│   └── App.tsx           # Main application component
├── public/               # Static assets
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
├── tailwind.config.cjs   # TailwindCSS configuration
├── tsconfig.json         # TypeScript configuration
└── Dockerfile            # Container configuration
```

## Mobile App Structure (zamio_app/)

```
zamio_app/
├── lib/                  # Dart source code
├── android/              # Android-specific configuration
├── ios/                  # iOS-specific configuration
├── test/                 # Unit and widget tests
├── pubspec.yaml          # Flutter dependencies
└── analysis_options.yaml # Dart linting rules
```

## Shared Resources

### Testing Documentation (_TestingGuide/)
- Comprehensive testing guides for each component
- API testing procedures
- End-to-end workflow testing
- Platform-specific testing instructions

### Super Tests (.SuperTest/)
- High-level integration test scenarios
- Business workflow validation
- Cross-platform testing scenarios

### Deployment (deploy/)
- Coolify deployment configurations
- Environment-specific settings
- Infrastructure as code

## File Naming Conventions

### Backend (Python/Django)
- Snake_case for Python files and directories
- Django app names in lowercase
- Model names in PascalCase
- View/serializer files descriptive (e.g., `artist_views.py`)

### Frontend (React/TypeScript)
- PascalCase for React components
- camelCase for utilities and services
- kebab-case for CSS classes (TailwindCSS)
- Descriptive component names (e.g., `ArtistDashboard.tsx`)

### Mobile (Flutter/Dart)
- snake_case for Dart files
- PascalCase for classes and widgets
- camelCase for variables and methods

## Configuration Files

### Environment Files
- `.env.local` - Local development environment variables
- `.env.example` - Template for environment configuration
- `env.coolify.example` - Production deployment template

### Build Configuration
- `package.json` - Node.js dependencies and scripts
- `requirements.txt` - Python dependencies
- `pubspec.yaml` - Flutter dependencies
- Docker files for containerization

## Import/Export Patterns

### Backend
- Use relative imports within apps
- Absolute imports for cross-app dependencies
- Centralized settings in `core/settings/`

### Frontend
- Barrel exports from component directories
- Absolute imports using path aliases
- Shared types exported from dedicated files

### Mobile
- Package imports follow Dart conventions
- Feature-based directory organization
- Shared utilities in dedicated packages