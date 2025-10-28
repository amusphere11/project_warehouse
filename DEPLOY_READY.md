# Frontend & Backend Ready for Deployment

## Files Added/Updated

### Frontend
1. **tsconfig.node.json** - TypeScript config for Vite (CREATED)
2. **vite.config.ts** - Updated to listen on all addresses with `host: true`

### Backend
1. **src/index.ts** - Added root route `/` with API info
2. **src/queues/index.ts** - Fixed import paths
3. **src/websocket/index.ts** - Fixed import paths
4. **src/utils/logger.ts** - Added default export

## Deploy Instructions

### 1. Push to GitLab (on Mac)
```bash
cd /Users/azka/Documents/project_warehouse
git add .
git commit -m "feat: Add missing frontend config and backend root route"
git push origin main
```

### 2. On Server - Pull & Deploy

#### Backend (already running)
```bash
cd /home/azka/project_warehouse
git pull origin main
cd backend
# Backend should already be running, if not:
npm run dev
```

#### Frontend (needs to start)
```bash
cd /home/azka/project_warehouse/frontend

# Create .env file
cp .env.example .env

# Edit .env to point to server IP
nano .env
# Change to:
# VITE_API_URL=http://10.2.4.25:3000
# VITE_WS_URL=ws://10.2.4.25:3000

# Install dependencies (if not done)
npm install

# Run frontend
npm run dev
```

### 3. Access Application

- **Frontend:** http://10.2.4.25:5173
- **Backend API:** http://10.2.4.25:3000
- **API Docs:** http://10.2.4.25:3000/api-docs

## Production Deployment (Optional)

For production, build static files:

```bash
# On server
cd /home/azka/project_warehouse/frontend

# Build
npm run build

# Serve with simple HTTP server
npx serve -s dist -p 5173 -l 5173
```

Or use Docker Compose:

```bash
cd /home/azka/project_warehouse
docker compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Frontend won't start
- Check if port 5173 is available: `lsof -i :5173`
- Check if .env file exists: `cat frontend/.env`
- Check dependencies installed: `ls frontend/node_modules`

### Can't access from browser
- Check firewall: `sudo ufw allow 5173`
- Check frontend is listening: `netstat -tlnp | grep 5173`
- Try accessing from server first: `curl http://localhost:5173`

## Default Login

- Email: admin@warehouse.com
- Password: admin123

---

All files ready to push and deploy! 🚀
