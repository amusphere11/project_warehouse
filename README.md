# 📦 Production & Inventory Management System

Modern production and inventory management system with barcode scanning, real-time tracking, and comprehensive reporting capabilities designed for warehouses processing **4000+ boxes per day**.

## ✨ Features

- 🎨 **Modern Material Dashboard UI** - Premium Material-UI design with custom theming
- 📊 **Real-time Dashboard** - Live charts with actual transaction data
- 📦 **Inventory Management** - Complete tracking with barcode scanning
- 👥 **User Management** - Role-based access control (Admin, Manager, Operator)
- 🔄 **Material & Product Tracking** - End-to-end supply chain visibility
- 📈 **Analytics & Reports** - Export to Excel/PDF with comprehensive insights
- ⚡ **Real-time Updates** - WebSocket-powered live data synchronization

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+

### Development Setup

```bash
# Clone repository
git clone <your-repo-url>
cd project_warehouse

# Setup backend
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Setup frontend
cd ../frontend
cp .env.example .env
npm install

# Start development servers
npm run dev
```

**Default Login:**
- Email: `admin@warehouse.com`
- Password: `admin123`

**Access Points:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api-docs

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

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete deployment guide including:
- Docker deployment steps
- Environment configuration
- Database setup
- SSL/TLS configuration
- Troubleshooting common issues

Quick deploy:
```bash
# On server
git clone <your-repo-url>
cd project_warehouse
docker compose -f docker-compose.prod.yml up -d
```

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

- 📖 **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide with troubleshooting

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Made with ❤️ for efficient warehouse management**
