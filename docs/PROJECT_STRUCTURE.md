# 📁 Project Structure

```
project_warehouse/
│
├── 📂 backend/                         # Backend API (Node.js + TypeScript + Express)
│   ├── 📂 src/
│   │   ├── 📂 config/                  # Configuration files
│   │   │   ├── database.ts            # Prisma client setup
│   │   │   ├── redis.ts               # Redis connection
│   │   │   └── swagger.ts             # API documentation config
│   │   │
│   │   ├── 📂 controllers/             # Request handlers (business logic)
│   │   │   ├── auth.controller.ts     # Login, register
│   │   │   ├── inventory.controller.ts # Scan, reweigh, transactions
│   │   │   ├── material.controller.ts  # CRUD materials
│   │   │   ├── product.controller.ts   # CRUD products
│   │   │   ├── dashboard.controller.ts # Stats, metrics
│   │   │   └── report.controller.ts    # Excel, PDF export
│   │   │
│   │   ├── 📂 middleware/              # Express middlewares
│   │   │   ├── auth.ts                # JWT authentication
│   │   │   └── errorHandler.ts        # Error handling
│   │   │
│   │   ├── 📂 routes/                  # API route definitions
│   │   │   ├── auth.routes.ts
│   │   │   ├── inventory.routes.ts
│   │   │   ├── material.routes.ts
│   │   │   ├── product.routes.ts
│   │   │   ├── dashboard.routes.ts
│   │   │   └── report.routes.ts
│   │   │
│   │   ├── 📂 services/                # Business services (to be created)
│   │   │   ├── inventory.service.ts    # Business logic
│   │   │   ├── report.service.ts       # Report generation
│   │   │   └── notification.service.ts # Email/alerts
│   │   │
│   │   ├── 📂 utils/                   # Utility functions
│   │   │   ├── helpers.ts             # Common helpers
│   │   │   └── logger.ts              # Winston logger
│   │   │
│   │   ├── 📂 websocket/               # WebSocket real-time
│   │   │   └── index.ts               # Socket.IO setup
│   │   │
│   │   ├── 📂 queues/                  # Background jobs
│   │   │   └── index.ts               # Bull queue setup
│   │   │
│   │   ├── 📂 database/                # Database utilities
│   │   │   └── seed.ts                # Sample data seeding
│   │   │
│   │   └── index.ts                   # Main entry point
│   │
│   ├── 📂 prisma/                      # Prisma ORM
│   │   ├── schema.prisma              # Database schema
│   │   └── migrations/                # Migration history
│   │
│   ├── package.json                   # Dependencies
│   ├── tsconfig.json                  # TypeScript config
│   ├── .env.example                   # Environment variables template
│   └── Dockerfile                     # Docker container
│
├── 📂 frontend/                        # Frontend (React + TypeScript + Vite)
│   ├── 📂 src/
│   │   ├── 📂 components/             # Reusable UI components (to be created)
│   │   │   ├── Layout.tsx             # Main layout
│   │   │   ├── BarcodeScanner.tsx     # Scanner component
│   │   │   ├── InventoryTable.tsx     # Data table
│   │   │   ├── Dashboard/             # Dashboard widgets
│   │   │   └── Charts/                # Chart components
│   │   │
│   │   ├── 📂 pages/                   # Page components (to be created)
│   │   │   ├── Login.tsx              # Login page
│   │   │   ├── Dashboard.tsx          # Dashboard
│   │   │   ├── Scanning.tsx           # Barcode scanning
│   │   │   ├── Inventory.tsx          # Inventory list
│   │   │   ├── Materials.tsx          # Material master
│   │   │   ├── Products.tsx           # Product master
│   │   │   └── Reports.tsx            # Reports
│   │   │
│   │   ├── 📂 services/                # API service layer (to be created)
│   │   │   ├── api.ts                 # Axios config
│   │   │   ├── authService.ts         # Auth API calls
│   │   │   ├── inventoryService.ts    # Inventory API
│   │   │   └── websocket.ts           # WebSocket client
│   │   │
│   │   ├── 📂 stores/                  # State management (to be created)
│   │   │   ├── authStore.ts           # Auth state (Zustand)
│   │   │   ├── inventoryStore.ts      # Inventory state
│   │   │   └── dashboardStore.ts      # Dashboard state
│   │   │
│   │   ├── 📂 types/                   # TypeScript types (to be created)
│   │   │   ├── inventory.ts
│   │   │   ├── user.ts
│   │   │   └── api.ts
│   │   │
│   │   ├── 📂 utils/                   # Utility functions (to be created)
│   │   │   ├── formatters.ts          # Date, number formatting
│   │   │   └── validators.ts          # Form validation
│   │   │
│   │   ├── App.tsx                    # Main app component ✅
│   │   ├── main.tsx                   # Entry point ✅
│   │   └── index.css                  # Global styles ✅
│   │
│   ├── public/                        # Static assets
│   ├── package.json                   # Dependencies ✅
│   ├── tsconfig.json                  # TypeScript config ✅
│   ├── vite.config.ts                 # Vite config ✅
│   ├── .env.example                   # Environment template ✅
│   └── Dockerfile                     # Docker container ✅
│
├── 📂 docs/                            # Documentation
│   ├── RINGKASAN_LENGKAP.md           # 🇮🇩 Ringkasan lengkap (BACA INI!) ✅
│   ├── ARCHITECTURE.md                # Tech stack & design ✅
│   ├── BUSINESS_PROCESS.md            # Business process flow ✅
│   ├── SETUP.md                       # Installation guide ✅
│   └── SUMMARY.md                     # English summary ✅
│
├── docker-compose.yml                 # Docker orchestration ✅
├── .gitignore                         # Git ignore rules ✅
└── README.md                          # Project overview ✅

```

