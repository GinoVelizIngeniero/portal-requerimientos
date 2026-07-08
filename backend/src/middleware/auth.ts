import { FastifyRequest, FastifyReply } from 'fastify'
import { Role } from '@prisma/client'

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch {
    return reply.code(401).send({ error: 'Token inválido o expirado' })
  }
}

export function requireRole(...roles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply)
    if (reply.sent) return
    const user = request.user as { role: Role }
    if (!roles.includes(user.role)) {
      return reply.code(403).send({ error: 'Sin permisos para esta acción' })
    }
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; email: string; role: Role; nombre: string }
    user: { sub: string; email: string; role: Role; nombre: string }
  }
}
