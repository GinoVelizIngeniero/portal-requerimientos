import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'
import { requireAuth, requireRole } from '../middleware/auth'

const createSchema = z.object({
  email: z.string().email(),
  nombre: z.string().min(2),
  cargo: z.string().optional(),
  area: z.string().optional(),
  role: z.nativeEnum(Role),
  password: z.string().min(6).default('Sopraval2026'),
})

export const usersRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', requireAuth)

  fastify.get('/', { preHandler: [requireRole(Role.ADMIN, Role.GERENTE)] }, async () => {
    return fastify.prisma.user.findMany({
      select: { id: true, email: true, nombre: true, cargo: true, area: true, role: true, active: true, createdAt: true },
      orderBy: { nombre: 'asc' },
    })
  })

  fastify.post('/', { preHandler: [requireRole(Role.ADMIN)] }, async (request, reply) => {
    const body = createSchema.safeParse(request.body)
    if (!body.success) return reply.code(400).send({ error: 'Datos inválidos', details: body.error.flatten() })

    const exists = await fastify.prisma.user.findUnique({ where: { email: body.data.email } })
    if (exists) return reply.code(409).send({ error: 'Email ya registrado' })

    const user = await fastify.prisma.user.create({
      data: {
        ...body.data,
        password: await bcrypt.hash(body.data.password, 10),
        mustChangePass: true,
      },
      select: { id: true, email: true, nombre: true, role: true, cargo: true, area: true },
    })

    return reply.code(201).send(user)
  })

  fastify.patch('/:id', { preHandler: [requireRole(Role.ADMIN)] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = request.body as { role?: Role; active?: boolean; cargo?: string; area?: string }

    const user = await fastify.prisma.user.update({
      where: { id },
      data: body,
      select: { id: true, email: true, nombre: true, role: true, cargo: true, area: true, active: true },
    })

    return user
  })

  fastify.delete('/:id', { preHandler: [requireRole(Role.ADMIN)] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.user.update({ where: { id }, data: { active: false } })
    return { ok: true }
  })
}
