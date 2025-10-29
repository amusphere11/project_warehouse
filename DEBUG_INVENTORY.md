# 🔍 Debug Inventory - Check Console

## Issue Persists

Data masih menampilkan "[object Object]" - kemungkinan issue di:
1. ❌ Structure data dari backend
2. ❌ DataGrid tidak dapat field yang benar

---

## 🛠️ Debugging Steps

### 1. Check Browser Console (PENTING!)

Setelah deploy, buka browser Console (F12) dan lihat:

```javascript
// Saya sudah tambahkan console.log di code
// Check output nya seperti ini:

API Response: {
  status: "success",
  data: [
    {
      id: "...",
      transactionNo: "INB-20251029-0001",
      transactionDate: "2025-10-29T12:00:00.000Z",
      type: "INBOUND",
      barcode: "MAT-001",
      quantity: 100,              // ← Harusnya angka, bukan object
      unit: "kg",                 // ← Harusnya string
      initialWeight: 50,          // ← Harusnya angka
      material: {                 // ← Harusnya object dengan name
        id: "...",
        name: "Material A"
      },
      product: null,
      supplier: "Supplier X"
    }
  ]
}
```

### 2. Kemungkinan Masalah

#### A. Jika `quantity` adalah object:
```json
// ❌ Wrong
{
  "quantity": { "value": 100 }  // Object
}

// ✅ Should be
{
  "quantity": 100  // Number
}
```

**Fix Backend**: Check database schema dan seed data

#### B. Jika `material` adalah undefined/null:
```json
// ❌ Wrong
{
  "material": null,  // Tidak di-include
  "materialId": "xyz"
}

// ✅ Should be
{
  "material": {      // Include relation
    "name": "Material A"
  }
}
```

**Fix Backend**: Pastikan `include: { material: true }` ada di query

---

## 🔧 Quick Fixes

### Fix 1: Check Backend Include

File: `backend/src/controllers/inventory.controller.ts`

Pastikan ada:
```typescript
include: {
  material: true,    // ✅ Must be true
  product: true,     // ✅ Must be true
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
}
```

### Fix 2: Check Database Data

Connect ke database dan check:
```sql
-- Check if data exists
SELECT 
  id,
  transactionNo,
  transactionDate,
  type,
  barcode,
  quantity,      -- Should be number
  unit,          -- Should be string
  initialWeight, -- Should be number
  materialId,
  productId
FROM "InventoryTransaction"
LIMIT 5;

-- Check if material relation works
SELECT 
  it.transactionNo,
  it.quantity,
  m.name as materialName,
  p.name as productName
FROM "InventoryTransaction" it
LEFT JOIN "Material" m ON it.materialId = m.id
LEFT JOIN "Product" p ON it.productId = p.id
LIMIT 5;
```

### Fix 3: Check Prisma Schema

File: `backend/prisma/schema.prisma`

Pastikan:
```prisma
model InventoryTransaction {
  id              String   @id @default(uuid())
  quantity        Float    // ✅ Should be Float or Int
  unit            String?  // ✅ Should be String
  initialWeight   Float?   // ✅ Should be Float
  
  // Relations
  material        Material?  @relation(fields: [materialId], references: [id])
  product         Product?   @relation(fields: [productId], references: [id])
  materialId      String?
  productId       String?
}
```

---

## 📊 Test API Directly

Test backend API langsung:

```bash
# Di server, test API
curl -X GET "http://localhost:3000/api/inventory/transactions?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Or dengan httpie
http GET "http://localhost:3000/api/inventory/transactions?page=1&limit=5" \
  Authorization:"Bearer YOUR_TOKEN"
```

Check response structure!

---

## 🚀 Deploy dengan Debug Log

1. **Commit code dengan console.log**:
```bash
git add frontend/src/pages/Inventory.tsx
git commit -m "debug: add console log to inventory page"
git push origin main
```

2. **Deploy & Check Console**:
```bash
ssh user@server
cd /path/to/project_warehouse
git pull
cd frontend
npm run build
pm2 restart warehouse-frontend
```

3. **Open Browser Console** (F12):
   - Navigate to Inventory page
   - Check "Console" tab
   - Look for "API Response:" log
   - Copy the output

4. **Send me the console output!**

---

## 🎯 Action Items

Setelah deploy:

1. [ ] Buka Inventory page
2. [ ] Tekan F12 (Developer Tools)
3. [ ] Check tab "Console"
4. [ ] Copy output dari `console.log('API Response:', ...)`
5. [ ] Share output nya

Dari console output, saya bisa tahu exactly masalahnya di mana!

---

**Next**: Deploy → Check console → Share output! 🔍
