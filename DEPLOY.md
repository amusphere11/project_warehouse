# 🚀 Quick Deployment Guide

## Untuk Deploy di Server Linux

### 1. Copy Project ke Server

```bash
# Dari komputer lokal, copy ke server
scp -r /Users/azka/Documents/project_warehouse user@server-ip:/opt/warehouse

# Atau gunakan rsync (lebih cepat)
rsync -avz --exclude 'node_modules' --exclude '.git' \
  /Users/azka/Documents/project_warehouse/ \
  user@server-ip:/opt/warehouse/
```

### 2. Build Docker Images (Pilih salah satu)

#### Option A: Build di Server (Recommended)

```bash
# SSH ke server
ssh user@server-ip

cd /opt/warehouse

# Build backend
cd backend
docker build -t warehouse-backend:latest .

# Build frontend
cd ../frontend
docker build -t warehouse-frontend:latest .

cd ..
```

#### Option B: Build di Local, Transfer ke Server

```bash
# Di komputer lokal
cd /Users/azka/Documents/project_warehouse

# Build images
cd backend && docker build -t warehouse-backend:latest .
cd ../frontend && docker build -t warehouse-frontend:latest .

# Save to tar
cd ..
docker save warehouse-backend:latest | gzip > warehouse-backend.tar.gz
docker save warehouse-frontend:latest | gzip > warehouse-frontend.tar.gz

# Copy ke server
scp warehouse-*.tar.gz user@server-ip:/opt/warehouse/

# Di server, load images
ssh user@server-ip
cd /opt/warehouse
docker load < warehouse-backend.tar.gz
docker load < warehouse-frontend.tar.gz
```

### 3. Setup Environment

```bash
# Di server
cd /opt/warehouse

# Copy dan edit environment variables
cp .env.prod.example .env.prod
nano .env.prod

# Isi dengan:
# DB_USER=warehouse_user
# DB_PASSWORD=YOUR_STRONG_PASSWORD
# DB_NAME=warehouse_db
# REDIS_PASSWORD=YOUR_STRONG_PASSWORD
# JWT_SECRET=YOUR_STRONG_JWT_SECRET
```

**Generate strong password:**
```bash
openssl rand -base64 32
```

### 4. Deploy dengan Docker Compose

```bash
# Start semua services
docker compose -f docker-compose.prod.yml up -d

# Lihat logs
docker compose -f docker-compose.prod.yml logs -f

# Tunggu sampai semua services running
docker compose -f docker-compose.prod.yml ps
```

### 5. Setup Database

```bash
# Run migrations
docker compose -f docker-compose.prod.yml exec backend npm run db:migrate

# Seed initial data (optional)
docker compose -f docker-compose.prod.yml exec backend npm run db:seed
```

### 6. Setup SSL (Optional tapi Recommended)

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Stop nginx temporarily
docker compose -f docker-compose.prod.yml stop nginx

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl/

# Edit nginx.conf, uncomment HTTPS section
nano nginx/nginx.conf

# Start nginx
docker compose -f docker-compose.prod.yml start nginx
```

### 7. Verify Deployment

```bash
# Check all services running
docker compose -f docker-compose.prod.yml ps

# Test backend
curl http://localhost/api/health

# Check logs
docker compose -f docker-compose.prod.yml logs -f backend
```

### 8. Access Application

- **Frontend:** http://server-ip atau http://your-domain.com
- **Backend API:** http://server-ip/api atau http://your-domain.com/api
- **API Docs:** http://server-ip/api-docs

**Default Login:**
- Email: admin@warehouse.com
- Password: admin123

---

## Backup & Maintenance

### Daily Backup (Automated)

```bash
# Make backup script executable
chmod +x backup.sh

# Test backup
./backup.sh

# Setup cron for daily backup at 2 AM
crontab -e
# Add: 0 2 * * * /opt/warehouse/backup.sh
```

### Restore from Backup

```bash
# Make restore script executable
chmod +x restore.sh

# Run restore
./restore.sh
```

### Update Application

```bash
# Pull latest changes
cd /opt/warehouse
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# Run migrations if needed
docker compose -f docker-compose.prod.yml exec backend npm run db:migrate
```

---

## Troubleshooting

### Services won't start
```bash
docker compose -f docker-compose.prod.yml logs
```

### Restart services
```bash
docker compose -f docker-compose.prod.yml restart
```

### Stop all services
```bash
docker compose -f docker-compose.prod.yml down
```

---

## 📚 Full Documentation

Baca dokumentasi lengkap di:
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Panduan deployment detail
- [SETUP.md](docs/SETUP.md) - Setup & configuration
- [RINGKASAN_LENGKAP.md](docs/RINGKASAN_LENGKAP.md) - Dokumentasi Indonesia lengkap

---

**Good luck with your deployment! 🚀**
