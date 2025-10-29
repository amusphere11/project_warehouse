# 🚀 Running Backend & Frontend Simultaneously

Ada beberapa cara untuk menjalankan backend dan frontend secara bersamaan:

---

## **Option 1: Menggunakan Scripts (Recommended untuk Server)**

### Setup (hanya sekali)

```bash
# Di server
cd /home/azka/project_warehouse

# Make scripts executable
chmod +x start.sh stop.sh
```

### Start Both Services

```bash
# Jalankan backend dan frontend sekaligus
./start.sh
```

**Output:**
```
╔════════════════════════════════════════════════════════╗
║   Starting Warehouse Management System                ║
╚════════════════════════════════════════════════════════╝

✓ Backend started (PID: 12345)
✓ Frontend started (PID: 12346)

Access:
  Frontend: http://localhost:5173
  Backend:  http://localhost:3000
  API Docs: http://localhost:3000/api-docs
```

### Stop Both Services

```bash
./stop.sh
```

### View Logs

```bash
# Backend logs
tail -f logs/backend.log

# Frontend logs
tail -f logs/frontend.log

# Both logs
tail -f logs/*.log
```

---

## **Option 2: Menggunakan `concurrently` (Development)**

### Install di Root Project

```bash
cd /home/azka/project_warehouse
npm install
```

### Run Development

```bash
# Jalankan backend dan frontend
npm run dev
```

### Install All Dependencies

```bash
# Install di root, backend, dan frontend
npm run install:all
```

---

## **Option 3: Menggunakan Terminal Multiplexer (tmux)**

### Install tmux (jika belum)

```bash
sudo apt-get install tmux
```

### Create tmux Session

```bash
# Start tmux session
tmux new -s warehouse

# Split terminal horizontal
Ctrl+B, "

# Navigate between panes
Ctrl+B, Arrow Keys

# In first pane (top):
cd /home/azka/project_warehouse/backend
npm run dev

# In second pane (bottom):
cd /home/azka/project_warehouse/frontend
npm run dev

# Detach from session (keep running)
Ctrl+B, D

# Reattach to session
tmux attach -t warehouse

# Kill session
tmux kill-session -t warehouse
```

---

## **Option 4: Menggunakan PM2 (Production)**

### Install PM2

```bash
npm install -g pm2
```

### Create ecosystem.config.js

```javascript
module.exports = {
  apps: [
    {
      name: 'warehouse-backend',
      cwd: './backend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
      },
    },
    {
      name: 'warehouse-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
```

### Start with PM2

```bash
# Start both services
pm2 start ecosystem.config.js

# View status
pm2 status

# View logs
pm2 logs

# Stop all
pm2 stop all

# Restart all
pm2 restart all

# Delete all
pm2 delete all

# Save configuration (auto-start on reboot)
pm2 save
pm2 startup
```

---

## **Option 5: Menggunakan Screen**

```bash
# Start backend in screen
screen -S backend
cd /home/azka/project_warehouse/backend
npm run dev
# Detach: Ctrl+A, D

# Start frontend in screen
screen -S frontend
cd /home/azka/project_warehouse/frontend
npm run dev
# Detach: Ctrl+A, D

# List screens
screen -ls

# Reattach to backend
screen -r backend

# Reattach to frontend
screen -r frontend

# Kill screen
screen -X -S backend quit
screen -X -S frontend quit
```

---

## **Option 6: Menggunakan Docker Compose (Production)**

```bash
# Start both services with Docker
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop
docker compose -f docker-compose.prod.yml down
```

---

## **Option 7: Manual dengan & (Background Process)**

```bash
# Start backend in background
cd /home/azka/project_warehouse/backend
npm run dev > ../logs/backend.log 2>&1 &
echo $! > ../backend.pid

# Start frontend in background
cd /home/azka/project_warehouse/frontend
npm run dev > ../logs/frontend.log 2>&1 &
echo $! > ../frontend.pid

# Stop backend
kill $(cat backend.pid)

# Stop frontend
kill $(cat frontend.pid)
```

---

## **Comparison**

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **Scripts (start.sh)** | Simple, automatic PID tracking | Basic features | Quick development |
| **concurrently** | Easy, npm-based | Needs Node.js | Local development |
| **tmux** | Powerful, persistent | Learning curve | SSH sessions |
| **PM2** | Production-ready, monitoring | More complex | Production |
| **Screen** | Simple, built-in | Less features than tmux | Simple sessions |
| **Docker Compose** | Isolated, reproducible | More resources | Production |

---

## **Recommended Setup**

### Development (Local/Server)
```bash
./start.sh    # Simple and works everywhere
```

### Production (Server)
```bash
pm2 start ecosystem.config.js    # Best for production
# or
docker compose -f docker-compose.prod.yml up -d
```

---

## **Quick Commands Reference**

```bash
# Start
./start.sh

# Stop
./stop.sh

# View logs
tail -f logs/backend.log
tail -f logs/frontend.log

# Check if running
ps aux | grep node

# Check ports
lsof -i :3000    # Backend
lsof -i :5173    # Frontend

# Kill processes on ports
kill -9 $(lsof -ti:3000)
kill -9 $(lsof -ti:5173)
```

---

**Pilih salah satu method di atas sesuai kebutuhan! 🚀**

Untuk server production, saya recommend:
1. **PM2** - Untuk production yang robust
2. **start.sh/stop.sh** - Untuk development yang simple
3. **Docker Compose** - Untuk deployment yang clean
