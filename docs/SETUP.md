# 🚀 Quick Start Guide

## Prerequisites

Pastikan Anda sudah install:
- [Node.js](https://nodejs.org/) v20 atau lebih tinggi
- [PostgreSQL](https://www.postgresql.org/) v15 atau lebih tinggi
- [Redis](https://redis.io/) v7 atau lebih tinggi
- [Docker](https://www.docker.com/) (optional, untuk easy setup)
- Git

## Installation

### Option 1: Docker (Recommended untuk Development)

```bash
# Clone repository
cd /Users/azka/Documents/project_warehouse

# Start semua services dengan Docker Compose
docker-compose up -d

# Wait for services to be ready (check with)
docker-compose ps

# Install backend dependencies
cd backend
npm install

# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database dengan sample data
npm run db:seed

# Backend akan running di http://localhost:3000

# Di terminal baru, install frontend dependencies
cd ../frontend
npm install

# Start frontend
npm run dev

# Frontend akan running di http://localhost:5173
```

### Option 2: Manual Setup

#### 1. Setup PostgreSQL

```bash
# Login ke PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE warehouse_db;

# Create user
CREATE USER warehouse_user WITH ENCRYPTED PASSWORD 'warehouse_pass';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE warehouse_db TO warehouse_user;

# Exit
\q
```

#### 2. Setup Redis

```bash
# Start Redis
redis-server

# Atau dengan Homebrew (macOS)
brew services start redis

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

#### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env dan sesuaikan dengan konfigurasi Anda
# DATABASE_URL=postgresql://warehouse_user:warehouse_pass@localhost:5432/warehouse_db
# REDIS_URL=redis://localhost:6379

# Generate Prisma Client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database
npm run db:seed

# Start development server
npm run dev
```

#### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env
# VITE_API_URL=http://localhost:3000
# VITE_WS_URL=ws://localhost:3000

# Start development server
npm run dev
```

## Default Login Credentials

Setelah seeding database, Anda bisa login dengan:

```
Admin Account:
Email: admin@warehouse.com
Password: admin123

Operator Account:
Email: operator@warehouse.com
Password: operator123
```

## Verifikasi Installation

1. **Backend Health Check**:
```bash
curl http://localhost:3000/health
# Should return: {"status":"OK","timestamp":"..."}
```

2. **API Documentation**:
   - Buka http://localhost:3000/api-docs
   - Anda akan melihat Swagger UI dengan semua API endpoints

3. **Frontend**:
   - Buka http://localhost:5173
   - Login dengan credentials di atas

## Testing Barcode Scanner

### USB Barcode Scanner:
1. Pastikan scanner dalam mode USB-HID (biasanya default)
2. Scanner akan bertindak seperti keyboard
3. Scan barcode akan auto-fill input field yang sedang focus

### Test dengan Keyboard:
1. Di halaman scanning, focus pada input barcode
2. Ketik barcode: `MAT-001` atau `PRD-001` (dari seed data)
3. Klik "Scan" atau tekan Enter

## Common Commands

### Backend

```bash
# Development
npm run dev

# Build untuk production
npm run build

# Start production
npm start

# Run tests
npm test

# Database
npm run db:migrate      # Run migrations
npm run db:seed         # Seed data
npm run db:studio       # Open Prisma Studio (GUI)
npm run db:generate     # Generate Prisma Client

# Code quality
npm run lint            # ESLint
npm run format          # Prettier
```

### Frontend

```bash
# Development
npm run dev

# Build untuk production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Lint
npm run lint
```

### Docker

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Rebuild images
docker-compose up -d --build

# Remove volumes (reset database)
docker-compose down -v
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9

# Kill process on port 5432 (postgres)
lsof -ti:5432 | xargs kill -9
```

### Database Connection Error

```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Check database exists
psql -U postgres -c "\l" | grep warehouse_db

# Check connection string in .env
cat backend/.env | grep DATABASE_URL
```

### Redis Connection Error

```bash
# Check Redis is running
redis-cli ping

# Start Redis
redis-server

# Or with Homebrew
brew services start redis
```

### Prisma Migration Errors

```bash
# Reset database (WARNING: deletes all data)
cd backend
npx prisma migrate reset

# Or manually
npx prisma db push
npx prisma generate
npm run db:seed
```

### Node Modules Issues

```bash
# Clear node_modules and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

## Production Build & Deployment

### Build Docker Images untuk Linux/Production

#### 1. Build Backend Image

```bash
cd backend

# Build production image
docker build -t warehouse-backend:latest .

# Tag untuk registry (optional)
docker tag warehouse-backend:latest your-registry/warehouse-backend:latest

# Push ke registry
docker push your-registry/warehouse-backend:latest

# Test locally
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e REDIS_URL=redis://host:6379 \
  -e JWT_SECRET=your-secret \
  warehouse-backend:latest
```

#### 2. Build Frontend Image

```bash
cd frontend

# Build production image
docker build -t warehouse-frontend:latest .

# Tag untuk registry (optional)
docker tag warehouse-frontend:latest your-registry/warehouse-frontend:latest

# Push ke registry
docker push your-registry/warehouse-frontend:latest

# Test locally
docker run -p 80:80 \
  warehouse-frontend:latest
```

#### 3. Deploy dengan Docker Compose (Production)

Buat file `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: always

  backend:
    image: warehouse-backend:latest
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3000
    depends_on:
      - postgres
      - redis
    restart: always

  frontend:
    image: warehouse-frontend:latest
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    restart: always

volumes:
  postgres_data:
  redis_data:
```

Deploy ke server:

```bash
# Copy files ke server
scp -r . user@server:/opt/warehouse

# SSH ke server
ssh user@server

# Navigate to project
cd /opt/warehouse

# Create .env file
nano .env.prod

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate

# Seed database (optional)
docker-compose -f docker-compose.prod.yml exec backend npm run db:seed
```

### Manual Build (Without Docker)

#### Backend

```bash
cd backend

# Install production dependencies
npm ci --production

# Build TypeScript
npm run build

# Setup environment
export NODE_ENV=production
export DATABASE_URL=postgresql://user:pass@host:5432/db
export REDIS_URL=redis://host:6379
export JWT_SECRET=your-secret

# Run migrations
npm run db:migrate

# Start server
npm start

# Or with PM2 (recommended)
npm install -g pm2
pm2 start dist/index.js --name warehouse-backend
pm2 save
pm2 startup
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm ci

# Build for production
npm run build

# Output akan ada di folder 'dist'
# Deploy dist folder ke web server (nginx/apache)

# Example dengan nginx:
# Copy dist folder ke /var/www/html
sudo cp -r dist/* /var/www/html/

# Or serve dengan simple server
npx serve -s dist -p 80
```

### Nginx Configuration untuk Production

Create `/etc/nginx/sites-available/warehouse`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/warehouse /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Environment Variables for Production

Backend `.env`:
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=generate-strong-random-secret-here
JWT_EXPIRES_IN=7d
```

Frontend `.env.production`:
```
VITE_API_URL=https://your-domain.com
VITE_WS_URL=wss://your-domain.com
```

### Security Checklist

- [ ] Change default passwords
- [ ] Generate strong JWT_SECRET
- [ ] Setup SSL/TLS certificates (Let's Encrypt)
- [ ] Configure firewall (UFW/iptables)
- [ ] Setup database backups
- [ ] Configure log rotation
- [ ] Enable rate limiting
- [ ] Setup monitoring (Prometheus/Grafana)
- [ ] Configure CORS properly
- [ ] Use environment variables (never hardcode secrets)

## Next Steps

1. **Explore API Documentation**: http://localhost:3000/api-docs
2. **Try Scanning**: Gunakan sample barcodes dari seed data
3. **Generate Reports**: Export ke Excel/PDF
4. **Customize**: Edit `prisma/schema.prisma` untuk menambah fields
5. **Deploy**: Follow production deployment guide di atas

## Need Help?

- Check [ARCHITECTURE.md](./ARCHITECTURE.md) untuk technical details
- Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) untuk API documentation
- Create issue di repository
