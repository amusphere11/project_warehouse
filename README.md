# 📦 Production & Inventory Management System

Sistema manajemen produksi dan inventori dengan kemampuan scanning barcode, tracking real-time, dan reporting untuk warehouse yang memproses **4000+ boxes per hari**.

> **📖 Baca dokumentasi lengkap:**
> - 🇮🇩 **[RINGKASAN LENGKAP (Bahasa Indonesia)](./docs/RINGKASAN_LENGKAP.md)** ← Baca ini dulu!
> - 🏗️ [Architecture & Tech Stack](./docs/ARCHITECTURE.md)
> - 📋 [Business Process](./docs/BUSINESS_PROCESS.md)
> - 🚀 [Setup Guide](./docs/SETUP.md)

## 🎯 Features

- ✅ Barcode scanning untuk bahan baku dan produk jadi
- ✅ Real-time inventory tracking
- ✅ Dashboard untuk monitoring barang masuk/keluar
- ✅ Re-weighing support untuk penyusutan
- ✅ Export report ke Excel dan PDF
- ✅ Scalable untuk 4000+ boxes per hari

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js 20+
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL 15+
- **Cache:** Redis 7+
- **Queue:** Bull (Redis-based)
- **ORM:** Prisma

### Frontend
- **Framework:** React 18+ dengan TypeScript
- **Build Tool:** Vite
- **UI Library:** Material-UI (MUI)
- **Charts:** Recharts
- **State Management:** Zustand
- **Real-time:** Socket.IO Client

### DevOps
- **Containerization:** Docker & Docker Compose
- **API Documentation:** Swagger/OpenAPI
- **Testing:** Jest, Supertest

## 📊 Business Process Flow

```
1. PENERIMAAN BAHAN BAKU
   ├─ Scan Barcode
   ├─ Input Data (Supplier, Quantity, etc)
   ├─ Penimbangan Awal
   └─ Save to Database

2. PRODUKSI
   ├─ Ambil Bahan Baku
   ├─ Update Inventory Status
   ├─ Proses Produksi
   └─ Output Produk Jadi

3. PENGELUARAN PRODUK
   ├─ Scan Barcode Produk
   ├─ Penimbangan Ulang (Cek Penyusutan)
   ├─ Update Weight jika ada perubahan
   └─ Record Keluar

4. REPORTING
   ├─ View Dashboard Real-time
   ├─ Generate Report
   └─ Export ke Excel/PDF
```

## 🗂 Database Schema Overview

### Main Tables
- **materials** - Bahan baku master data
- **products** - Produk jadi master data
- **inventory_transactions** - Log semua pergerakan barang
- **weighing_records** - Record penimbangan dan re-weighing
- **stock_summary** - Summary stok real-time

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (recommended)

### Option 1: Docker (Recommended)

```bash
# 1. Start all services
docker-compose up -d

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Setup database
cd backend
npm run db:generate
npm run db:migrate
npm run db:seed

# 4. Access aplikasi
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
# API Docs: http://localhost:3000/api-docs

# 5. Login dengan:
# Email: admin@warehouse.com
# Password: admin123
```

### Option 2: Manual Setup

```bash
# 1. Start PostgreSQL & Redis
brew services start postgresql@15
brew services start redis

# 2. Create database
createdb warehouse_db

# 3. Install & setup backend
cd backend
cp .env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev

# 4. Install & setup frontend (terminal baru)
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Access
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Prisma Studio**: `npm run db:studio` (port 5555)

## 📱 API Endpoints

### Materials & Products
- `GET /api/materials` - Get all materials
- `POST /api/materials` - Create new material
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product

### Inventory Transactions
- `POST /api/inventory/scan` - Record barcode scan
- `GET /api/inventory/transactions` - Get transaction history
- `PUT /api/inventory/reweigh/:id` - Update weight after re-weighing
- `GET /api/inventory/summary` - Get current stock summary

### Reports
- `GET /api/reports/daily` - Daily report
- `GET /api/reports/export/excel` - Export to Excel
- `GET /api/reports/export/pdf` - Export to PDF

### Dashboard
- `GET /api/dashboard/stats` - Real-time statistics
- `WebSocket /ws` - Real-time updates

## 🐳 Production Deployment

### 🚀 Quick Deploy ke Server Linux

```bash
# 1. Copy project ke server
scp -r . user@server:/opt/warehouse

# 2. SSH ke server
ssh user@server
cd /opt/warehouse

# 3. Build Docker images
cd backend && docker build -t warehouse-backend:latest .
cd ../frontend && docker build -t warehouse-frontend:latest .
cd ..

# 4. Setup environment
cp .env.prod.example .env.prod
nano .env.prod  # Edit passwords & JWT_SECRET

# 5. Deploy dengan Docker Compose
docker compose -f docker-compose.prod.yml up -d

# 6. Setup database
docker compose exec backend npm run db:migrate
docker compose exec backend npm run db:seed

# ✅ Aplikasi running di http://server-ip
```

### 📚 Dokumentasi Deployment Lengkap

- **[DEPLOY.md](./DEPLOY.md)** - Quick deployment guide
- **[CHECKLIST.md](./CHECKLIST.md)** - Production deployment checklist
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Comprehensive deployment guide
- **[docs/SETUP.md](./docs/SETUP.md)** - Setup & configuration guide

## 📈 Scalability Considerations

1. **Database Partitioning:** Table partisi berdasarkan tanggal untuk `inventory_transactions`
2. **Indexing:** Index pada barcode, timestamps, dan foreign keys
3. **Caching:** Redis untuk dashboard stats dan frequent queries
4. **Queue System:** Bull queue untuk handle scanning spikes
5. **Connection Pooling:** PostgreSQL connection pool optimization

## 🔧 Configuration

Edit file `.env` untuk konfigurasi:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/warehouse_db

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
```

## 📝 Development Guidelines

- Follow TypeScript strict mode
- Write unit tests untuk business logic
- Use Prettier untuk code formatting
- Commit messages mengikuti Conventional Commits

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📚 Documentation

| Dokumen | Deskripsi | Status |
|---------|-----------|--------|
| 🇮🇩 **[RINGKASAN LENGKAP](./docs/RINGKASAN_LENGKAP.md)** | **Penjelasan lengkap dalam Bahasa Indonesia** | ✅ |
| 📁 [Project Structure](./docs/PROJECT_STRUCTURE.md) | Struktur folder & file organization | ✅ |
| ⚡ [Quick Reference](./docs/QUICK_REFERENCE.md) | Referensi cepat untuk developer | ✅ |
| 🏗️ [Architecture](./docs/ARCHITECTURE.md) | Tech stack & design decisions | ✅ |
| 📋 [Business Process](./docs/BUSINESS_PROCESS.md) | Proses bisnis detail | ✅ |
| 🚀 [Setup Guide](./docs/SETUP.md) | Panduan instalasi & deployment lengkap | ✅ |
| 📖 [Summary](./docs/SUMMARY.md) | Project summary (English) | ✅ |

## 🎯 Production Checklist

- [ ] Change default passwords
- [ ] Generate strong JWT_SECRET
- [ ] Setup SSL/TLS certificates
- [ ] Configure firewall
- [ ] Setup database backups
- [ ] Configure log rotation
- [ ] Enable rate limiting
- [ ] Setup monitoring
- [ ] Configure CORS properly
- [ ] Use environment variables (never hardcode secrets)

## 📝 License

MIT License - feel free to use this project for your needs.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For questions and support, please create an issue in the repository.

---

**Made with ❤️ for efficient warehouse management**
