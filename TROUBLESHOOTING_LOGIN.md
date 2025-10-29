# 🔧 Troubleshooting Login Gagal

## Kemungkinan Penyebab Login Gagal

### 1. ❌ Database Belum Ada / Belum Di-Seed

**Gejala:**
- Login selalu gagal dengan error "Invalid credentials"
- Tidak ada error di console backend

**Solusi:**
```bash
# 1. Setup database PostgreSQL
# Pastikan PostgreSQL sudah jalan
sudo systemctl status postgresql

# 2. Buat database
sudo -u postgres psql
CREATE DATABASE warehouse_db;
CREATE USER warehouse_user WITH PASSWORD 'warehouse_pass';
GRANT ALL PRIVILEGES ON DATABASE warehouse_db TO warehouse_user;
\q

# 3. Setup Prisma & Migrate
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init

# 4. Seed database (PENTING!)
npx prisma db seed
# atau
npm run seed

# 5. Restart backend
npm run dev
```

**Test User setelah seed:**
- Email: `admin@warehouse.com`
- Password: `admin123`

---

### 2. ❌ Backend Tidak Jalan

**Gejala:**
- Error: "Network Error" atau "Failed to fetch"
- Console menunjukkan error connect ke `http://localhost:3000`

**Solusi:**
```bash
# Cek apakah backend jalan
curl http://localhost:3000/health

# Jika tidak jalan, cek port 3000
lsof -i:3000

# Start backend
cd backend
npm run dev
```

---

### 3. ❌ CORS Error

**Gejala:**
- Console error: "has been blocked by CORS policy"
- Request ke backend terblokir

**Solusi:**
```bash
# 1. Cek backend .env
cd backend
cat .env

# Pastikan ada:
CORS_ORIGIN=http://localhost:5173

# 2. Jika tidak ada, buat file .env
cat > .env << EOF
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://warehouse_user:warehouse_pass@localhost:5432/warehouse_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
EOF

# 3. Restart backend
npm run dev
```

---

### 4. ❌ Frontend Hit URL Yang Salah

**Gejala:**
- Request ke URL yang salah (404)
- API endpoint tidak ditemukan

**Solusi:**
```bash
# 1. Cek frontend .env
cd frontend
cat .env

# Pastikan ada:
VITE_API_URL=http://localhost:3000

# 2. Jika tidak ada, copy dari example
cp .env.example .env

# 3. Atau buat manual
cat > .env << EOF
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
VITE_APP_NAME=Warehouse Management
VITE_APP_VERSION=1.0.0
EOF

# 4. Restart frontend
npm run dev
```

---

### 5. ❌ PostgreSQL Tidak Jalan

**Gejala:**
- Backend error: "Can't reach database server"
- Error connection refused

**Solusi:**
```bash
# Install PostgreSQL (jika belum)
# Ubuntu/Debian:
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS:
brew install postgresql
brew services start postgresql

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Cek status
sudo systemctl status postgresql
```

---

### 6. ❌ Redis Tidak Jalan (Opsional)

**Gejala:**
- Backend warning tentang Redis
- Queue tidak jalan

**Solusi:**
```bash
# Install Redis (opsional, tidak wajib untuk login)
# Ubuntu/Debian:
sudo apt install redis-server

# macOS:
brew install redis
brew services start redis

# Start Redis
sudo systemctl start redis
sudo systemctl enable redis
```

---

## 📋 Checklist Lengkap

Jalankan langkah ini secara berurutan:

```bash
# ===== 1. CEK POSTGRESQL =====
sudo systemctl status postgresql
# Jika belum jalan: sudo systemctl start postgresql

# ===== 2. SETUP DATABASE =====
cd backend

# Buat .env jika belum ada
cp .env.example .env

# Edit .env, pastikan DATABASE_URL benar
# DATABASE_URL=postgresql://warehouse_user:warehouse_pass@localhost:5432/warehouse_db

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Migrate database
npx prisma migrate dev --name init

# SEED DATABASE (PENTING!)
npx prisma db seed

# ===== 3. START BACKEND =====
npm run dev

# Test backend di terminal lain
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@warehouse.com","password":"admin123"}'

# ===== 4. SETUP FRONTEND =====
cd ../frontend

# Buat .env jika belum ada
cp .env.example .env

# Install dependencies
npm install

# Start frontend
npm run dev

# ===== 5. TEST LOGIN =====
# Buka browser: http://localhost:5173
# Email: admin@warehouse.com
# Password: admin123
```

---

## 🧪 Test Manual via cURL

```bash
# 1. Test backend health
curl http://localhost:3000/health

# 2. Test login endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@warehouse.com",
    "password": "admin123"
  }'

# Expected response:
# {
#   "status": "success",
#   "data": {
#     "token": "eyJhbGc...",
#     "user": {
#       "id": "...",
#       "email": "admin@warehouse.com",
#       "name": "Admin User",
#       "role": "ADMIN"
#     }
#   }
# }
```

---

## 🔍 Debug Mode

Buka browser Console (F12) dan cek:

### Network Tab
- Cek request ke `/api/auth/login`
- Status code: 200 = success, 401 = wrong credentials, 500 = server error
- Response body untuk lihat error message

### Console Tab
- Lihat error messages
- Cek apakah ada CORS error
- Cek apakah fetch/axios berhasil

### Application Tab
- Cek localStorage apakah token tersimpan setelah login berhasil

---

## 📝 Error Messages & Solusi

| Error Message | Penyebab | Solusi |
|---------------|----------|---------|
| "Invalid credentials" | User tidak ada / password salah | Run `npx prisma db seed` |
| "Network Error" | Backend tidak jalan | Start backend: `npm run dev` |
| "CORS policy" | CORS tidak configured | Set `CORS_ORIGIN=http://localhost:5173` |
| "Can't reach database" | PostgreSQL tidak jalan | `sudo systemctl start postgresql` |
| "404 Not Found" | URL salah | Cek `VITE_API_URL=http://localhost:3000` |
| "500 Internal Server Error" | Database error | Cek logs backend |

---

## 🎯 Quick Fix (Paling Sering)

**90% masalah login karena database belum di-seed!**

```bash
cd backend
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Lalu test:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@warehouse.com","password":"admin123"}'
```

Jika dapat token, berarti backend OK! Masalah ada di frontend.

---

## 📞 Masih Gagal?

Cek backend logs:
```bash
cd backend
npm run dev
# Lihat output saat login
```

Cek frontend console:
```
Browser > F12 > Console & Network tab
```

Kirimkan error message lengkap untuk troubleshooting lebih lanjut.
