# 🔧 Quick Fix: Seed Error

## ✅ Solusi untuk Error "Unique constraint failed on transactionNo"

Error ini terjadi karena seed script mencoba membuat data yang sudah ada di database.

### Solusi 1: Reset Database (Recommended untuk Development)

```bash
# Di folder backend
cd /home/azka/project_warehouse/backend

# Reset database (hapus semua data & migrate ulang)
npx prisma migrate reset

# Seed akan otomatis jalan setelah reset
# Database sekarang bersih dengan data demo yang fresh!
```

### Solusi 2: Hapus Data Lama Manual

```bash
# Masuk ke PostgreSQL
sudo -u postgres psql warehouse_db

# Hapus semua data (hati-hati!)
TRUNCATE TABLE "InventoryTransaction" CASCADE;
TRUNCATE TABLE "StockSummary" CASCADE;
TRUNCATE TABLE "Product" CASCADE;
TRUNCATE TABLE "Material" CASCADE;
TRUNCATE TABLE "User" CASCADE;

# Keluar
\q

# Jalankan seed lagi
cd /home/azka/project_warehouse/backend
npx prisma db seed
```

### Solusi 3: Skip Seed (Jika Sudah Ada Data)

Jika database sudah memiliki user admin & operator, Anda bisa langsung:

```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@warehouse.com","password":"admin123"}'

# Jika berhasil dapat token, berarti data sudah OK!
# Langsung start aplikasi
cd /home/azka/project_warehouse
npm run dev
```

---

## 🚀 Recommended: Reset & Fresh Start

Untuk development, cara paling bersih:

```bash
cd /home/azka/project_warehouse/backend

# Reset database (hapus semua, migrate, dan seed otomatis)
npx prisma migrate reset --force

# Atau jika prompt konfirmasi:
npx prisma migrate reset
# Ketik: yes

# Selesai! Database fresh dengan demo data
```

---

## ✅ Verify Seed Berhasil

```bash
# Test login endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@warehouse.com","password":"admin123"}'
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "email": "admin@warehouse.com",
      "name": "Admin User",
      "role": "ADMIN"
    }
  }
}
```

Jika dapat response seperti di atas → **Seed berhasil!** ✅

---

## 📝 Demo Accounts

Setelah seed berhasil, gunakan:

- **Admin:** `admin@warehouse.com` / `admin123`
- **Operator:** `operator@warehouse.com` / `operator123`

---

## 🎯 Next: Start Development

```bash
cd /home/azka/project_warehouse
npm run dev
```

**Akses:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Login: `admin@warehouse.com` / `admin123`

---

## 💡 Catatan

File `seed.ts` sudah diupdate untuk menggunakan `upsert` (akan di-commit nanti).

Untuk saat ini, gunakan **Solusi 1** (Reset Database) untuk development.
