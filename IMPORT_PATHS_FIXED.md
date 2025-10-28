# Fix Import Paths - Ready for Deployment

## Changes Made

### Fixed Import Paths in:

1. **src/queues/index.ts**
   - Fixed: `import redis from '../config/redis'`
   - Fixed: `import { logger } from '../utils/logger'`
   - Fixed: `import prisma from '../config/database'`

2. **src/websocket/index.ts**
   - Fixed: `import { logger } from '../utils/logger'`

3. **src/utils/logger.ts**
   - Added: `export default logger` for backward compatibility

## Verification

All import paths are now correct:
- ✅ Controllers use `../config/`, `../middleware/`, `../utils/`
- ✅ Routes use `../controllers/`, `../middleware/`
- ✅ Queues use `../config/`, `../utils/`, `../database/`
- ✅ WebSocket uses `../utils/`
- ✅ Index.ts uses `./config/`, `./routes/`, `./middleware/`, etc.

## Ready for GitLab

Files are now ready to be pushed to GitLab and pulled to server.

## Deploy Commands on Server

```bash
# On server
cd /home/azka/project_warehouse
git pull origin main

cd backend
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

## Files Modified

- backend/src/queues/index.ts
- backend/src/websocket/index.ts
- backend/src/utils/logger.ts

All other files already had correct import paths.
