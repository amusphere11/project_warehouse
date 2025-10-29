# 🚀 Login Gagal? Ikuti Langkah Ini!

## Penyebab Paling Umum: Database Belum Di-Seed! ❌

Jika Anda menjalankan `npm run dev` tapi login gagal, **hampir 100% karena database belum di-setup**.

---

## ⚠️ Error Saat Seed?

**Jika ada error "Unique constraint failed on transactionNo":**

```bash
# Reset database (hapus semua data & seed ulang)
cd backend
npx prisma migrate reset --force

# Atau baca: SEED_ERROR_FIX.md
```

---

## ✅ Solusi Cepat (5 Menit)

### Opsi 1: Automatic Setup (Recommended)

```bash
# Di root project
./quick-setup.sh
```

Script ini akan:
1. ✅ Check PostgreSQL
2. ✅ Setup backend (.env, dependencies)
3. ✅ Generate Prisma Client
4. ✅ Migrate database
5. ✅ **SEED database dengan demo users**
6. ✅ Setup frontend (.env, dependencies)
7. ✅ Test backend connection

**Demo Accounts setelah setup:**
- Admin: `admin@warehouse.com` / `admin123`
- Operator: `operator@warehouse.com` / `operator123`

---

### Opsi 2: Manual Setup

```bash
# 1. Setup PostgreSQL Database
sudo -u postgres psql
CREATE DATABASE warehouse_db;
CREATE USER warehouse_user WITH PASSWORD 'warehouse_pass';
GRANT ALL PRIVILEGES ON DATABASE warehouse_db TO warehouse_user;
\q

# 2. Setup Backend
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed  # ← PENTING! Ini yang sering terlewat

# 3. Setup Frontend
cd ../frontend
cp .env.example .env
npm install

# 4. Start Development
cd ..
npm run dev
```

---

## 🧪 Test Apakah Sudah Berhasil

### Test Backend

```bash
# Test health
curl http://localhost:3000/health

# Test login dengan demo account
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@warehouse.com","password":"admin123"}'
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "...",
      "email": "admin@warehouse.com",
      "name": "Admin User",
      "role": "ADMIN"
    }
  }
}
```

Jika dapat response seperti di atas, berarti **backend sudah OK!** ✅

### Test Frontend

1. Buka browser: `http://localhost:5173`
2. Login dengan:
   - Email: `admin@warehouse.com`
   - Password: `admin123`
3. Jika berhasil masuk dashboard, **selamat!** 🎉

---

## 🔍 Masih Gagal?

### Cek 1: Apakah PostgreSQL Jalan?

```bash
sudo systemctl status postgresql
# Jika tidak jalan:
sudo systemctl start postgresql
```

### Cek 2: Apakah Database Sudah Di-Seed?

```bash
cd backend
npx prisma studio
```

Buka Prisma Studio, cek tabel `User`. Harus ada 2 users:
- `admin@warehouse.com`
- `operator@warehouse.com`

**Jika tidak ada**, jalankan:
```bash
npx prisma db seed
```

### Cek 3: Apakah Backend Jalan?

```bash
curl http://localhost:3000/health
```

**Jika error**, start backend:
```bash
cd backend
npm run dev
```

### Cek 4: Apakah Frontend Config Benar?

```bash
cat frontend/.env
```

Harus ada:
```
VITE_API_URL=http://localhost:3000
```

**Jika tidak ada**, buat:
```bash
cd frontend
cp .env.example .env
```

---

## 📋 Checklist Troubleshooting

- [ ] PostgreSQL installed & running
- [ ] Database `warehouse_db` created
- [ ] Backend `.env` exists dengan `DATABASE_URL` yang benar
- [ ] `npx prisma migrate dev` sudah dijalankan
- [ ] **`npx prisma db seed` sudah dijalankan** ← PENTING!
- [ ] Backend running di `http://localhost:3000`
- [ ] `curl http://localhost:3000/health` return OK
- [ ] Frontend `.env` exists dengan `VITE_API_URL=http://localhost:3000`
- [ ] Frontend running di `http://localhost:5173`
- [ ] No CORS error di browser console

---

## 🎯 TL;DR - Yang Paling Sering Terlupa

```bash
cd backend
npx prisma db seed
```

**90% masalah login selesai setelah run command di atas!** ☝️

---

## 📚 Dokumentasi Lengkap

- **TROUBLESHOOTING_LOGIN.md** - Troubleshooting detail
- **TEST_CONNECTION.md** - Test connection manual
- **CONNECTION_FIXED.md** - Workflow dev vs production
- **docs/SETUP.md** - Setup lengkap dari awal

---

## 💬 Pesan Error & Solusi Cepat

| Pesan Error | Solusi |
|-------------|--------|
| "Invalid credentials" | `npx prisma db seed` |
| "Network Error" | Start backend: `npm run dev` |
| "CORS blocked" | Set `CORS_ORIGIN=http://localhost:5173` di backend `.env` |
| "Can't reach database" | `sudo systemctl start postgresql` |
| "Database does not exist" | Buat database: `CREATE DATABASE warehouse_db;` |

---

**Selamat mencoba!** 🚀

Jika masih ada masalah, cek file `TROUBLESHOOTING_LOGIN.md` untuk troubleshooting lebih detail.
