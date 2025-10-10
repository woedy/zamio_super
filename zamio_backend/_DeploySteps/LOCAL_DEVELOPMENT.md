# 🖥️ ZamIO Django - Local Development Guide

**Complete guide for running ZamIO Django locally with Docker**

---

## 🚀 **Quick Start (Recommended)**

### **For Windows Users**

1. **Start Services**: Double-click `start-local.bat`
2. **Access App**: Open http://localhost:9001 in your browser
3. **Stop Services**: Double-click `stop-local.bat` when done

### **For Command Line Users**

```bash
# Start services
docker-compose -f docker-compose.local.yml up -d



python -c "from pathlib import Path; p=Path('entrypoint.sh');
p.write_bytes(p.read_text().replace('\r\n','\n').encode())"

docker-compose -f docker-compose.local.yml exec zamio_app python manage.py migrate

# Access app
# Django: http://localhost:9001
# PostgreSQL: localhost:9003
# Redis: localhost:9004

# Stop services
docker-compose -f docker-compose.local.yml down
```

---

## 🔧 **What's Included**

### **Services**

- **Django App** (Port 9001): Your main application
- **PostgreSQL** (Port 9003): Database
- **Redis** (Port 9004): Cache and Celery broker
- **Celery Worker**: Background task processing
- **Celery Beat**: Scheduled task scheduler

### **Ports (All in 9000s)**

- **9001**: Django application
- **9003**: PostgreSQL database
- **9004**: Redis cache

---

## 📁 **Project Structure for Local Development**

```
zamio/                        # Repository root
├── packages/
│   └── ui-theme/            # Shared UI theme package
├── zamio_frontend/          # Artist portal (React/Vite)
├── zamio_admin/             # Admin dashboard (React/Vite)
├── zamio_publisher/         # Publisher portal (React/Vite)
├── zamio_stations/          # Station portal (React/Vite)
├── zamio_backend/
│   ├── docker-compose.local.yml  # Local services configuration
│   ├── Dockerfile               # Backend container
│   ├── entrypoint.sh            # Container startup script
│   ├── .env.local               # Local environment variables
│   ├── start-local.bat          # Windows startup script
│   ├── stop-local.bat           # Windows stop script
│   └── [Django apps...]
└── .dockerignore            # Root-level Docker ignore file
```

### **Monorepo Build Context**

ZamIO uses a monorepo structure with shared packages. The frontend applications (zamio_frontend, zamio_admin, zamio_publisher, zamio_stations) all depend on the shared `@zamio/ui-theme` package located in `packages/ui-theme`.

**Key Points:**

- Frontend Docker builds use the **repository root** as the build context
- This allows access to both the application code and shared packages
- The `.dockerignore` file at the root excludes unnecessary files from builds
- Volume mounts enable hot-reloading for both app code and shared packages

---

## 🛠️ **Common Commands**

### **Django Management**

```bash
# Run migrations
docker-compose -f docker-compose.local.yml exec zamio_app python manage.py migrate

# Create superuser
docker-compose -f docker-compose.local.yml exec -it zamio_app python manage.py createsuperuser

# Django shell
docker-compose -f docker-compose.local.yml exec -it zamio_app python manage.py shell

# Collect static files
docker-compose -f docker-compose.local.yml exec zamio_app python manage.py collectstatic --noinput
```

### **Frontend Services Management**

```bash
# Build all frontend services
docker-compose -f docker-compose.local.yml build zamio_frontend zamio_admin zamio_publisher zamio_stations

# Build a specific frontend service
docker-compose -f docker-compose.local.yml build zamio_frontend

# Start all services (including frontends)
docker-compose -f docker-compose.local.yml up -d

# View frontend logs
docker-compose -f docker-compose.local.yml logs -f zamio_frontend

# Restart a frontend service
docker-compose -f docker-compose.local.yml restart zamio_frontend
```

### **Service Management**

```bash
# View logs
docker-compose -f docker-compose.local.yml logs -f zamio_app

# Restart a service
docker-compose -f docker-compose.local.yml restart zamio_app

# View running containers
docker-compose -f docker-compose.local.yml ps

# Rebuild and restart all services
docker-compose -f docker-compose.local.yml up -d --build
```