## 🎯 Key Components

### Backend Structure

#### 1. **Controllers** (Request Handlers)
- Handle HTTP requests
- Validate input
- Call services
- Return responses

#### 2. **Services** (Business Logic)
- Core business logic
- Database operations
- Complex calculations
- External integrations

#### 3. **Routes** (API Endpoints)
```
/api/auth
  POST /login
  POST /register

/api/inventory
  POST /scan
  PUT /reweigh/:id
  GET /transactions
  GET /summary

/api/materials
  GET / (list)
  GET /:id
  POST / (create)
  PUT /:id
  DELETE /:id

/api/products
  (same as materials)

/api/dashboard
  GET /stats
  GET /recent-transactions
  GET /low-stock

/api/reports
  GET /daily
  GET /export/excel
  GET /export/pdf
```

#### 4. **Middleware**
- Authentication (JWT verify)
- Authorization (role check)
- Error handling
- Logging
- Rate limiting

#### 5. **WebSocket** (Real-time)
- Dashboard updates
- Scan notifications
- Stock alerts
- User activity

#### 6. **Queue** (Background Jobs)
- Barcode processing
- Report generation
- Email sending
- Data aggregation

### Frontend Structure

#### 1. **Pages** (Routes)
```
/login           → Login page
/dashboard       → Main dashboard
/scanning        → Barcode scanning interface
/inventory       → Transaction history
/materials       → Material master data
/products        → Product master data
/reports         → Report generation
```

#### 2. **Components**
- **Layout**: Header, Sidebar, Footer
- **BarcodeScanner**: Barcode input with validation
- **InventoryTable**: Data grid with filters
- **Charts**: Recharts visualizations
- **Forms**: Material/Product forms
- **Modals**: Re-weighing, details

#### 3. **Services** (API Layer)
- Axios configuration
- API call functions
- Error handling
- Token management

#### 4. **Stores** (State Management)
- Auth state (user, token)
- Inventory state (transactions, summary)
- Dashboard state (stats, charts)
- UI state (loading, errors)

## 📊 Data Flow

### Barcode Scanning Flow
```
User Scan Barcode
       ↓
[BarcodeScanner Component]
       ↓
[inventoryService.scan()]
       ↓
POST /api/inventory/scan
       ↓
[inventory.controller.ts]
       ↓
[inventory.service.ts] (business logic)
       ↓
[Prisma] → PostgreSQL
       ↓
Update stock_summary
       ↓
Invalidate Redis cache
       ↓
Emit WebSocket event
       ↓
All connected dashboards update
```

