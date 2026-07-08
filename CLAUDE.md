# Portal de Requerimientos — Sopraval Planta La Calera

Portal web para gestión de solicitudes de infraestructura con flujo de aprobación por roles.

## Stack

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
| Auth | JWT (access 15m + refresh 7d) |
| Deploy | Vercel (frontend + backend serverless) + Neon PostgreSQL |

## Flujo de negocio

Solicitud: PENDIENTE -> VALORIZADA (Mantenimiento agrega costo) -> AUTORIZADA/POSTERGADA/RECHAZADA (Gerencia decide)

## Setup local

```bash
cd backend && cp .env.example .env && npm install && npx prisma db push && npm run dev
cd frontend && cp .env.example .env && npm install && npm run dev
```

## Deploy Vercel

- Backend: proyecto separado con Root Directory = `backend`, Framework = Other
- Frontend: proyecto separado con Root Directory = `frontend`, Framework = Vite

## Usuarios seed

| Email | Contraseña | Rol |
|-------|-----------|-----|
| gvelizm@sopraval.cl | Admin2026! | ADMIN |
| rabarzua@sopraval.cl | Sopraval2026 | GERENTE |
| fescobara@sopraval.cl | Sopraval2026 | MANTENIMIENTO |
| cmadridp@sopraval.cl | Sopraval2026 | MANTENIMIENTO |
| trabajador1@sopraval.cl | Sopraval2026 | USER |
