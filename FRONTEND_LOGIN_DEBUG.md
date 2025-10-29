# 🔧 Frontend Login Gagal - Troubleshooting

## ✅ Backend OK, tapi Frontend Login Gagal?

Jika curl ke backend berhasil, tapi login via frontend gagal, kemungkinan masalahnya:

### 1. ❌ **CORS Error** (Paling Sering)

**Cek di Browser Console (F12 → Console):**

Jika ada error seperti ini:
```
Access to XMLHttpRequest at 'http://localhost:3000/api/auth/login' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solusi:**
```bash
# Edit backend/.env
cd /home/azka/project_warehouse/backend
nano .env

# Pastikan ada baris ini:
CORS_ORIGIN=http://localhost:5173

# Jika akses dari network (bukan localhost), tambahkan juga:
CORS_ORIGIN=http://localhost:5173,http://10.2.4.25:5173

# Save (Ctrl+O, Enter, Ctrl+X)

# Restart backend
# Ctrl+C untuk stop npm run dev di root
# Lalu start lagi:
cd /home/azka/project_warehouse
npm run dev
```

---

### 2. ❌ **Frontend Hit URL Yang Salah**

**Cek di Browser Console (F12 → Network tab):**

Klik tombol Login, lalu cek Request URL di Network tab.

**Seharusnya:**
- Request URL: `http://localhost:3000/api/auth/login`
- Status: 200 OK

**Jika URL salah atau 404:**
```bash
# Pastikan frontend .env benar
cd /home/azka/project_warehouse/frontend
cat .env

# Harus ada:
VITE_API_URL=http://localhost:3000

# Jika tidak ada atau salah, edit:
nano .env

# Pastikan isinya:
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
VITE_APP_NAME=Warehouse Management
VITE_APP_VERSION=1.0.0

# Save (Ctrl+O, Enter, Ctrl+X)

# PENTING: Restart frontend agar .env terbaca
# Ctrl+C untuk stop npm run dev
# Start lagi:
npm run dev
```

---

### 3. ❌ **Network Access Issue**

**Jika akses dari komputer lain (bukan localhost):**

Frontend: `http://10.2.4.25:5173`
Backend perlu allow CORS dari IP ini!

```bash
# Edit backend/.env
cd /home/azka/project_warehouse/backend
nano .env

# Ubah CORS_ORIGIN menjadi:
CORS_ORIGIN=http://localhost:5173,http://10.2.4.25:5173

# Atau allow semua (development only!):
CORS_ORIGIN=*

# Save & restart
```

---

### 4. ❌ **Error Response dari Backend**

**Cek di Browser Console (F12 → Network → Response):**

Klik request yang failed, lihat Response tab.

**Error Messages:**

| Error | Penyebab | Solusi |
|-------|----------|--------|
| "Invalid credentials" | Email/password salah | Gunakan: `admin@warehouse.com` / `admin123` |
| "User not found" | Database belum seed | `npx prisma db seed` |
| 401 Unauthorized | Password salah | Cek typo, gunakan `admin123` |
| 500 Internal Server | Backend error | Cek backend logs |

---

## 🧪 Debug Step-by-Step

### Step 1: Buka Browser Console
```
Browser → F12 → Console tab
```

### Step 2: Clear Console
```
Klik icon 🚫 atau Ctrl+L untuk clear
```

### Step 3: Coba Login
```
Email: admin@warehouse.com
Password: admin123
```

### Step 4: Cek Error di Console

**Scenario A: CORS Error**
```
❌ blocked by CORS policy
→ Solusi: Set CORS_ORIGIN di backend/.env
```

**Scenario B: Network Error**
```
❌ Network Error atau Failed to fetch
→ Solusi: Backend tidak jalan, start dengan npm run dev
```

**Scenario C: 401 Unauthorized**
```
❌ Invalid credentials
→ Solusi: Cek email/password atau run npx prisma db seed
```

**Scenario D: Tidak ada error, tapi tetap gagal**
```
→ Cek Network tab, lihat request & response
```

---

## 🚀 Quick Fix (Paling Umum)

### Fix 1: CORS Issue

```bash
# Backend .env
echo "CORS_ORIGIN=http://localhost:5173,http://10.2.4.25:5173" >> backend/.env

# Restart
npm run dev
```

### Fix 2: Frontend .env Issue

```bash
# Frontend .env
cd frontend
echo "VITE_API_URL=http://localhost:3000" > .env
echo "VITE_WS_URL=ws://localhost:3000" >> .env

# Restart (PENTING!)
cd ..
npm run dev
```

---

## ✅ Test Manual

### Test 1: Backend Health
```bash
curl http://localhost:3000/health
```

### Test 2: Backend Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@warehouse.com","password":"admin123"}'
```

### Test 3: CORS Header
```bash
curl -I \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  http://localhost:3000/api/auth/login
```

**Expected Output:**
```
Access-Control-Allow-Origin: http://localhost:5173
```

Jika tidak ada header ini, CORS belum di-set!

---

## 📋 Checklist

Sebelum test login via browser:

- [ ] Backend jalan di port 3000
- [ ] Frontend jalan di port 5173
- [ ] Backend `.env` punya `CORS_ORIGIN=http://localhost:5173`
- [ ] Frontend `.env` punya `VITE_API_URL=http://localhost:3000`
- [ ] Sudah restart kedua service setelah edit `.env`
- [ ] Database sudah di-seed (`npx prisma db seed`)
- [ ] Browser console tidak ada CORS error

---

## 💡 Pro Tips

### Akses dari Network (IP 10.2.4.25)?

**Backend .env:**
```bash
CORS_ORIGIN=http://localhost:5173,http://10.2.4.25:5173
```

**Frontend .env:**
```bash
# Gunakan IP server, bukan localhost
VITE_API_URL=http://10.2.4.25:3000
```

### Clear Browser Cache

```
F12 → Network tab → Disable cache (checkbox)
Atau: Ctrl+Shift+Delete → Clear cache
```

### Restart Service Setelah Edit .env

```bash
# PENTING! Restart agar .env terbaca
Ctrl+C
npm run dev
```

---

## 🎯 Expected Behavior

**Ketika login berhasil:**

1. Browser Console: Tidak ada error
2. Network tab: POST request ke `/api/auth/login` → Status 200
3. Response: `{"status":"success","data":{"token":"..."}}`
4. Redirect ke dashboard
5. LocalStorage punya `token` dan `user`

**Cek LocalStorage:**
```
F12 → Application tab → Local Storage → http://localhost:5173
Harus ada: token, user
```

---

## 📞 Masih Gagal?

Kirimkan screenshot atau copy-paste:

1. **Browser Console** (F12 → Console tab)
2. **Network tab** (Request & Response dari `/api/auth/login`)
3. **Backend .env** (`cat backend/.env`)
4. **Frontend .env** (`cat frontend/.env`)
5. **Backend logs** (output dari `npm run dev`)

---

**Good luck!** 🚀
