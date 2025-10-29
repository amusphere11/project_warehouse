#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║   Warehouse Management System - Quick Setup              ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Check PostgreSQL
echo -e "${YELLOW}[1/7]${NC} Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓${NC} PostgreSQL is installed"
    
    # Check if PostgreSQL is running
    if pg_isready &> /dev/null; then
        echo -e "${GREEN}✓${NC} PostgreSQL is running"
    else
        echo -e "${RED}✗${NC} PostgreSQL is not running"
        echo -e "${YELLOW}   Start with: sudo systemctl start postgresql${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗${NC} PostgreSQL is not installed"
    echo -e "${YELLOW}   Install: sudo apt install postgresql (Ubuntu)${NC}"
    echo -e "${YELLOW}   Install: brew install postgresql (macOS)${NC}"
    exit 1
fi
echo ""

# Setup Backend
echo -e "${YELLOW}[2/7]${NC} Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}   Creating .env from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓${NC} Created .env file"
else
    echo -e "${GREEN}✓${NC} .env already exists"
fi

echo -e "${CYAN}   Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓${NC} Backend dependencies installed"
echo ""

# Prisma Setup
echo -e "${YELLOW}[3/7]${NC} Setting up Prisma..."
echo -e "${CYAN}   Generating Prisma Client...${NC}"
npx prisma generate
echo -e "${GREEN}✓${NC} Prisma Client generated"

echo -e "${CYAN}   Running database migrations...${NC}"
npx prisma migrate dev --name init
echo -e "${GREEN}✓${NC} Database migrations complete"
echo ""

# Seed Database
echo -e "${YELLOW}[4/7]${NC} Seeding database..."
echo -e "${CYAN}   Creating demo users and data...${NC}"
npx prisma db seed
SEED_EXIT_CODE=$?

if [ $SEED_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Database seeded successfully"
    echo ""
    echo -e "${BLUE}   Demo Accounts:${NC}"
    echo -e "   ${GREEN}Admin:${NC}"
    echo -e "     Email: ${YELLOW}admin@warehouse.com${NC}"
    echo -e "     Password: ${YELLOW}admin123${NC}"
    echo ""
    echo -e "   ${GREEN}Operator:${NC}"
    echo -e "     Email: ${YELLOW}operator@warehouse.com${NC}"
    echo -e "     Password: ${YELLOW}operator123${NC}"
else
    echo -e "${RED}✗${NC} Database seeding failed"
    exit 1
fi
echo ""

# Setup Frontend
echo -e "${YELLOW}[5/7]${NC} Setting up Frontend..."
cd ../frontend

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}   Creating .env from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓${NC} Created .env file"
else
    echo -e "${GREEN}✓${NC} .env already exists"
fi

echo -e "${CYAN}   Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓${NC} Frontend dependencies installed"
echo ""

# Setup Root
echo -e "${YELLOW}[6/7]${NC} Setting up Root package..."
cd ..

if [ ! -f "package.json" ]; then
    echo -e "${RED}✗${NC} Root package.json not found"
else
    echo -e "${CYAN}   Installing root dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓${NC} Root dependencies installed"
fi
echo ""

# Test Connection
echo -e "${YELLOW}[7/7]${NC} Testing Backend Connection..."
cd backend

# Start backend in background for testing
echo -e "${CYAN}   Starting backend temporarily...${NC}"
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Test health endpoint
HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
if echo "$HEALTH_RESPONSE" | grep -q "OK"; then
    echo -e "${GREEN}✓${NC} Backend is responding correctly"
else
    echo -e "${RED}✗${NC} Backend health check failed"
fi

# Stop backend
kill $BACKEND_PID 2>/dev/null
cd ..

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Setup Complete! 🎉${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo -e "${YELLOW}1. Start Development:${NC}"
echo -e "   ${CYAN}npm run dev${NC}"
echo ""
echo -e "${YELLOW}2. Access Application:${NC}"
echo -e "   Frontend: ${CYAN}http://localhost:5173${NC}"
echo -e "   Backend:  ${CYAN}http://localhost:3000${NC}"
echo -e "   API Docs: ${CYAN}http://localhost:3000/api-docs${NC}"
echo ""
echo -e "${YELLOW}3. Login with:${NC}"
echo -e "   Email:    ${CYAN}admin@warehouse.com${NC}"
echo -e "   Password: ${CYAN}admin123${NC}"
echo ""
echo -e "${BLUE}Other Commands:${NC}"
echo -e "   ${CYAN}npm run build${NC}          - Build for production"
echo -e "   ${CYAN}./test-connection.sh${NC}   - Test frontend ↔ backend"
echo -e "   ${CYAN}./stop.sh${NC}              - Stop all services"
echo ""
echo -e "${GREEN}Happy Coding! 🚀${NC}"
echo ""
