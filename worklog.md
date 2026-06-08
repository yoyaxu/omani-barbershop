---
Task ID: 1
Agent: Main Agent
Task: Fix Vercel deployment + Add admin password management features

Work Log:
- Diagnosed that SQLite doesn't work on Vercel serverless (read-only filesystem, ephemeral /tmp)
- Installed and configured Neon PostgreSQL via Vercel marketplace integration
- Migrated Prisma schema from sqlite to postgresql provider
- Updated db.ts to remove SQLite-specific initialization, added password hashing utilities
- Created API routes: /api/admin/login, /api/admin/change-password, /api/admin/forgot-password
- Added AdminSettings model to Prisma schema for storing hashed password, email, and phone
- Updated AdminView in page.tsx with:
  - API-based login (no more hardcoded password check)
  - "¿Olvidaste tu contraseña?" link on login screen
  - Forgot password flow: enter admin email → generates 6-digit reset code → use as temp password
  - Change password dialog inside admin panel (current + new + confirm)
  - Logout button in admin header
- Pushed schema to Neon PostgreSQL (prisma db push)
- Built and deployed successfully to Vercel
- Tested all APIs: services, login, forgot-password, change-password, available-slots

Stage Summary:
- Site is live at https://my-project-sigma-three-41.vercel.app/
- All APIs working correctly with Neon PostgreSQL
- Admin login with password 'aflow2024' works
- Forgot password generates reset code and allows recovery
- Change password works from admin panel
- GitHub: https://github.com/yoyaxu/omani-barbershop
