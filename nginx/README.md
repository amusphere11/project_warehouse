# Nginx Configuration

Folder ini berisi konfigurasi Nginx untuk production deployment.

## Setup SSL/TLS Certificates

### Option 1: Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Certificates akan ada di:
# /etc/letsencrypt/live/your-domain.com/fullchain.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem

# Copy ke folder ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/
```

### Option 2: Self-Signed Certificate (Development)

```bash
# Generate self-signed certificate
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/privkey.pem \
  -out ssl/fullchain.pem \
  -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Warehouse/CN=localhost"
```

## Enable HTTPS

1. Generate SSL certificates (see above)
2. Edit `nginx.conf` dan uncomment HTTPS server block
3. Update `server_name` dengan domain Anda
4. Restart nginx:
   ```bash
   docker-compose -f docker-compose.prod.yml restart nginx
   ```

## Logs

Nginx logs akan tersimpan di folder `logs/`:
- `access.log` - HTTP access logs
- `error.log` - Error logs

```bash
# View access logs
tail -f nginx/logs/access.log

# View error logs
tail -f nginx/logs/error.log
```

## Rate Limiting

Konfigurasi default:
- API endpoints: 10 requests per second
- Login endpoint: 5 requests per minute

Edit di `nginx.conf` untuk menyesuaikan.

## Security Headers

HTTPS server block sudah include security headers:
- `Strict-Transport-Security` - Force HTTPS
- `X-Frame-Options` - Prevent clickjacking
- `X-Content-Type-Options` - Prevent MIME sniffing
- `X-XSS-Protection` - XSS protection

## Troubleshooting

### Check configuration

```bash
docker-compose -f docker-compose.prod.yml exec nginx nginx -t
```

### Reload configuration

```bash
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

### View logs

```bash
docker-compose -f docker-compose.prod.yml logs -f nginx
```
