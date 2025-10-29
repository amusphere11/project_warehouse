#!/bin/bash

# Production Build & Deployment Script
# This script builds both backend and frontend, then starts them with nginx

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="/home/azka/project_warehouse"

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Building Production - Warehouse System              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

cd $PROJECT_DIR

# Create logs and dist directories
mkdir -p logs
mkdir -p dist

# Build Backend
echo -e "${YELLOW}[1/3] Building Backend...${NC}"
cd backend
npm ci --production=false
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend built successfully${NC}"
else
    echo -e "${RED}✗ Backend build failed${NC}"
    exit 1
fi
cd ..

# Build Frontend
echo -e "${YELLOW}[2/3] Building Frontend...${NC}"
cd frontend
npm ci --production=false
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend built successfully${NC}"
    # Copy built files to nginx serve location
    rm -rf ../dist/frontend
    cp -r dist ../dist/frontend
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
fi
cd ..

# Setup Nginx Configuration
echo -e "${YELLOW}[3/3] Setting up Nginx...${NC}"

# Create nginx config for standalone deployment
cat > nginx-standalone.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    sendfile on;
    keepalive_timeout 65;
    gzip on;

    # Backend upstream
    upstream backend {
        server localhost:3000;
    }

    server {
        listen 80;
        server_name _;

        # Frontend static files
        location / {
            root /home/azka/project_warehouse/dist/frontend;
            try_files $uri $uri/ /index.html;
            
            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # Backend API
        location /api {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # WebSocket
        location /socket.io {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Health check
        location /health {
            proxy_pass http://backend;
        }

        # API Documentation
        location /api-docs {
            proxy_pass http://backend;
        }
    }
}
EOF

echo -e "${GREEN}✓ Nginx configuration created${NC}"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Build Complete!                           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo -e "1. Start Backend:"
echo -e "   ${YELLOW}cd backend && npm start${NC}"
echo ""
echo -e "2. Start Nginx:"
echo -e "   ${YELLOW}sudo nginx -c $(pwd)/nginx-standalone.conf${NC}"
echo ""
echo -e "3. Or use PM2 (recommended):"
echo -e "   ${YELLOW}pm2 start ecosystem.config.js --env production${NC}"
echo ""
echo -e "${BLUE}Access Application:${NC}"
echo -e "   ${YELLOW}http://10.2.4.25${NC} (or your server IP)"
echo ""
