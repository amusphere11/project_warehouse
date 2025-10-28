# ⚡ Quick Reference Guide

> Referensi cepat untuk developer

## 🚀 Quick Start

```bash
# 1. Start dengan Docker
docker-compose up -d

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Setup database
cd backend
npm run db:generate && npm run db:migrate && npm run db:seed

# 4. Start development
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev

# 5. Access
Frontend: http://localhost:5173
Backend API: http://localhost:3000
API Docs: http://localhost:3000/api-docs

# 6. Login
Email: admin@warehouse.com
Password: admin123
```

---

## 📌 Common Commands

### Backend
```bash
# Development
npm run dev                 # Start with hot reload
npm run build              # Build for production
npm start                  # Run production build

# Database
npm run db:generate        # Generate Prisma Client
npm run db:migrate         # Run migrations
npm run db:seed            # Seed sample data
npm run db:studio          # Open Prisma Studio GUI

# Testing
npm test                   # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report

# Code Quality
npm run lint               # ESLint
npm run format             # Prettier
```

### Frontend
```bash
# Development
npm run dev                # Start dev server (port 5173)
npm run build              # Build for production
npm run preview            # Preview production build

# Testing
npm test                   # Run tests
npm run lint               # ESLint
```

### Docker
```bash
# All services
docker-compose up -d       # Start all services
docker-compose down        # Stop all services
docker-compose ps          # Check status
docker-compose logs -f     # Follow logs

# Individual services
docker-compose up -d postgres     # Start PostgreSQL only
docker-compose restart backend    # Restart backend
docker-compose logs -f backend    # Backend logs

# Clean up
docker-compose down -v     # Remove volumes (reset DB)
```

---

## 🔑 Environment Variables

### Backend (.env)
```bash
# App
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://warehouse_user:warehouse_pass@localhost:5432/warehouse_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
VITE_APP_NAME=Warehouse Management
```

---

## 📡 API Endpoints

### Authentication
```http
POST /api/auth/login
POST /api/auth/register
```

### Inventory
```http
POST   /api/inventory/scan              # Scan barcode
PUT    /api/inventory/reweigh/:id       # Re-weigh item
GET    /api/inventory/transactions      # List transactions
GET    /api/inventory/transactions/:id  # Transaction detail
GET    /api/inventory/summary           # Stock summary
```

### Materials
```http
GET    /api/materials           # List all
GET    /api/materials/:id       # Get by ID
POST   /api/materials           # Create
PUT    /api/materials/:id       # Update
DELETE /api/materials/:id       # Delete
```

### Products
```http
GET    /api/products            # List all
GET    /api/products/:id        # Get by ID
POST   /api/products            # Create
PUT    /api/products/:id        # Update
DELETE /api/products/:id        # Delete
```

### Dashboard
```http
GET /api/dashboard/stats                # Statistics
GET /api/dashboard/recent-transactions  # Recent activity
GET /api/dashboard/low-stock           # Low stock alerts
```

### Reports
```http
GET /api/reports/daily              # Daily report
GET /api/reports/export/excel       # Excel export
GET /api/reports/export/pdf         # PDF export
```

---

## 📊 Sample API Calls

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@warehouse.com","password":"admin123"}'
```

### Scan Barcode
```bash
curl -X POST http://localhost:3000/api/inventory/scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "barcode": "MAT-001",
    "type": "INBOUND",
    "itemType": "MATERIAL",
    "quantity": 100,
    "unit": "kg",
    "initialWeight": 100,
    "supplier": "PT Supplier ABC"
  }'
```

### Get Transactions
```bash
curl http://localhost:3000/api/inventory/transactions?page=1&limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Export Excel
```bash
curl http://localhost:3000/api/reports/export/excel?startDate=2024-01-01&endDate=2024-12-31 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o report.xlsx
```

---

## 🗄️ Database Quick Reference

### Common Queries

```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Count records
SELECT 
  'materials' AS table, COUNT(*) FROM materials
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'inventory_transactions', COUNT(*) FROM inventory_transactions;

-- Recent transactions
SELECT * FROM inventory_transactions 
ORDER BY transaction_date DESC 
LIMIT 10;

-- Stock levels
SELECT * FROM stock_summary 
WHERE current_stock < 50
ORDER BY current_stock ASC;

-- Daily statistics
SELECT 
  DATE(transaction_date) as date,
  type,
  COUNT(*) as count,
  SUM(quantity) as total_quantity
FROM inventory_transactions
WHERE transaction_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(transaction_date), type
ORDER BY date DESC, type;
```

