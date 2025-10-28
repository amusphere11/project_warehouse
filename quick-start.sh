#!/bin/bash

# Warehouse Development Quick Start Script
# This script automates the setup process

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Production & Inventory Management System Setup      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Please install Node.js 20+ from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js installed ($(node --version))${NC}"

if ! command_exists npm; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm installed ($(npm --version))${NC}"

if ! command_exists docker; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    echo "Please install Docker from https://www.docker.com/"
    exit 1
fi
echo -e "${GREEN}✓ Docker installed ($(docker --version))${NC}"

echo ""

# Ask user which setup to run
echo -e "${BLUE}Select setup option:${NC}"
echo "1) Full setup with Docker (Recommended)"
echo "2) Manual setup (PostgreSQL & Redis already running)"
echo "3) Production build"
echo "4) Exit"
echo ""
read -p "Enter option (1-4): " option

case $option in
    1)
        echo -e "\n${YELLOW}Starting Docker setup...${NC}"
        
        # Start Docker containers
        echo -e "${YELLOW}Starting PostgreSQL and Redis...${NC}"
        docker compose up -d postgres redis
        
        # Wait for services
        echo -e "${YELLOW}Waiting for services to be ready...${NC}"
        sleep 10
        
        # Backend setup
        echo -e "\n${YELLOW}Setting up backend...${NC}"
        cd backend
        
        if [ ! -f .env ]; then
            cp .env.example .env
            echo -e "${GREEN}✓ Created backend .env file${NC}"
        fi
        
        echo -e "${YELLOW}Installing backend dependencies...${NC}"
        npm install
        
        echo -e "${YELLOW}Generating Prisma Client...${NC}"
        npm run db:generate
        
        echo -e "${YELLOW}Running database migrations...${NC}"
        npm run db:migrate
        
        echo -e "${YELLOW}Seeding database...${NC}"
        npm run db:seed
        
        echo -e "${GREEN}✓ Backend setup complete${NC}"
        
        # Frontend setup
        echo -e "\n${YELLOW}Setting up frontend...${NC}"
        cd ../frontend
        
        if [ ! -f .env ]; then
            cp .env.example .env
            echo -e "${GREEN}✓ Created frontend .env file${NC}"
        fi
        
        echo -e "${YELLOW}Installing frontend dependencies...${NC}"
        npm install
        
        echo -e "${GREEN}✓ Frontend setup complete${NC}"
        
        cd ..
        
        # Show next steps
        echo -e "\n${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║              Setup Complete! 🎉                        ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${YELLOW}To start the application:${NC}"
        echo ""
        echo "Terminal 1 (Backend):"
        echo "  cd backend && npm run dev"
        echo ""
        echo "Terminal 2 (Frontend):"
        echo "  cd frontend && npm run dev"
        echo ""
        echo -e "${YELLOW}Access:${NC}"
        echo "  Frontend: http://localhost:5173"
        echo "  Backend:  http://localhost:3000"
        echo "  API Docs: http://localhost:3000/api-docs"
        echo ""
        echo -e "${YELLOW}Login credentials:${NC}"
        echo "  Email:    admin@warehouse.com"
        echo "  Password: admin123"
        echo ""
        ;;
        
    2)
        echo -e "\n${YELLOW}Starting manual setup...${NC}"
        
        # Check if PostgreSQL is running
        if ! nc -z localhost 5432; then
            echo -e "${RED}✗ PostgreSQL is not running on port 5432${NC}"
            echo "Please start PostgreSQL first"
            exit 1
        fi
        echo -e "${GREEN}✓ PostgreSQL is running${NC}"
        
        # Check if Redis is running
        if ! nc -z localhost 6379; then
            echo -e "${RED}✗ Redis is not running on port 6379${NC}"
            echo "Please start Redis first"
            exit 1
        fi
        echo -e "${GREEN}✓ Redis is running${NC}"
        
        # Backend setup
        echo -e "\n${YELLOW}Setting up backend...${NC}"
        cd backend
        
        if [ ! -f .env ]; then
            cp .env.example .env
            echo -e "${GREEN}✓ Created backend .env file${NC}"
            echo -e "${YELLOW}Please edit backend/.env and update DATABASE_URL and REDIS_URL${NC}"
            read -p "Press Enter after editing .env file..."
        fi
        
        echo -e "${YELLOW}Installing backend dependencies...${NC}"
        npm install
        
        echo -e "${YELLOW}Generating Prisma Client...${NC}"
        npm run db:generate
        
        echo -e "${YELLOW}Running database migrations...${NC}"
        npm run db:migrate
        
        echo -e "${YELLOW}Seeding database...${NC}"
        npm run db:seed
        
        echo -e "${GREEN}✓ Backend setup complete${NC}"
        
        # Frontend setup
        echo -e "\n${YELLOW}Setting up frontend...${NC}"
        cd ../frontend
        
        if [ ! -f .env ]; then
            cp .env.example .env
            echo -e "${GREEN}✓ Created frontend .env file${NC}"
        fi
        
        echo -e "${YELLOW}Installing frontend dependencies...${NC}"
        npm install
        
        echo -e "${GREEN}✓ Frontend setup complete${NC}"
        
        cd ..
        
        echo -e "\n${GREEN}Setup complete!${NC}"
        echo "Follow the same instructions as option 1 to start the app"
        ;;
        
    3)
        echo -e "\n${YELLOW}Building for production...${NC}"
        
        # Backend build
        echo -e "\n${YELLOW}Building backend...${NC}"
        cd backend
        docker build -t warehouse-backend:latest .
        echo -e "${GREEN}✓ Backend image built${NC}"
        
        # Frontend build
        echo -e "\n${YELLOW}Building frontend...${NC}"
        cd ../frontend
        docker build -t warehouse-frontend:latest .
        echo -e "${GREEN}✓ Frontend image built${NC}"
        
        cd ..
        
        echo -e "\n${GREEN}Production images built successfully!${NC}"
        echo ""
        echo "To deploy to production:"
        echo "  1. Copy images to server or push to registry"
        echo "  2. Read docs/DEPLOYMENT.md for detailed instructions"
        ;;
        
    4)
        echo -e "${GREEN}Goodbye!${NC}"
        exit 0
        ;;
        
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac
