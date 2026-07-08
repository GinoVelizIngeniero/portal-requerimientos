# Contexto de Migración — Portal de Requerimientos Sopraval

## Objetivo
Migrar el Portal de Necesidades/Requerimientos de Firebase (https://portal-necesidades-la-calera.firebaseapp.com/) a una arquitectura moderna con Vercel + Neon + GitHub, separado como proyecto individual para presentar a TI.

## Estado actual

### Ya completado
- Repo GitHub: https://github.com/GinoVelizIngeniero/portal-requerimientos
- Backend deployado en Vercel: https://portal-requerimientos-api.vercel.app
- Frontend deployado en Vercel: https://portal-requerimientos-web.vercel.app
- Base de datos Neon: proyecto `portal-requerimientos` (PostgreSQL, us-east-1)
- Auth JWT funcionando (access 15m + refresh 7d)
- Seed de 5 usuarios funcionando
- Flujo completo: PENDIENTE > VALORIZADA > AUTORIZADA/POSTERGADA/RECHAZADA

### Pendiente
- **El frontend actual NO replica la UI del proyecto Firebase original**. Se necesita ver el proyecto Firebase (https://portal-necesidades-la-calera.firebaseapp.com/) y replicar su estructura visual, navegación y funcionalidades exactas.
- El código fuente del proyecto Firebase original está en el PC local del usuario (no en GitHub)
- Buscar en: `C:\Users\gvelizm\` — posiblemente en subcarpetas de proyectos web/firebase
- También buscar contexto previo en: `C:\Users\gvelizm\.claude\projects\C--Users-gvelizm\memory`

## Arquitectura del proyecto actual

```
portal-requerimientos/
├── backend/                    (Fastify v4 + Prisma + PostgreSQL)
│   ├── src/
│   │   ├── app.ts              (setup Fastify, CORS, JWT, routes)
│   │   ├── server.ts           (entry point local dev)
│   │   ├── middleware/auth.ts  (requireAuth, requireRole + JWT types)
│   │   ├── plugins/prisma.ts   (PrismaClient + auto-seed)
│   │   ├── services/seed.ts    (5 usuarios idempotente)
│   │   └── routes/
│   │       ├── auth.ts         (login, refresh, logout, change-password, /me)
│   │       ├── solicitudes.ts  (CRUD + stats + authorization por rol)
│   │       └── users.ts        (CRUD usuarios, solo ADMIN)
│   ├── prisma/schema.prisma    (User, RefreshToken, Solicitud — sin ADF ni Confiabilidad)
│   ├── api/index.ts            (entry point Vercel serverless)
│   ├── vercel.json             (config Vercel: prisma generate + db push)
│   └── package.json            (bcryptjs, NO bcrypt nativo)
├── frontend/                   (React 19 + Vite + Tailwind)
│   ├── src/
│   │   ├── App.tsx             (rutas: login, change-password, dashboard, solicitudes)
│   │   ├── main.tsx
│   │   ├── index.css           (Tailwind + componentes base)
│   │   ├── store/auth.ts       (Zustand + persist)
│   │   ├── lib/api.ts          (Axios + interceptor JWT refresh)
│   │   ├── components/layout/AppLayout.tsx  (sidebar + topbar)
│   │   └── pages/
│   │       ├── auth/LoginPage.tsx
│   │       ├── auth/ChangePasswordPage.tsx
│   │       ├── DashboardPage.tsx (KPIs + pie chart solicitudes)
│   │       └── solicitudes/
│   │           ├── SolicitudesPage.tsx (tabla + filtros)
│   │           ├── NuevaSolicitudModal.tsx (form con zod)
│   │           └── SolicitudDetailModal.tsx (valorizar + decidir)
│   ├── tailwind.config.js      (brand: blue #1B3580, orange #F07B1B, red #E2231A)
│   └── package.json
└── CLAUDE.md
```

## Stack técnico
| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + TypeScript + Vite + React Router v7 |
| Estado servidor | TanStack Query v5 |
| Estado cliente | Zustand |
| UI | Tailwind CSS v3 + lucide-react |
| Charts | Recharts |
| Formularios | react-hook-form + zod |
| Backend | Fastify v4 + TypeScript |
| ORM | Prisma + PostgreSQL |
| Auth | JWT (access 15m + refresh 7d), bcryptjs |
| Deploy | Vercel (frontend + backend serverless) |
| DB | Neon PostgreSQL |

## Usuarios seed
| Email | Contraseña | Rol |
|-------|-----------|-----|
| gvelizm@sopraval.cl | Admin2026! | ADMIN |
| rabarzua@sopraval.cl | Sopraval2026 | GERENTE |
| fescobara@sopraval.cl | Sopraval2026 | MANTENIMIENTO |
| cmadridp@sopraval.cl | Sopraval2026 | MANTENIMIENTO |
| trabajador1@sopraval.cl | Sopraval2026 | USER |

## Flujo de negocio
1. USER crea solicitud (título, descripción, área, sub-área, motivo)
2. MANTENIMIENTO valoriza (agrega costo estimado + notas técnicas) → estado VALORIZADA
3. GERENTE/ADMIN decide → AUTORIZADA / POSTERGADA / RECHAZADA (con comentario)

## Deploy Vercel — configuración actual
### Backend (portal-requerimientos-api)
- Root Directory: `backend`
- Framework: Other
- Env vars: DATABASE_URL, JWT_SECRET, NODE_ENV=production

### Frontend (portal-requerimientos-web)
- Root Directory: `frontend`
- Framework: Vite
- Env vars: VITE_API_URL=https://portal-requerimientos-api.vercel.app/api

## Problemas conocidos resueltos
- bcrypt nativo falla en Vercel serverless → usar bcryptjs
- Neon cold-start → connect_timeout=15 en DATABASE_URL
- Neon pooler no funciona con prisma db push → usar conexión directa (sin -pooler)
- Vercel serverless necesita outputDirectory → mkdir -p public en buildCommand
- zod 3.23.8 incompatible con @hookform/resolvers → usar zod ^3.24.1

## Próximos pasos
1. **VER el proyecto Firebase original** y replicar su UI exacta en el frontend
2. Buscar el código fuente en `C:\Users\gvelizm\` (proyecto Firebase)
3. Leer contexto previo en `C:\Users\gvelizm\.claude\projects\C--Users-gvelizm\memory`
4. Ajustar frontend para que coincida con el original
5. Después: crear proyecto separado para Portal ADF (segundo proyecto)

## Cuentas y servicios
- GitHub: GinoVelizIngeniero (repos del proyecto) / GinoVeliz (cuenta personal)
- Vercel: ginoavm-8146's projects (hobby plan)
- Neon: proyecto portal-requerimientos en us-east-1
- IMPORTANTE: rotar credenciales expuestas en conversaciones anteriores
