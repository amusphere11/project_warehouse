# 🚀 Production Deployment Guide

Panduan lengkap untuk deployment Production & Inventory Management System ke server Linux.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Build Docker Images](#build-docker-images)
4. [Deploy to Server](#deploy-to-server)
5. [Configure SSL/TLS](#configure-ssltls)
6. [Database Migration](#database-migration)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Backup & Recovery](#backup--recovery)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### Local Machine
- Docker installed
- Git
- SSH access to server

### Server Requirements
- **OS:** Ubuntu 20.04 LTS / 22.04 LTS (or similar Linux)
- **CPU:** Minimum 2 cores (4 cores recommended)
- **RAM:** Minimum 4GB (8GB recommended)
- **Storage:** Minimum 50GB SSD
- **Docker:** v24.0+
- **Docker Compose:** v2.20+

## Server Setup

### 1. Update System

```bash
# SSH ke server
ssh user@your-server-ip

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install essential tools
sudo apt-get install -y curl wget git vim
```

### 2. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again for changes to take effect
exit
ssh user@your-server-ip

# Verify Docker installation
docker --version
docker compose version
```

### 3. Configure Firewall

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 4. Create Application Directory

```bash
sudo mkdir -p /opt/warehouse
sudo chown -R $USER:$USER /opt/warehouse
cd /opt/warehouse
```

## Build Docker Images

### Option 1: Build on Local Machine

```bash
# On your local machine
cd /Users/azka/Documents/project_warehouse

# Build backend image
cd backend
docker build -t warehouse-backend:latest .

# Build frontend image
cd ../frontend
docker build -t warehouse-frontend:latest .

# Save images to tar files
cd ..
docker save warehouse-backend:latest | gzip > warehouse-backend.tar.gz
docker save warehouse-frontend:latest | gzip > warehouse-frontend.tar.gz

# Copy to server
scp warehouse-backend.tar.gz user@your-server-ip:/opt/warehouse/
scp warehouse-frontend.tar.gz user@your-server-ip:/opt/warehouse/

# On server, load images
ssh user@your-server-ip
cd /opt/warehouse
docker load < warehouse-backend.tar.gz
docker load < warehouse-frontend.tar.gz

# Verify
docker images
```

### Option 2: Build on Server

```bash
# On server
cd /opt/warehouse

# Clone repository
git clone https://github.com/your-repo/warehouse.git .

# Or upload via SCP
# scp -r . user@your-server-ip:/opt/warehouse/

# Build backend
cd backend
docker build -t warehouse-backend:latest .

# Build frontend
cd ../frontend
docker build -t warehouse-frontend:latest .

# Verify
docker images
```

### Option 3: Use Docker Registry

```bash
# On local machine, push to Docker Hub
docker login
docker tag warehouse-backend:latest yourusername/warehouse-backend:latest
docker tag warehouse-frontend:latest yourusername/warehouse-frontend:latest
docker push yourusername/warehouse-backend:latest
docker push yourusername/warehouse-frontend:latest

# On server, pull images
docker pull yourusername/warehouse-backend:latest
docker pull yourusername/warehouse-frontend:latest

# Tag locally
docker tag yourusername/warehouse-backend:latest warehouse-backend:latest
docker tag yourusername/warehouse-frontend:latest warehouse-frontend:latest
```

## Deploy to Server

### 1. Setup Environment Variables

```bash
cd /opt/warehouse

# Copy example file
cp .env.prod.example .env.prod

# Edit environment variables
nano .env.prod
```

Set the following variables:

```env
DB_USER=warehouse_user
DB_PASSWORD=YOUR_STRONG_PASSWORD_HERE
DB_NAME=warehouse_db

REDIS_PASSWORD=YOUR_STRONG_PASSWORD_HERE

JWT_SECRET=YOUR_STRONG_JWT_SECRET_HERE
JWT_EXPIRES_IN=7d

LOG_LEVEL=info
```

**Important:** Use strong, random passwords!

```bash
# Generate strong passwords
openssl rand -base64 32
```

### 2. Setup Nginx Configuration

```bash
# Create nginx directory
mkdir -p nginx/ssl nginx/logs

# Copy nginx configuration
# (Already in project, or create from template)

# Generate self-signed certificate (for testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/privkey.pem \
  -out nginx/ssl/fullchain.pem \
  -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Warehouse/CN=$(hostname)"
```

### 3. Start Services

```bash
# Start all services
docker compose -f docker-compose.prod.yml up -d

# Check services status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### 4. Wait for Services to Start

```bash
# Wait for PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres pg_isready

# Wait for Redis
docker compose -f docker-compose.prod.yml exec redis redis-cli ping

# Check backend health
curl http://localhost/api/health
```

## Configure SSL/TLS

### Using Let's Encrypt (Production)

```bash
# Stop nginx temporarily
docker compose -f docker-compose.prod.yml stop nginx

# Install certbot
sudo apt-get install -y certbot

# Generate certificate
sudo certbot certonly --standalone \
  -d your-domain.com \
  -d www.your-domain.com \
  --email your-email@example.com \
  --agree-tos

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl/

# Edit nginx.conf and enable HTTPS block
nano nginx/nginx.conf

# Update server_name with your domain
# Uncomment HTTPS server block
# Uncomment HTTP to HTTPS redirect

# Start nginx
docker compose -f docker-compose.prod.yml start nginx

# Setup auto-renewal
sudo certbot renew --dry-run

# Add cron job for auto-renewal
sudo crontab -e
# Add: 0 0 1 * * certbot renew --quiet && systemctl reload nginx
```

## Database Migration

### 1. Run Migrations

```bash
# Run database migrations
docker compose -f docker-compose.prod.yml exec backend npm run db:migrate

# Verify tables created
docker compose -f docker-compose.prod.yml exec postgres psql -U warehouse_user -d warehouse_db -c "\dt"
```

### 2. Seed Initial Data (Optional)

```bash
# Seed database with sample data
docker compose -f docker-compose.prod.yml exec backend npm run db:seed

# Or seed manually via Prisma Studio
docker compose -f docker-compose.prod.yml exec backend npx prisma studio
# Access at http://localhost:5555
```

### 3. Create Admin User

```bash
# Option 1: Use seed data (admin@warehouse.com / admin123)

# Option 2: Create via API
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "YourStrongPassword",
    "name": "Admin User",
    "role": "ADMIN"
  }'
```

## Monitoring & Maintenance

### 1. View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f nginx

# Nginx access logs
tail -f nginx/logs/access.log

# Nginx error logs
tail -f nginx/logs/error.log
```

### 2. Monitor Resources

```bash
# Docker stats
docker stats

# Disk usage
df -h

# Service status
docker compose -f docker-compose.prod.yml ps
```

### 3. Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild images
docker compose -f docker-compose.prod.yml build

# Restart services
docker compose -f docker-compose.prod.yml up -d

# Run migrations if needed
docker compose -f docker-compose.prod.yml exec backend npm run db:migrate
```

### 4. Restart Services

```bash
# Restart all services
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker compose -f docker-compose.prod.yml restart backend
docker compose -f docker-compose.prod.yml restart frontend
docker compose -f docker-compose.prod.yml restart nginx
```

## Backup & Recovery

### 1. Database Backup

```bash
# Create backup directory
mkdir -p backups

# Backup database
docker compose -f docker-compose.prod.yml exec postgres pg_dump \
  -U warehouse_user \
  -d warehouse_db \
  -F c \
  -f /tmp/backup.dump

# Copy from container
docker compose -f docker-compose.prod.yml cp \
  postgres:/tmp/backup.dump \
  backups/warehouse_db_$(date +%Y%m%d_%H%M%S).dump

# Automated daily backup (add to crontab)
# 0 2 * * * /opt/warehouse/backup.sh
```

Create `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/warehouse/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
docker compose -f /opt/warehouse/docker-compose.prod.yml exec -T postgres \
  pg_dump -U warehouse_user -d warehouse_db -F c > \
  $BACKUP_DIR/warehouse_db_$DATE.dump

# Keep only last 30 backups
ls -t $BACKUP_DIR/warehouse_db_*.dump | tail -n +31 | xargs rm -f

# Compress old backups (older than 7 days)
find $BACKUP_DIR -name "*.dump" -mtime +7 -exec gzip {} \;
```

### 2. Restore Database

```bash
# Stop backend
docker compose -f docker-compose.prod.yml stop backend

# Restore from backup
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_restore -U warehouse_user -d warehouse_db -c < \
  backups/warehouse_db_20240101_120000.dump

# Start backend
docker compose -f docker-compose.prod.yml start backend
```

### 3. Volume Backup

```bash
# Backup volumes
docker run --rm \
  -v warehouse_postgres_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/postgres_volume_$(date +%Y%m%d).tar.gz /data

docker run --rm \
  -v warehouse_redis_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/redis_volume_$(date +%Y%m%d).tar.gz /data
```

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs

# Check individual service
docker compose -f docker-compose.prod.yml logs backend

# Restart specific service
docker compose -f docker-compose.prod.yml restart backend
```

### Database Connection Error

```bash
# Check PostgreSQL is running
docker compose -f docker-compose.prod.yml ps postgres

# Check connection
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U warehouse_user -d warehouse_db -c "SELECT 1"

# Check environment variables
docker compose -f docker-compose.prod.yml exec backend env | grep DATABASE_URL
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :80
sudo lsof -i :443

# Kill process
sudo kill -9 <PID>

# Or change ports in docker-compose.prod.yml
```

### Out of Memory

```bash
# Check memory usage
free -h
docker stats

# Add swap space
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Disk Space Full

```bash
# Check disk usage
df -h
docker system df

# Clean up Docker
docker system prune -a --volumes

# Remove old logs
sudo find /var/lib/docker/containers -name "*.log" -delete
```

### SSL Certificate Issues

```bash
# Check certificate expiry
openssl x509 -in nginx/ssl/fullchain.pem -noout -dates

# Renew Let's Encrypt
sudo certbot renew

# Copy new certificates
sudo cp /etc/letsencrypt/live/your-domain.com/*.pem nginx/ssl/

# Reload nginx
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

## Performance Tuning

### PostgreSQL

Edit `docker-compose.prod.yml` to add PostgreSQL parameters:

```yaml
postgres:
  command: postgres -c shared_buffers=256MB -c max_connections=200
```

### Redis

```yaml
redis:
  command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
```

### Nginx

Edit `nginx/nginx.conf`:

```nginx
worker_processes auto;
worker_connections 2048;
```

## Security Checklist

- [x] Changed default passwords
- [x] Generated strong JWT_SECRET
- [ ] Setup SSL/TLS certificates
- [ ] Configured firewall (UFW)
- [ ] Setup database backups
- [ ] Configured log rotation
- [ ] Enabled rate limiting
- [ ] Setup monitoring
- [ ] Configured CORS properly
- [ ] Regular security updates

## Next Steps

1. Configure domain name DNS to point to server IP
2. Setup monitoring (Prometheus/Grafana)
3. Configure log aggregation (ELK stack)
4. Setup alerting (email/SMS on errors)
5. Performance testing and optimization
6. Regular backup testing

## Support

For issues and questions:
- Check logs: `docker compose -f docker-compose.prod.yml logs -f`
- Review documentation in `/docs`
- Create issue in repository

---

**Good luck with your deployment! 🚀**
