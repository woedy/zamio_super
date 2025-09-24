# 🚀 ZamIO Django Deployment Steps - Clear & Simple

**Follow these steps exactly to deploy your Django project locally and on Coolify.**

---

## 🖥️ **LOCAL DEVELOPMENT DEPLOYMENT**

### **Step 1: Prerequisites Check**
```bash
# Make sure you're in the right directory
cd zamio_backend

# Check if Docker is running
docker info

# Check if Docker Compose is available
docker-compose --version
```

**✅ Expected Result**: Docker info shows running status, docker-compose shows version

---

### **Step 2: Create Local Environment File**
```bash
# Copy the local environment template
copy env.local.example .env.local

# Verify the file was created
dir .env.local
```

**✅ Expected Result**: `.env.local` file exists in your directory

---

### **Step 3: Start Local Services**
```bash
# Start all local services
docker-compose -f docker-compose.local.yml up -d

# Wait for services to start (about 30 seconds)
```

**✅ Expected Result**: All containers start without errors

---

### **Step 4: Verify Services Are Running**
```bash
# Check container status
docker-compose -f docker-compose.local.yml ps

# You should see:
# - db (PostgreSQL) - Status: Up
# - redis - Status: Up  
# - zamio_app (Django) - Status: Up
# - celery_worker - Status: Up
# - celery_beat - Status: Up
```

**✅ Expected Result**: All 5 containers show "Up" status

---

### **Step 5: Test Your Application**
```bash
# Open your browser and go to:
# http://localhost:9001

# You should see Django welcome page or your app
```

**✅ Expected Result**: Django application loads in browser

---

### **Step 6: Run Django Commands**
```bash
# Run database migrations
docker-compose -f docker-compose.local.yml exec zamio_app python manage.py migrate

# Create a superuser
docker-compose -f docker-compose.local.yml exec -it zamio_app python manage.py createsuperuser

# Collect static files
docker-compose -f docker-compose.local.yml exec zamio_app python manage.py collectstatic --noinput
```

**✅ Expected Result**: Commands execute without errors

---

### **Step 7: Local Development Complete**
```bash
# Your local environment is now ready!
# Access points:
# - Django App: http://localhost:9001
# - PostgreSQL: localhost:9003
# - Redis: localhost:9004

# To stop services later:
docker-compose -f docker-compose.local.yml down
```

---

## ☁️ **COOLIFY PRODUCTION DEPLOYMENT (SUMMARY)**

Full step-by-step instructions now live in `deploy/coolify/README.md` at the repository root. The highlights:

1. Use the dedicated `Dockerfile.coolify` in each service directory to build production images (Gunicorn for Django, Nginx for all Vite frontends).
2. Provide environment variables from `zamio_backend/env.coolify.example` (set `SERVICE_ROLE=web`, `worker`, or `beat` as appropriate).
3. Attach the backend, Celery worker, Celery beat, and all React apps to the same Coolify private network along with managed PostgreSQL and Redis instances.
4. Mount persistent storage for `/app/static_cdn` and `/app/media`, or configure S3 before enabling uploads.
5. Use the `/healthz` endpoint exposed by each frontend (and your API health endpoint) for Coolify health checks.

Follow the root guide for detailed environment tables, domain routing, and the optional `docker-compose.coolify.template.yml` reference.

---