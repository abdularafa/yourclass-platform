# YourClass Local Setup Guide

## Prerequisites

### 1. Install PostgreSQL

**Option A: Download and install**
- Download from: https://www.postgresql.org/download/windows/
- During installation, set:
  - Port: 5432
  - Password: postgres
  - Username: postgres

**Option B: Using Docker**
```bash
docker run -d `
  --name yourclass-db `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=yourclass `
  -p 5432:5432 `
  postgres:16
```

### 2. Create Database
```sql
CREATE DATABASE yourclass;
```

### 3. Update .env
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/yourclass?schema=public"
```

### 4. Push Schema
```bash
cd packages/database
pnpm db:push
```

## Running the System

### Start all services:
```bash
# Terminal 1: Auth service (port 3001)
cd services/auth && pnpm dev

# Terminal 2: Course service (port 3003)
cd services/course && pnpm dev

# Terminal 3: Video service (port 3004)
cd services/video && pnpm dev

# Terminal 4: Payment service (port 3005)
cd services/payment && pnpm dev

# Terminal 5: Notification service (port 3006)
cd services/notification && pnpm dev

# Terminal 6: Live service (port 3007)
cd services/live && pnpm dev

# Terminal 7: Test service (port 3008)
cd services/test && pnpm dev

# Terminal 8: Frontend (port 3000)
cd apps/student-app && pnpm dev
```

### Or use the script:
```bash
# Windows PowerShell
.\scripts\start-all.ps1

# Or with frontend
.\scripts\start-all.ps1 -WithFrontend
```

## Service Ports

| Service | Port |
|---------|------|
| Auth | 3001 |
| Course | 3003 |
| Video | 3004 |
| Payment | 3005 |
| Notification | 3006 |
| Live | 3007 |
| Test | 3008 |
| Student App | 3000 |
