# ✅ CORS Multiple Values Error - FIXED!

## 🔧 Error yang Diperbaiki

```
The 'Access-Control-Allow-Origin' header contains multiple values 
'http://localhost:5173,http://10.2.4.25:5173', but only one is allowed.
```

## 📝 Penjelasan Masalah

Backend mengirim **seluruh string** `"http://localhost:5173,http://10.2.4.25:5173"` sebagai satu value di CORS header, padahal seharusnya **hanya origin yang match** yang dikirim.

## ✅ Solusi

File `backend/src/index.ts` sudah diperbaiki untuk:
1. Parse `CORS_ORIGIN` dari `.env` (split by comma)
2. Return hanya origin yang match dengan request
3. Support multiple origins dengan benar

## 🚀 Cara Implementasi di Server

### 1. Pull update terbaru

```bash
cd /home/azka/project_warehouse
git pull origin main
```

### 2. Edit backend .env

```bash
nano /home/azka/project_warehouse/backend/.env
```

**Tambahkan/edit baris ini:**
```bash
CORS_ORIGIN=http://localhost:5173,http://10.2.4.25:5173
```

**Atau untuk allow semua (development only):**
```bash
CORS_ORIGIN=*
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

### 3. Restart backend

```bash
cd /home/azka/project_warehouse
# Ctrl+C untuk stop npm run dev
npm run dev
```

### 4. Test login

Buka browser: `http://10.2.4.25:5173`

Login dengan:
- Email: `admin@warehouse.com`
- Password: `admin123`

**Expected:** Login berhasil, redirect ke dashboard! ✅

---

## 🧪 Verify CORS Config

```bash
# Test CORS header
curl -I \
  -H "Origin: http://10.2.4.25:5173" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS \
  http://10.2.4.25:3000/api/auth/login
```

**Expected output:**
```
Access-Control-Allow-Origin: http://10.2.4.25:5173
```

Sekarang hanya **satu origin** yang di-return (yang match dengan request).

---

## 📋 Backend .env Configuration

### Development (Local + Network)
```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://warehouse_user:warehouse_pass@localhost:5432/warehouse_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173,http://10.2.4.25:5173
```

### Development (Allow All - Quick Testing)
```bash
CORS_ORIGIN=*
```

### Production (Specific Domain)
```bash
CORS_ORIGIN=https://warehouse.yourdomain.com
```

---

## 📁 Files Updated

1. **backend/src/index.ts**
   - Updated CORS config untuk handle multiple origins
   - Parse `CORS_ORIGIN` dengan `.split(',')` 
   - Return hanya origin yang match

2. **CORS_FIXED.md** (file ini)
   - Dokumentasi error & solusi

---

## 🎯 Summary

**Before:**
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN, // "http://localhost:5173,http://10.2.4.25:5173"
  // ❌ Error: Multiple values in one string
}));
```

**After:**
```javascript
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true); // ✅ Allow
    } else {
      callback(new Error('Not allowed by CORS')); // ❌ Deny
    }
  },
  credentials: true,
}));
```

**Result:**
- ✅ Multiple origins supported
- ✅ Only matching origin returned in header
- ✅ No more CORS error!

---

**Selamat! CORS error sudah fixed!** 🎉

Login sekarang seharusnya berhasil tanpa error.
