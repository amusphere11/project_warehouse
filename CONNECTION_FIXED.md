# ✅ SOLUSI: Frontend ↔ Backend Connection

## 🔍 Masalah yang Diselesaikan

**Sebelumnya:**
- User bingung bagaimana frontend hit backend
- User ragu apakah harus pakai nginx untuk development
- Tidak jelas perbedaan workflow dev vs production

**Sekarang:**
- ✅ Development: Frontend hit backend langsung tanpa nginx
- ✅ Production: Frontend hit backend via nginx reverse proxy
- ✅ Dokumentasi lengkap untuk testing connection
- ✅ File `.env` dan `.env.production` yang tepat

---

## 📁 File yang Ditambahkan/Diupdate

### 1. **frontend/.env** (Development)
```bash
VITE_API_URL=http://localhost:3000  # Hit backend langsung
VITE_WS_URL=ws://localhost:3000
```

### 2. **frontend/.env.production** (Production)
```bash
VITE_API_URL=/api  # Via nginx reverse proxy
VITE_WS_URL=ws://localhost:3000
```

### 3. **TEST_CONNECTION.md**
Panduan lengkap untuk:
- Test development mode
- Test production mode
- Troubleshooting CORS, 502, connection error
- Quick commands

---

## 🚀 Cara Menggunakan

### Development (Tanpa Nginx)

**Opsi 1: Manual (2 Terminal)**
```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend  
cd frontend
npm install
npm run dev
```

**Opsi 2: Concurrently (1 Terminal)**
```bash
# Di root project
npm install
npm run dev
```

**Akses:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Frontend akan hit backend langsung via axios

---

### Production (Dengan Nginx)

**1. Build semua**
```bash
npm run build
```

**2. Opsi A: PM2 (Recommended)**
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

**2. Opsi B: Manual**
```bash
# Start backend
cd backend
node dist/index.js

# Setup nginx (one time)
sudo cp nginx/nginx.conf /etc/nginx/sites-available/warehouse
sudo ln -s /etc/nginx/sites-available/warehouse /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Akses:**
- Semua via nginx: http://your-server-ip
- Nginx serve frontend static dari `/dist`
- Nginx proxy `/api/*` ke backend `http://localhost:3000`

---

## 🧪 Test Connection

### Test Backend
```bash
# Development
curl http://localhost:3000/health

# Production (via nginx)
curl http://localhost/api/health
```

Expected response:
```json
{
  "status": "OK",
  "uptime": 123.45,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test Frontend
1. Buka browser
2. Development: `http://localhost:5173`
3. Production: `http://localhost`
4. Coba login atau hit API
5. Buka Console (F12), pastikan tidak ada CORS error

---

## 🔧 Troubleshooting

### CORS Error (Development)

**Gejala:**
```
Access to XMLHttpRequest at 'http://localhost:3000/api/auth/login' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solusi:**
```bash
# 1. Pastikan backend .env punya:
CORS_ORIGIN=http://localhost:5173

# 2. Restart backend
cd backend
npm run dev
```

---

### 502 Bad Gateway (Production)

**Gejala:**
```
502 Bad Gateway
nginx/1.x.x
```

**Solusi:**
```bash
# 1. Cek backend jalan
pm2 list
# atau
netstat -tlnp | grep 3000

# 2. Restart backend
pm2 restart backend

# 3. Cek nginx config
sudo nginx -t

# 4. Restart nginx
sudo systemctl restart nginx
```

---

### Frontend tidak bisa hit backend

**Development:**
```bash
# 1. Pastikan backend jalan
curl http://localhost:3000/health

# 2. Pastikan frontend .env benar
cat frontend/.env
# Harus: VITE_API_URL=http://localhost:3000

# 3. Restart frontend
cd frontend
npm run dev
```

**Production:**
```bash
# 1. Pastikan backend jalan
curl http://localhost:3000/health

# 2. Pastikan nginx proxy benar
curl http://localhost/api/health

# 3. Cek frontend build punya .env.production
cat frontend/.env.production
# Harus: VITE_API_URL=/api

# 4. Rebuild frontend
cd frontend
npm run build

# 5. Restart nginx
sudo systemctl restart nginx
```

---

## 📊 Workflow Summary

```
DEVELOPMENT MODE
================
┌──────────────┐          ┌──────────────┐
│  Frontend    │ -------> │   Backend    │
│ :5173        │  axios   │   :3000      │
└──────────────┘          └──────────────┘
      │                         │
      └─── http://localhost:3000/api/...


PRODUCTION MODE
===============
┌─────────────┐
│   Browser   │
│             │
└──────┬──────┘
       │
       v
┌─────────────┐
│   Nginx     │
│   :80       │
└──────┬──────┘
       │
       ├── / ---------> Frontend Static (dist/)
       │
       └── /api/* ----> Backend :3000
```

---

## ✅ Checklist Deployment

### Development
- [ ] Backend `.env` exists dengan `CORS_ORIGIN=http://localhost:5173`
- [ ] Frontend `.env` exists dengan `VITE_API_URL=http://localhost:3000`
- [ ] `npm run dev` jalan tanpa error
- [ ] Browser bisa akses `http://localhost:5173`
- [ ] Console tidak ada CORS error

### Production
- [ ] Backend `.env` production ready
- [ ] Frontend `.env.production` dengan `VITE_API_URL=/api`
- [ ] `npm run build` success
- [ ] Nginx config di `/etc/nginx/sites-enabled/`
- [ ] PM2 jalan: `pm2 list`
- [ ] Browser bisa akses via nginx
- [ ] API calls work via `/api/*`

---

## 📖 Dokumentasi Lengkap

- **TEST_CONNECTION.md** - Testing & troubleshooting
- **RUN_BOTH.md** - Cara run dev & prod mode
- **docs/PRODUCTION_DEPLOY.md** - Best practice deployment
- **docs/SETUP.md** - Setup awal project
- **README.md** - Overview project

---

## 🎯 Next Steps

1. **Development:**
   ```bash
   npm run dev
   ```
   
2. **Test connection** sesuai `TEST_CONNECTION.md`

3. **Siap production?**
   ```bash
   npm run build
   pm2 start ecosystem.config.js --env production
   ```

4. **Push ke GitLab:**
   ```bash
   git add .
   git commit -m "fix: frontend backend connection workflow"
   git push origin main
   ```

---

**Sekarang user sudah punya workflow yang jelas untuk dev dan production!** 🎉