### Report Generation Flow
```
User Request Report
       ↓
[Reports Page]
       ↓
POST /api/reports/export/excel
       ↓
[report.controller.ts]
       ↓
Add to Bull Queue (async)
       ↓
Worker processes job
       ↓
Query database (paginated)
       ↓
Generate Excel with ExcelJS
       ↓
Stream to browser
       ↓
User downloads file
```

## 🗄️ Database Tables

### Core Tables
1. **materials** - Bahan baku master
2. **products** - Produk jadi master
3. **inventory_transactions** - Semua pergerakan barang (PARTITIONED)
4. **weighing_records** - Audit trail penimbangan
5. **stock_summary** - Real-time stock levels (CACHED)
6. **users** - User accounts
7. **audit_logs** - System audit trail

### Indexes for Performance
```sql
-- Barcode lookup (most frequent)
CREATE INDEX idx_barcode ON materials(barcode);
CREATE INDEX idx_barcode ON products(barcode);

-- Transaction queries
CREATE INDEX idx_transaction_date ON inventory_transactions(transactionDate);
CREATE INDEX idx_transaction_type ON inventory_transactions(type);
CREATE INDEX idx_barcode_scan ON inventory_transactions(barcode);

-- Composite for common queries
CREATE INDEX idx_date_type ON inventory_transactions(transactionDate, type);
```

## 🚀 Deployment Structure

### Production Architecture
```
                    [Internet]
                        ↓
                  [Nginx/Load Balancer]
                        ↓
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
    [Backend-1]    [Backend-2]    [Backend-N]
        ↓               ↓               ↓
        └───────────────┼───────────────┘
                        ↓
              [PostgreSQL Primary]
                        ↓
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
    [Replica-1]    [Replica-2]    [Replica-N]
                        ↓
                 [Redis Cluster]
                        ↓
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
    [Redis-1]      [Redis-2]      [Redis-3]
```

## 📝 File Naming Conventions

### Backend
- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- Routes: `*.routes.ts`
- Middleware: `*.middleware.ts` or `*.ts`
- Utils: `*.ts`

### Frontend
- Components: `PascalCase.tsx`
- Pages: `PascalCase.tsx`
- Services: `camelCase.ts`
- Stores: `camelCaseStore.ts`
- Types: `camelCase.ts`
- Utils: `camelCase.ts`

## 🎨 Code Organization Principles

1. **Separation of Concerns**: Controllers ≠ Services ≠ Data Access
2. **DRY**: Don't Repeat Yourself
3. **SOLID**: Single responsibility, Open/closed, etc.
4. **Type Safety**: TypeScript strict mode
5. **Modular**: Easy to test, maintain, scale

## ✅ Implementation Status

### Backend ✅
- [x] Project structure
- [x] Database schema
- [x] All routes
- [x] All controllers
- [x] Middleware
- [x] WebSocket
- [x] Queue system
- [x] Utils & helpers
- [ ] Services (placeholder, to be implemented)
- [ ] Unit tests

### Frontend ⚠️
- [x] Project structure
- [x] Basic setup (React, Vite, MUI)
- [x] Main app & routing
- [ ] Pages (to be created)
- [ ] Components (to be created)
- [ ] Services (to be created)
- [ ] Stores (to be created)
- [ ] Types (to be created)

### Documentation ✅
- [x] Complete documentation
- [x] Architecture guide
- [x] Business process
- [x] Setup guide
- [x] Indonesian summary

## 🔗 Useful Links

- **Prisma Docs**: https://www.prisma.io/docs
- **Express.js**: https://expressjs.com
- **React**: https://react.dev
- **Material-UI**: https://mui.com
- **Socket.IO**: https://socket.io
- **Bull**: https://github.com/OptimalBits/bull

---

**Status**: Backend kerangka sudah lengkap ✅ | Frontend tinggal implement pages & components 🚧