### Prisma Studio
```bash
# Open GUI for database
cd backend
npm run db:studio
# Access: http://localhost:5555
```

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9    # Backend
lsof -ti:5173 | xargs kill -9    # Frontend
lsof -ti:5432 | xargs kill -9    # PostgreSQL

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Issues
```bash
# Reset database
cd backend
npx prisma migrate reset

# Check connection
psql -U warehouse_user -d warehouse_db -c "SELECT 1;"

# Check PostgreSQL status
pg_isready -h localhost -p 5432
```

### Redis Issues
```bash
# Check Redis
redis-cli ping        # Should return PONG

# Start Redis
redis-server

# Clear all Redis data
redis-cli FLUSHALL
```

### Module Not Found
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force
```

---

## 📁 Project Structure (Simplified)

```
project_warehouse/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth, errors
│   │   └── config/         # DB, Redis, Swagger
│   └── prisma/
│       └── schema.prisma   # Database schema
│
├── frontend/
│   └── src/
│       ├── pages/          # React pages
│       ├── components/     # UI components
│       ├── services/       # API calls
│       └── stores/         # State management
│
└── docs/                   # Documentation
```

---

## 🎯 Default Test Data

### Users
```
Admin:
  Email: admin@warehouse.com
  Password: admin123
  Role: ADMIN

Operator:
  Email: operator@warehouse.com
  Password: operator123
  Role: OPERATOR
```

### Materials
```
MAT-001  Tepung Terigu  (kg)
MAT-002  Gula Pasir     (kg)
MAT-003  Mentega        (kg)
MAT-004  Telur          (kg)
MAT-005  Susu Bubuk     (kg)
```

### Products
```
PRD-001  Roti Tawar     (box)
PRD-002  Kue Kering     (box)
PRD-003  Biskuit        (box)
PRD-004  Donat          (box)
PRD-005  Cake           (box)
```

---

## 🔍 Debugging

### Backend Logs
```bash
# Follow logs
docker-compose logs -f backend

# Check error logs
tail -f backend/logs/error.log

# Check all logs
tail -f backend/logs/combined.log
```

### Database Debugging
```bash
# Enable query logging in Prisma
# Edit backend/src/config/database.ts
# Set log level to 'query'
```

### Frontend Debugging
```javascript
// Browser DevTools
// Network tab: Check API calls
// Console: Check errors
// React DevTools: Check component state
```

---

## 📊 Performance Monitoring

### Check Response Times
```bash
# Using curl
time curl http://localhost:3000/api/dashboard/stats

# Using Apache Bench
ab -n 100 -c 10 http://localhost:3000/api/inventory/summary
```

### Database Performance
```sql
-- Slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Index usage
SELECT * FROM pg_stat_user_indexes 
WHERE schemaname = 'public';
```

### Redis Monitoring
```bash
redis-cli
> INFO stats
> SLOWLOG GET 10
```

---

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Run tests: `npm test`
- [ ] Build success: `npm run build`
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] SSL certificates ready

### Production
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secret
- [ ] Enable HTTPS
- [ ] Setup backups (database + uploads)
- [ ] Configure monitoring
- [ ] Setup error tracking (Sentry)

---

## 📚 Useful Resources

- **Prisma**: https://www.prisma.io/docs
- **Express**: https://expressjs.com/en/guide/routing.html
- **React**: https://react.dev/learn
- **MUI**: https://mui.com/material-ui/getting-started/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Redis**: https://redis.io/docs/

---

## 💡 Tips

### Development
- Use `npm run dev` untuk hot reload
- Install Prisma Studio extension di VS Code
- Enable TypeScript strict mode
- Use ESLint & Prettier

### Performance
- Always add indexes untuk foreign keys
- Use Redis cache untuk frequent queries
- Paginate large result sets
- Use connection pooling

### Security
- Never commit `.env` files
- Rotate JWT secrets regularly
- Validate all user inputs
- Use prepared statements (Prisma does this)
- Rate limit API endpoints

---

**🔖 Bookmark halaman ini untuk referensi cepat!**
