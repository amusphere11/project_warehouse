# Test Connection - Frontend ↔ Backend

## Development Mode (Tanpa Nginx)

### 1. Start Backend
```bash
cd backend
npm install
npm run dev
```
Backend akan jalan di: `http://localhost:3000`

### 2. Start Frontend (terminal baru)
```bash
cd frontend
npm install
npm run dev
```
Frontend akan jalan di: `http://localhost:5173`

### 3. Test Connection

#### A. Test Backend Health
```bash
curl http://localhost:3000/health
```
Expected response:
```json
{
  "status": "OK",
  "uptime": 123.45,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### B. Test Frontend Hit Backend
1. Buka browser: `http://localhost:5173`
2. Buka Console (F12)
3. Cek apakah frontend bisa hit backend tanpa CORS error

**Jika ada CORS error:**
- Pastikan backend `.env` punya: `CORS_ORIGIN=http://localhost:5173`
- Restart backend

---

## Production Mode (Dengan Nginx)

### 1. Build Backend & Frontend
```bash
# Di root project
npm run build
```
Atau manual:
```bash
# Build backend
cd backend
npm run build

# Build frontend
cd ../frontend
npm run build
```

### 2. Start Backend (Production)
```bash
cd backend
npm start
# atau
node dist/index.js
```

### 3. Setup Nginx
```bash
# Copy nginx config
sudo cp nginx/nginx.conf /etc/nginx/sites-available/warehouse
sudo ln -s /etc/nginx/sites-available/warehouse /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Test Production
```bash
# Test nginx serve frontend
curl http://localhost

# Test nginx proxy ke backend
curl http://localhost/api/health

# Test via browser
open http://localhost
```

---

## Menggunakan PM2 (Recommended untuk Production)

### 1. Build semua
```bash
npm run build
```

### 2. Start dengan PM2
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 3. Monitor
```bash
pm2 list
pm2 logs
pm2 monit
```

---

## Troubleshooting

### Frontend tidak bisa hit backend

**Development Mode:**
1. Cek backend jalan: `curl http://localhost:3000/health`
2. Cek CORS di backend `.env`: `CORS_ORIGIN=http://localhost:5173`
3. Cek frontend `.env`: `VITE_API_URL=http://localhost:3000`
4. Restart kedua service

**Production Mode:**
1. Cek backend jalan: `curl http://localhost:3000/health`
2. Cek nginx config: `/api` harus proxy ke `http://localhost:3000`
3. Cek frontend build punya `.env.production`: `VITE_API_URL=/api`
4. Test nginx: `curl http://localhost/api/health`

### CORS Error

Backend harus punya di `.env`:
```
CORS_ORIGIN=http://localhost:5173
```

Atau untuk production (multi domain):
```
CORS_ORIGIN=http://localhost:5173,http://your-domain.com
```

### 502 Bad Gateway (Nginx)

Backend tidak jalan atau port salah:
```bash
# Cek backend jalan
ps aux | grep node
netstat -tlnp | grep 3000

# Restart backend
pm2 restart backend
```

---

## Quick Commands

### Development (Manual)
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Development (Concurrently)
```bash
# Di root
npm run dev
```

### Production (PM2)
```bash
npm run build
pm2 start ecosystem.config.js --env production
```

### Stop All
```bash
pm2 stop all
# atau
./stop.sh
```
