# 🚀 Production Deployment dengan Build + Nginx

## Mengapa Harus Build + Nginx?

### ❌ **Masalah tanpa Build:**
1. **CORS Issues** - Frontend (port 5173) tidak bisa hit Backend (port 3000)
2. **Performance** - Development mode lambat
3. **Security** - Source code exposed
4. **Resource** - Menggunakan lebih banyak memory

### ✅ **Dengan Build + Nginx:**
1. **No CORS** - Semua di satu domain
2. **Fast** - Optimized & minified
3. **Secure** - Source code tidak exposed
4. **Efficient** - Static files served langsung oleh nginx

---

## 📋 **Arsitektur Production**

```
Browser
   │
   ├─→ http://your-server/             → Nginx → Frontend (static files)
   ├─→ http://your-server/api/...      → Nginx → Backend API (Node.js)
   └─→ http://your-server/socket.io/   → Nginx → WebSocket
```

**Semua di port 80 (atau 443 untuk HTTPS), tidak ada CORS issues!**

---

## 🎯 **Cara Deploy Production**

### **Option 1: Build Manual + Nginx System**

#### Step 1: Build Application

```bash
# Di server
cd /home/azka/project_warehouse

# Make script executable
chmod +x build-production.sh

# Build backend & frontend
./build-production.sh
```

Output:
- Backend built: `backend/dist/`
- Frontend built: `dist/frontend/`

#### Step 2: Install Nginx

```bash
# Install nginx
sudo apt-get update
sudo apt-get install nginx -y
```

#### Step 3: Configure Nginx

```bash
# Copy nginx config
sudo cp nginx-standalone.conf /etc/nginx/sites-available/warehouse

# Create symlink
sudo ln -s /etc/nginx/sites-available/warehouse /etc/nginx/sites-enabled/

# Remove default
sudo rm /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

#### Step 4: Start Backend with PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start backend
pm2 start ecosystem.config.js --env production --only warehouse-backend

# Save PM2 config
pm2 save

# Auto-start on boot
pm2 startup
```

#### Step 5: Access Application

```
http://10.2.4.25/          → Frontend
http://10.2.4.25/api/...   → Backend API
http://10.2.4.25/api-docs  → Swagger Docs
```

---

### **Option 2: Docker Compose (Recommended)**

```bash
cd /home/azka/project_warehouse

# Build images
docker build -t warehouse-backend:latest backend/
docker build -t warehouse-frontend:latest frontend/

# Deploy
docker compose -f docker-compose.prod.yml up -d

# Check logs
docker compose -f docker-compose.prod.yml logs -f
```

---

### **Option 3: Build + PM2 Standalone (Tanpa Docker)**

#### Step 1: Build

```bash
# Build backend
cd /home/azka/project_warehouse/backend
npm ci
npm run build

# Build frontend
cd ../frontend
npm ci
npm run build
```

#### Step 2: Setup Nginx

Buat file `/etc/nginx/sites-available/warehouse`:

```nginx
server {
    listen 80;
    server_name 10.2.4.25;  # Ganti dengan IP/domain Anda

    # Frontend static files
    location / {
        root /home/azka/project_warehouse/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
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
    }

    # Health & Docs
    location /health {
        proxy_pass http://localhost:3000;
    }

    location /api-docs {
        proxy_pass http://localhost:3000;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/warehouse /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 3: Start Backend dengan PM2

```bash
cd /home/azka/project_warehouse

# Start only backend
pm2 start backend/dist/index.js --name warehouse-backend

# Or use ecosystem
pm2 start ecosystem.config.js --env production --only warehouse-backend

# Save & startup
pm2 save
pm2 startup
```

---

## 🔧 **Update Frontend Environment untuk Production**

Edit `frontend/.env.production`:

```bash
# Production API URL (sama dengan domain nginx)
VITE_API_URL=http://10.2.4.25
VITE_WS_URL=ws://10.2.4.25
VITE_APP_NAME=Warehouse Management
VITE_APP_VERSION=1.0.0
```

---

## 📝 **PM2 Commands**

```bash
# Start
pm2 start ecosystem.config.js --env production

# Status
pm2 status

# Logs
pm2 logs warehouse-backend

# Restart
pm2 restart warehouse-backend

# Stop
pm2 stop warehouse-backend

# Delete
pm2 delete warehouse-backend

# Monitor
pm2 monit
```

---

## 🔍 **Troubleshooting**

### Frontend tidak bisa hit Backend

**Problem:** CORS error atau connection refused

**Solution:**
```bash
# Check nginx running
sudo systemctl status nginx

# Check nginx config
sudo nginx -t

# Check backend running
pm2 status
curl http://localhost:3000/health

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Port 80 sudah digunakan

```bash
# Check what's using port 80
sudo lsof -i :80

# Stop apache if installed
sudo systemctl stop apache2
sudo systemctl disable apache2
```

### Permission denied for nginx

```bash
# Fix permissions
sudo chown -R www-data:www-data /home/azka/project_warehouse/frontend/dist
sudo chmod -R 755 /home/azka/project_warehouse/frontend/dist
```

---

## ✅ **Production Checklist**

- [ ] Build backend (`npm run build`)
- [ ] Build frontend (`npm run build`)
- [ ] Nginx installed & configured
- [ ] Backend started dengan PM2
- [ ] Nginx serving frontend static files
- [ ] Nginx proxy `/api` ke backend
- [ ] Environment variables set
- [ ] Database migrated
- [ ] SSL certificate installed (optional)
- [ ] Firewall configured (port 80, 443)
- [ ] PM2 startup configured
- [ ] Backup script configured

---

## 🎯 **Kesimpulan**

**Ya, Anda HARUS menggunakan:**
1. ✅ **Build** (npm run build) - untuk optimize code
2. ✅ **Nginx** - untuk serve static files & reverse proxy
3. ✅ **PM2** - untuk process management backend

**Jangan gunakan `npm run dev` di production!**

---

## 🚀 **Quick Deploy (Copy-Paste)**

```bash
# 1. Build
cd /home/azka/project_warehouse
chmod +x build-production.sh
./build-production.sh

# 2. Install & setup nginx
sudo apt-get install nginx -y
sudo tee /etc/nginx/sites-available/warehouse > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;
    
    location / {
        root /home/azka/project_warehouse/frontend/dist;
        try_files $uri /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
    }
    
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/warehouse /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# 3. Start backend with PM2
sudo npm install -g pm2
cd backend
pm2 start dist/index.js --name warehouse-backend
pm2 save
pm2 startup

# 4. Done! Access http://your-server-ip
```

---

**Sekarang frontend bisa hit backend tanpa CORS issues! 🎉**
