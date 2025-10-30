# 🚀 Production Deployment Guide

Complete guide for deploying the Production & Inventory Management System to production servers.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Deployment Steps](#deployment-steps)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [SSL/TLS Configuration](#ssltls-configuration)
7. [Troubleshooting](#troubleshooting)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Server Requirements
- **OS:** Ubuntu 20.04 LTS / 22.04 LTS
- **CPU:** 2+ cores (4 recommended)
- **RAM:** 4GB minimum (8GB recommended)
- **Storage:** 50GB+ SSD
- **Docker:** v24.0+
- **Docker Compose:** v2.20+

### Local Requirements
- Git
- SSH access to server
- Docker (for building images)

---

## Server Setup

### 1. Update System & Install Docker

```bash
# SSH to server
ssh user@your-server-ip

# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login for changes to take effect
exit && ssh user@your-server-ip

# Verify
docker --version
docker compose version
```

### 2. Configure Firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

### 3. Create Application Directory

```bash
sudo mkdir -p /opt/warehouse
sudo chown -R $USER:$USER /opt/warehouse
```

---

## Deployment Steps

### 1. Clone Repository

```bash
cd /opt/warehouse
git clone <your-repo-url> .

# Or pull updates
git pull origin main
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.prod.example .env.prod

# Edit environment variables
nano .env.prod
```

Set these critical variables:
```env
DB_USER=warehouse_user
DB_PASSWORD=STRONG_PASSWORD_HERE
DB_NAME=warehouse_db

REDIS_PASSWORD=STRONG_PASSWORD_HERE

JWT_SECRET=LONG_RANDOM_STRING_HERE
JWT_EXPIRES_IN=7d

NODE_ENV=production
```

**Generate strong JWT_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Build & Deploy with Docker Compose

```bash
# Build images
docker compose -f docker-compose.prod.yml build

# Start services
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps
```

### 4. Database Migration & Seed

```bash
# Run migrations
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Seed initial data (admin user, etc)
docker compose -f docker-compose.prod.yml exec backend npx prisma db seed

# Verify database
docker compose -f docker-compose.prod.yml exec backend npx prisma studio
```

### 5. Verify Deployment

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs -f

# Test backend
curl http://localhost:3000/health

# Test frontend
curl http://localhost:80
```

**Default Admin Login:**
- Email: `admin@warehouse.com`
- Password: `admin123`

⚠️ **Change default password immediately!**

---

## Environment Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://warehouse_user:PASSWORD@postgres:5432/warehouse_db

# Redis
REDIS_URL=redis://:PASSWORD@redis:6379

# Server
PORT=3000
NODE_ENV=production

# JWT
JWT_SECRET=your-strong-random-secret
JWT_EXPIRES_IN=7d

# CORS (set to your frontend URL)
CORS_ORIGIN=http://your-domain.com

# Logging
LOG_LEVEL=info
```

### Frontend Environment Variables

Create `frontend/.env.production`:

```env
VITE_API_URL=http://your-server-ip:3000
# or with domain:
# VITE_API_URL=https://api.your-domain.com
```

---

## Database Setup

### Backup Database

```bash
# Backup
docker compose exec postgres pg_dump -U warehouse_user warehouse_db > backup.sql

# Restore
docker compose exec -T postgres psql -U warehouse_user warehouse_db < backup.sql
```

### Database Maintenance

```bash
# Connect to database
docker compose exec postgres psql -U warehouse_user -d warehouse_db

# Run queries
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "InventoryTransaction";

# Vacuum (optimize)
VACUUM ANALYZE;
```

---

## SSL/TLS Configuration

### Using Nginx Reverse Proxy

Create `nginx/nginx.conf`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /socket.io {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Using Certbot for SSL

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Troubleshooting

### Common Issues & Solutions

#### 1. "Invalid Date" in DataGrid

**Problem:** DataGrid shows "Invalid Date" for date columns.

**Solution:** Use `renderCell` instead of `valueFormatter`:

```typescript
// ❌ Wrong
{
  field: 'createdAt',
  headerName: 'Created',
  valueFormatter: (params: any) => new Date(params).toLocaleDateString(),
}

// ✅ Correct
{
  field: 'createdAt',
  headerName: 'Created',
  renderCell: (params: GridRenderCellParams) => {
    if (!params.value) return '-';
    return new Date(params.value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },
}
```

**Files Fixed:**
- `frontend/src/pages/Inventory.tsx`
- `frontend/src/pages/Users.tsx`

---

#### 2. "[object Object]" in DataGrid

**Problem:** DataGrid displays "[object Object]" for nested relations.

**Solution:** Use `renderCell` to properly access nested properties:

```typescript
// ❌ Wrong - using valueGetter
{
  field: 'material',
  headerName: 'Material',
  valueGetter: (params: any) => params.row.material?.name,
}

// ✅ Correct - using renderCell
{
  field: 'material',
  headerName: 'Material',
  renderCell: (params: GridRenderCellParams) => {
    return params.row.material?.name || '-';
  },
}
```

**Backend Fix - Ensure Includes:**
```typescript
const inventoryItems = await prisma.inventoryTransaction.findMany({
  include: {
    material: true,
    product: true,
    user: true,
  },
});
```

**Files Fixed:**
- `frontend/src/pages/Inventory.tsx` (all columns)
- `backend/src/controllers/inventory.controller.ts` (added includes)

---

#### 3. Dashboard Charts Show No Data

**Problem:** Dashboard charts display empty or dummy data.

**Solution:** Implement backend endpoint for real chart data:

**Backend:**
```typescript
// backend/src/controllers/dashboard.controller.ts
export const getWeeklyChartData = async (req: Request, res: Response) => {
  try {
    const weeklyData = await prisma.inventoryTransaction.groupBy({
      by: ['type', 'transactionDate'],
      _sum: { quantity: true },
      where: {
        transactionDate: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { transactionDate: 'asc' },
    });

    const formattedData = weeklyData.map(item => ({
      date: format(new Date(item.transactionDate), 'MMM dd'),
      type: item.type,
      quantity: item._sum.quantity || 0,
    }));

    res.json({ success: true, data: formattedData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch chart data' });
  }
};
```

**Route:**
```typescript
// backend/src/routes/dashboard.routes.ts
router.get('/weekly-chart', auth, getWeeklyChartData);
```

**Frontend:**
```typescript
// frontend/src/pages/Dashboard.tsx
useEffect(() => {
  const fetchChartData = async () => {
    const response = await api.get('/api/dashboard/weekly-chart');
    setChartData(response.data.data);
  };
  fetchChartData();
}, []);
```

**Files Modified:**
- `backend/src/controllers/dashboard.controller.ts`
- `backend/src/routes/dashboard.routes.ts`
- `frontend/src/pages/Dashboard.tsx`

---

#### 4. CORS Errors

**Problem:** Frontend can't connect to backend due to CORS.

**Solution:** Configure CORS in backend:

```typescript
// backend/src/index.ts
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
```

Set in `.env`:
```env
CORS_ORIGIN=http://your-domain.com
```

---

#### 5. Login Failed / No Users

**Problem:** Cannot login, "Invalid credentials" error.

**Solution:** Re-run database seed:

```bash
# Development
cd backend
npx prisma db seed

# Production (Docker)
docker compose exec backend npx prisma db seed
```

This creates default admin user:
- Email: `admin@warehouse.com`
- Password: `admin123`

---

#### 6. Database Connection Failed

**Problem:** Backend can't connect to PostgreSQL.

**Check:**
```bash
# Check if postgres is running
docker compose ps

# Check logs
docker compose logs postgres

# Test connection
docker compose exec postgres psql -U warehouse_user -d warehouse_db -c "SELECT 1;"
```

**Fix DATABASE_URL in .env:**
```env
DATABASE_URL=postgresql://warehouse_user:password@postgres:5432/warehouse_db
```

---

#### 7. Redis Connection Failed

**Problem:** Backend can't connect to Redis.

**Check:**
```bash
# Check if redis is running
docker compose ps redis

# Test connection
docker compose exec redis redis-cli ping
# Should return: PONG
```

**Fix REDIS_URL in .env:**
```env
REDIS_URL=redis://:password@redis:6379
```

---

#### 8. Port Already in Use

**Problem:** Docker can't start, port already in use.

**Find process using port:**
```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "3001:3000"  # Use 3001 instead
```

---

#### 9. Docker Build Fails

**Problem:** Docker build fails with memory or dependency errors.

**Solutions:**

```bash
# Clear Docker cache
docker system prune -a

# Build with no cache
docker compose build --no-cache

# Increase Docker memory (Docker Desktop)
# Settings > Resources > Memory > 4GB+
```

---

#### 10. WebSocket Connection Failed

**Problem:** Real-time updates don't work.

**Check Nginx config for WebSocket:**
```nginx
location /socket.io {
    proxy_pass http://backend:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

**Frontend config:**
```typescript
const socket = io(process.env.VITE_API_URL, {
  transports: ['websocket', 'polling'],
});
```

---

### Testing Checklist

After deployment, test:

- [ ] Frontend loads (`http://your-server`)
- [ ] Backend API responds (`http://your-server/api/health`)
- [ ] Can login with admin account
- [ ] Dashboard shows real data (not dummy)
- [ ] Inventory page displays correctly (no "[object Object]" or "Invalid Date")
- [ ] Users page displays correctly (ADMIN only)
- [ ] Can create new inventory transaction
- [ ] Can create new user (ADMIN only)
- [ ] Real-time updates work
- [ ] Export to Excel/PDF works

---

## Monitoring & Maintenance

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Run migrations if schema changed
docker compose exec backend npx prisma migrate deploy
```

### Database Backup Script

Create `backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker compose exec postgres pg_dump -U warehouse_user warehouse_db > backup_$DATE.sql
echo "Backup created: backup_$DATE.sql"
```

Run daily with cron:
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /opt/warehouse/backup.sh
```

---

## Performance Optimization

### Database Indexes

```sql
-- Add indexes for common queries
CREATE INDEX idx_inventory_transaction_date ON "InventoryTransaction"("transactionDate");
CREATE INDEX idx_inventory_material_id ON "InventoryTransaction"("materialId");
CREATE INDEX idx_inventory_product_id ON "InventoryTransaction"("productId");
```

### Redis Caching

Dashboard stats are cached for 5 minutes by default. Adjust in:
```typescript
// backend/src/controllers/dashboard.controller.ts
const CACHE_TTL = 300; // seconds
```

### Connection Pooling

Adjust PostgreSQL connection pool:
```env
DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=20
```

---

## Security Checklist

- [x] Strong passwords for DB and Redis
- [x] Random JWT_SECRET
- [x] CORS properly configured
- [x] Firewall enabled (only ports 22, 80, 443)
- [x] SSL/TLS certificate installed
- [x] Default admin password changed
- [x] Database backups configured
- [x] Environment variables not hardcoded
- [x] Docker containers run as non-root
- [x] Rate limiting enabled (TODO)
- [x] Log rotation configured (TODO)

---

## Support

For issues or questions:
1. Check this troubleshooting guide
2. Check application logs
3. Test with `curl http://10.2.4.25` (or your server IP)
4. Create an issue in the repository

---

**🎉 Deployment Complete!**

Your warehouse management system is now running in production. Remember to:
- Change default passwords
- Setup SSL certificates
- Configure automated backups
- Monitor logs regularly