---

## 🏗️ **Docker Build Context Architecture**

### **Understanding the Monorepo Build Context**

ZamIO uses a monorepo structure where frontend applications share common packages. To enable this, the Docker build configuration uses an **expanded build context** approach.

### **How It Works**

**Traditional Approach (Doesn't Work for Monorepos):**

```yaml
# ❌ This fails because Docker can't access ../packages/
zamio_frontend:
  build:
    context: ../zamio_frontend
    dockerfile: Dockerfile
```

**Monorepo Approach (Current Implementation):**

```yaml
# ✅ This works because context includes both app and packages
zamio_frontend:
  build:
    context: .. # Repository root
    dockerfile: zamio_frontend/Dockerfile
    target: development # Use dev stage
  volumes:
    - ../zamio_frontend:/app/zamio_frontend
    - ../packages:/app/packages # Shared packages
```

### **Multi-Stage Dockerfile Structure**

Each frontend Dockerfile uses multi-stage builds:

1. **Base Stage**: Copies shared packages and installs dependencies
2. **Development Stage**: Runs dev server with hot reload
3. **Builder Stage**: Creates production build
4. **Production Stage**: Serves optimized static files

**Benefits:**

- Single Dockerfile for all environments
- Efficient layer caching
- Smaller production images
- Shared package access during build

### **Build Context Best Practices**

1. **Always run docker-compose from `zamio_backend/` directory**

   - The `context: ..` is relative to docker-compose.yml location
   - Running from elsewhere will break the build context

2. **Use `.dockerignore` to optimize builds**

   - Located at repository root
   - Excludes node_modules, .git, and other unnecessary files
   - Reduces build context size significantly

3. **Leverage layer caching**

   - Package files are copied before source code
   - Dependencies only reinstall when package.json changes
   - Subsequent builds are much faster

4. **Volume mounts for development**
   - Source code changes reflect immediately
   - Shared package changes reflect in all apps
   - No rebuild needed during development

---

## 🔍 **Troubleshooting**

### **Common Issues**

#### **Port Already in Use**

If you get port conflicts, check what's using the ports:

```bash
# Windows
netstat -ano | findstr :9001
netstat -ano | findstr :9002
netstat -ano | findstr :9003
netstat -ano | findstr :9004
netstat -ano | findstr :9005
netstat -ano | findstr :9006
netstat -ano | findstr :9007

# Stop conflicting processes or change ports in docker-compose.local.yml
```

**Frontend Port Mappings:**

- 9001: Django API
- 9002: zamio_frontend (Artist Portal)
- 9005: zamio_stations
- 9006: zamio_publisher
- 9007: zamio_admin

#### **Database Connection Issues**

```bash
# Check if database is running
docker-compose -f docker-compose.local.yml ps db

# View database logs
docker-compose -f docker-compose.local.yml logs db
```

#### **Django Won't Start**

```bash
# Check Django logs
docker-compose -f docker-compose.local.yml logs zamio_app


# Run Django commands manually
docker-compose -f docker-compose.local.yml exec zamio_app python manage.py check
```

#### **Frontend Build Failures**

If you encounter "invalid file request" or module not found errors:

```bash
# Clean and rebuild from scratch
docker-compose -f docker-compose.local.yml down
docker-compose -f docker-compose.local.yml build --no-cache zamio_frontend
docker-compose -f docker-compose.local.yml up -d

# Check if shared package exists
# Ensure packages/ui-theme directory exists in repository root
```

**Common Frontend Issues:**

1. **"Cannot find module '@zamio/ui-theme'"**

   - Ensure the build context is set to repository root (`..`)
   - Verify `packages/ui-theme` exists and has a valid `package.json`
   - Rebuild the container: `docker-compose -f docker-compose.local.yml build --no-cache [service]`

2. **"invalid file request node_modules/@zamio/ui-theme"**

   - This indicates the build context is incorrect
   - Verify `docker-compose.local.yml` has `context: ..` for frontend services
   - Check that the Dockerfile path is relative to root (e.g., `zamio_frontend/Dockerfile`)

3. **Hot Reload Not Working**

   - Verify volume mounts include both app directory and packages directory
   - Check that `node_modules` is preserved with anonymous volume
   - Restart the service: `docker-compose -f docker-compose.local.yml restart [service]`

4. **Slow Build Times**
   - Ensure `.dockerignore` file exists at repository root
   - Check that unnecessary files are excluded (node_modules, .git, etc.)
   - Use layer caching by not changing package.json frequently

#### **Shared Package Issues**

If changes to `packages/ui-theme` don't reflect in frontend apps:

```bash
# Restart all frontend services
docker-compose -f docker-compose.local.yml restart zamio_frontend zamio_admin zamio_publisher zamio_stations

# If still not working, rebuild
docker-compose -f docker-compose.local.yml build zamio_frontend zamio_admin zamio_publisher zamio_stations
docker-compose -f docker-compose.local.yml up -d
```

#### **Docker Build Context Issues**

The frontend services use the **repository root** as the build context to access shared packages:

```yaml
# Correct configuration in docker-compose.local.yml
zamio_frontend:
  build:
    context: .. # Repository root
    dockerfile: zamio_frontend/Dockerfile
    target: development
```

**If you see build errors:**

1. Verify you're running commands from `zamio_backend/` directory
2. Check that `..` resolves to the repository root
3. Ensure `.dockerignore` exists at repository root
4. Confirm `packages/ui-theme` is accessible from root

#### **Clean Slate Rebuild**

If you need to start fresh:

```bash
# Stop and remove all containers, networks, and volumes
docker-compose -f docker-compose.local.yml down -v

# Remove all images
docker-compose -f docker-compose.local.yml down --rmi all

# Rebuild everything from scratch
docker-compose -f docker-compose.local.yml build --no-cache

# Start services
docker-compose -f docker-compose.local.yml up -d
```

---

## 📝 **Environment Variables**

The `.env.local` file contains all necessary configuration:

- Database connection
- Redis connection
- Django settings
- Security keys

**⚠️ Never commit `.env.local` to version control!**

### **Frontend Environment Variables**

Each frontend application has its own `.env.local` file:

- `zamio_frontend/.env.local` - Artist portal configuration
- `zamio_admin/.env.local` - Admin dashboard configuration
- `zamio_publisher/.env.local` - Publisher portal configuration
- `zamio_stations/.env.local` - Station portal configuration

**Key Variables:**

- `VITE_API_URL` - Backend API endpoint (typically `http://localhost:9001`)

## 🗂️ **.dockerignore Configuration**

The repository root contains a `.dockerignore` file that excludes unnecessary files from Docker builds:

**Excluded Items:**

- `node_modules/` - Prevents copying local dependencies (installed in container)
- `.git/` - Version control history not needed in containers
- `*.md` - Documentation files
- `dist/`, `build/` - Build artifacts
- `.env`, `.env.local` - Sensitive environment files
- Test files and coverage reports

**Why This Matters:**

- Reduces build context size (faster builds)
- Prevents sensitive data from entering containers
- Improves layer caching efficiency
- Reduces final image size

**Location:** `.dockerignore` at repository root (same level as `packages/`, `zamio_backend/`, etc.)

---

## 🎯 **Next Steps**

Once your local environment is running:

1. **Run Migrations**: Set up your database schema
2. **Create Superuser**: Access Django admin
3. **Explore the Apps**:
   - Backend API: http://localhost:9001
   - Artist Portal: http://localhost:9002
   - Stations Portal: http://localhost:9005
   - Publisher Portal: http://localhost:9006
   - Admin Dashboard: http://localhost:9007
4. **Check Celery**: Monitor background tasks
5. **Develop**: Make changes and see them live with hot reload!

### **Working with Shared Packages**

When developing shared UI components:

1. Make changes in `packages/ui-theme/`
2. Changes automatically reflect in all frontend apps (via volume mounts)
3. No rebuild required for development
4. For production builds, rebuild affected services

---

## 📚 **Additional Resources**

- **DEPLOYMENT_STEPS.md**: Detailed step-by-step guide
- **QUICK_COMMANDS.md**: Essential commands reference
- **DEPLOYMENT_CHECKLIST.md**: Deployment verification checklist

---

**Happy coding! 🎉**
