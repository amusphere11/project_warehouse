# 🏗 ARCHITECTURE & TECH STACK

## 📋 Daftar Isi
1. [Tech Stack Pilihan & Alasan](#tech-stack)
2. [Database Design](#database-design)
3. [Process Flow](#process-flow)
4. [Scalability Strategy](#scalability)
5. [Security](#security)
6. [Hardware Requirements](#hardware)

<a name="tech-stack"></a>
## Penjelasan Lengkap Arsitektur Sistem

### 1. **Mengapa Node.js + TypeScript?**

#### ✅ Kelebihan:
- **High Performance I/O**: Node.js sangat baik untuk operasi real-time seperti barcode scanning
- **Asynchronous**: Bisa handle 4000+ scanning requests per hari tanpa blocking
- **Type Safety**: TypeScript mencegah bug di production
- **Rich Ecosystem**: Library lengkap untuk Excel (ExcelJS), PDF (PDFKit), WebSocket, dll
- **Easy Scaling**: Mudah di-scale horizontal dengan PM2 atau Kubernetes

#### Alternatif yang Dipertimbangkan:
- **Python (FastAPI)**: Bagus untuk data processing, tapi lebih lambat untuk concurrent requests
- **Go**: Sangat cepat, tapi ecosystem untuk reporting (Excel/PDF) tidak sebaik Node.js
- **Java Spring Boot**: Robust tapi overhead lebih besar dan development lebih lambat

### 2. **Mengapa PostgreSQL?**

#### ✅ Kelebihan:
- **ACID Compliance**: Data inventory harus konsisten, tidak boleh ada data loss
- **Advanced Indexing**: B-tree, GiST, GIN untuk query cepat pada barcode dan timestamps
- **Partitioning**: Table partitioning untuk data yang terus bertumbuh
- **JSON Support**: Flexible untuk menyimpan metadata tambahan
- **Full-Text Search**: Untuk searching product/material names
- **Mature**: Battle-tested, reliable

#### Perbandingan dengan Database Lain:

| Feature | PostgreSQL | MySQL | MongoDB | SQL Server |
|---------|-----------|-------|---------|------------|
| ACID | ✅ Full | ✅ Full | ⚠️ Limited | ✅ Full |
| Partitioning | ✅ Built-in | ✅ Built-in | ✅ Sharding | ✅ Built-in |
| JSON Support | ✅ Excellent | ⚠️ Basic | ✅ Native | ✅ Good |
| Performance | ✅ Excellent | ✅ Good | ✅ Fast reads | ✅ Good |
| Cost | ✅ Free | ✅ Free | ✅ Free | ❌ Paid |
| Scalability | ✅ Excellent | ✅ Good | ✅ Excellent | ✅ Good |

**Kesimpulan**: PostgreSQL memberikan balance terbaik antara consistency, performance, dan features.

### 3. **Mengapa Redis?**

#### Use Cases:
1. **Caching**: Dashboard stats, stock summary (TTL 2-5 menit)
2. **Session Management**: User sessions
3. **Queue**: Bull queue menggunakan Redis untuk job processing
4. **Rate Limiting**: Prevent spam scanning
5. **Real-time Counters**: Daily scan counter

#### Alternatif:
- **Memcached**: Lebih simple tapi kurang features
- **In-Memory**: Tidak persistent, hilang saat restart

### 4. **Mengapa React untuk Frontend?**

#### ✅ Kelebihan:
- **Component-Based**: Reusable components (BarcodeScanner, InventoryTable, etc)
- **Virtual DOM**: Fast updates untuk real-time dashboard
- **Rich Ecosystem**: Chart libraries (Recharts), UI libraries (MUI)
- **WebSocket Support**: Easy integration untuk real-time updates
- **TypeScript Support**: Type-safe development

## 📊 Database Schema Design

### Normalization Strategy:
- **3NF (Third Normal Form)**: Menghindari redundancy
- **Denormalization**: `StockSummary` table untuk fast reads

### Indexing Strategy:
```sql
-- Performance-critical indexes
CREATE INDEX idx_barcode ON materials(barcode);
CREATE INDEX idx_barcode ON products(barcode);
CREATE INDEX idx_transaction_date ON inventory_transactions(transaction_date);
CREATE INDEX idx_transaction_type ON inventory_transactions(type);
CREATE INDEX idx_barcode_scan ON inventory_transactions(barcode);

-- Composite indexes untuk common queries
CREATE INDEX idx_transaction_date_type ON inventory_transactions(transaction_date, type);
```

### Table Partitioning (untuk scaling):
```sql
-- Partition by date untuk inventory_transactions
-- Setiap bulan jadi 1 partition
CREATE TABLE inventory_transactions (
  -- columns
) PARTITION BY RANGE (transaction_date);

CREATE TABLE inventory_transactions_2024_01 PARTITION OF inventory_transactions
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

## 🔄 Process Flow Detail

### 1. Barcode Scanning Flow:
```
User Scan → Frontend → WebSocket/HTTP → Backend
                                          ↓
                                    Validate Barcode
                                          ↓
                                    Create Transaction
                                          ↓
                                    Update Stock Summary
                                          ↓
                                    Add to Queue (async)
                                          ↓
                                    Emit WebSocket Event
                                          ↓
                        Real-time Update ke All Connected Clients
```

### 2. Re-weighing Flow:
```
User Input Weight → Frontend → Backend
                                  ↓
                            Find Transaction
                                  ↓
                            Calculate Shrinkage
                                  ↓
                            Update Transaction
                                  ↓
                            Create Weighing Record
                                  ↓
                            Emit WebSocket Event
```

### 3. Report Generation Flow:
```
User Request → Frontend → Backend
                            ↓
                      Add to Queue
                            ↓
                    Query Database
                            ↓
                Generate Excel/PDF
                            ↓
                Stream to Client
```

## 🚀 Scaling Strategy

### Horizontal Scaling:
```
Load Balancer (Nginx)
        ↓
   ┌────┴────┬────────┬────────┐
   │         │        │        │
Backend-1  Backend-2  Backend-3  Backend-N
   │         │        │        │
   └────┬────┴────────┴────────┘
        ↓
   PostgreSQL (Primary-Replica)
        ↓
   Redis Cluster
```

### Vertical Scaling:
- **Database**: Read replicas untuk reporting queries
- **Redis**: Redis Cluster untuk high availability

### Performance Optimization:
1. **Connection Pooling**: PostgreSQL connection pool (max 20-50)
2. **Caching**: Redis cache untuk frequent queries
3. **Indexing**: Proper indexes pada barcode, dates, foreign keys
4. **Pagination**: Limit 20-100 records per page
5. **Lazy Loading**: Load data on demand
6. **CDN**: Static assets via CDN
7. **Compression**: Gzip/Brotli compression

### Monitoring:
- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **Alerts**: Slack/Email notifications

### Estimated Capacity:

| Metric | Current | 1 Year | 3 Years |
|--------|---------|--------|---------|
| Daily Scans | 4,000 | 10,000 | 25,000 |
| Total Transactions | 1.5M/year | 3.6M/year | 9M/year |
| Database Size | ~500MB | ~2GB | ~5GB |
| Concurrent Users | 10-20 | 50-100 | 100-200 |

### Hardware Requirements:

#### Development:
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB SSD

#### Production (Initial):
- **App Server**: 4 cores, 8GB RAM
- **Database**: 4 cores, 16GB RAM, 100GB SSD
- **Redis**: 2 cores, 4GB RAM

#### Production (1 Year):
- **App Server**: 8 cores, 16GB RAM (2x instances)
- **Database**: 8 cores, 32GB RAM, 500GB SSD + Replicas
- **Redis**: 4 cores, 8GB RAM (Cluster)

## 🔐 Security Considerations

1. **Authentication**: JWT tokens (7 days expiry)
2. **Authorization**: Role-based access control (RBAC)
3. **Input Validation**: Zod schema validation
4. **SQL Injection**: Prisma ORM (parameterized queries)
5. **XSS Protection**: Helmet.js middleware
6. **CORS**: Whitelist frontend domain
7. **Rate Limiting**: Prevent abuse
8. **HTTPS**: SSL/TLS in production
9. **Secrets Management**: Environment variables, never hardcode

## 📱 Mobile/Barcode Scanner Integration

### Recommended Barcode Scanner Hardware:
- **Zebra DS3608**: Industrial-grade, durable
- **Honeywell Voyager 1450g**: Mid-range, reliable
- **Symbol LS2208**: Budget-friendly

### Integration Options:
1. **USB HID Mode**: Scanner acts as keyboard, no special integration needed
2. **Bluetooth**: Wireless scanning via Web Bluetooth API
3. **SDK Integration**: Manufacturer SDK untuk advanced features

## 📈 Future Enhancements

1. **Machine Learning**: Predict stock levels, detect anomalies
2. **Mobile App**: React Native app untuk scanning on-the-go
3. **Blockchain**: Immutable audit trail (optional)
4. **IoT Integration**: Automated weighing scales, RFID
5. **Multi-warehouse**: Support multiple warehouse locations
6. **Advanced Analytics**: BI dashboard dengan Metabase/Superset
