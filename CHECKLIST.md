# 📋 Production Deployment Checklist

## Pre-Deployment

- [ ] Server Linux sudah siap (Ubuntu 20.04+)
- [ ] Docker & Docker Compose installed di server
- [ ] Domain sudah di-point ke IP server (optional)
- [ ] Firewall configured (port 80, 443, 22)
- [ ] SSH access ke server sudah ok

## Build & Deploy

- [ ] Project di-copy ke server (`/opt/warehouse`)
- [ ] Docker images sudah di-build (backend & frontend)
- [ ] File `.env.prod` sudah dibuat dan di-isi
- [ ] Password database sudah diganti (strong password)
- [ ] JWT_SECRET sudah diganti (strong random string)
- [ ] Redis password sudah diganti
- [ ] Docker Compose services running (`docker compose ps`)
- [ ] Database migrations sudah dijalankan
- [ ] Database seeding sudah dijalankan (optional)
- [ ] Aplikasi bisa diakses via browser

## Security

- [ ] Default passwords sudah diganti semua
- [ ] JWT_SECRET menggunakan random string (min 32 characters)
- [ ] File `.env.prod` tidak di-commit ke git
- [ ] Firewall enabled (UFW/iptables)
- [ ] Port 5432 (PostgreSQL) tidak exposed ke internet
- [ ] Port 6379 (Redis) tidak exposed ke internet
- [ ] SSL/TLS certificates installed (Let's Encrypt)
- [ ] HTTPS enabled di nginx
- [ ] HTTP redirect ke HTTPS enabled
- [ ] Rate limiting enabled di nginx
- [ ] CORS configured dengan domain yang benar

## Database

- [ ] PostgreSQL running
- [ ] Migrations completed successfully
- [ ] Sample data seeded (untuk testing)
- [ ] Database backups configured
- [ ] Backup script tested (`./backup.sh`)
- [ ] Restore script tested (`./restore.sh`)
- [ ] Automated daily backup configured (cron)

## Monitoring & Logs

- [ ] Docker logs accessible (`docker compose logs`)
- [ ] Nginx access logs accessible (`nginx/logs/access.log`)
- [ ] Nginx error logs accessible (`nginx/logs/error.log`)
- [ ] Log rotation configured
- [ ] Disk space monitoring setup
- [ ] Service health checks working

## Performance

- [ ] PostgreSQL connection pool configured
- [ ] Redis cache working
- [ ] Static assets compressed (gzip)
- [ ] Database indexes created (via Prisma)
- [ ] Response time tested (< 500ms)

## Backup & Recovery

- [ ] Database backup working
- [ ] Backup retention policy set (30 days default)
- [ ] Restore procedure tested
- [ ] Backup stored in safe location
- [ ] Volume backups configured (optional)

## Testing

- [ ] Frontend accessible
- [ ] Backend API accessible
- [ ] Login working
- [ ] Barcode scanning working
- [ ] CRUD operations working (Materials, Products)
- [ ] Inventory transactions working
- [ ] Reports export working (Excel)
- [ ] Dashboard real-time updates working
- [ ] WebSocket connections working

## Documentation

- [ ] README.md reviewed
- [ ] DEPLOY.md reviewed
- [ ] API documentation accessible (`/api-docs`)
- [ ] Admin user credentials saved securely
- [ ] Team trained on how to use system

## Post-Deployment

- [ ] Monitor logs for first 24 hours
- [ ] Test all critical features
- [ ] Setup alerting (optional)
- [ ] Setup monitoring dashboard (optional)
- [ ] Document any issues encountered
- [ ] Update DNS if needed
- [ ] Share access credentials with team
- [ ] Schedule regular backups verification

## Maintenance Schedule

- [ ] Daily: Check logs for errors
- [ ] Weekly: Check disk space
- [ ] Weekly: Verify backups working
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review security patches
- [ ] Quarterly: Load testing
- [ ] Yearly: SSL certificate renewal

---

## Quick Commands

### Check Status
```bash
docker compose -f docker-compose.prod.yml ps
```

### View Logs
```bash
docker compose -f docker-compose.prod.yml logs -f
```

### Restart Services
```bash
docker compose -f docker-compose.prod.yml restart
```

### Backup Database
```bash
./backup.sh
```

### Update Application
```bash
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend npm run db:migrate
```

---

**Print this checklist and check off items as you complete them! ✅**
