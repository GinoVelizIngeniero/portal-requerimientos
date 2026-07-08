import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { prismaPlugin } from './plugins/prisma'
import { authRoutes } from './routes/auth'
import { solicitudesRoutes } from './routes/solicitudes'
import { usersRoutes } from './routes/users'

const isProd = process.env.NODE_ENV === 'production'

if (isProd && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET es obligatorio en producción. Configúralo antes de desplegar.')
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me'

const allowedOrigins = (origin: string | undefined, cb: (err: Error | null, allow: boolean) => void) => {
  if (!origin) return cb(null, true)
  const ok =
    /^http:\/\/localhost:\d+$/.test(origin) ||
    /\.vercel\.app$/.test(origin) ||
    (process.env.FRONTEND_URL ? origin === process.env.FRONTEND_URL : false)
  cb(null, ok)
}

export async function build(): Promise<FastifyInstance> {
  const app = Fastify({ logger: { level: isProd ? 'warn' : 'info' } })

  await app.register(cors, { origin: allowedOrigins, credentials: true })
  await app.register(jwt, { secret: JWT_SECRET })
  await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } })

  await app.register(swagger, {
    openapi: {
      info: { title: 'Portal Requerimientos API', version: '1.0.0' },
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
    },
  })
  await app.register(swaggerUi, { routePrefix: '/docs' })

  await app.register(prismaPlugin)

  await app.register(authRoutes, { prefix: '/api/auth' })
  await app.register(solicitudesRoutes, { prefix: '/api/solicitudes' })
  await app.register(usersRoutes, { prefix: '/api/users' })

  app.get('/api/health', async () => ({ status: 'ok', ts: new Date().toISOString() }))

  return app
}
