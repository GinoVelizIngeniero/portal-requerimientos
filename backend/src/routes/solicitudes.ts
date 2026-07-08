import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { EstadoSolicitud, MotivoSolicitud, Role } from '@prisma/client'
import { requireAuth } from '../middleware/auth'

const createSchema = z.object({
  titulo: z.string().min(3),
  descripcion: z.string().min(10),
  area: z.string().min(1),
  subArea: z.string().optional(),
  motivo: z.nativeEnum(MotivoSolicitud),
  fotografia: z.string().optional(),
})

const updateSchema = z.object({
  estado: z.nativeEnum(EstadoSolicitud).optional(),
  costoEstimado: z.number().optional(),
  notasMantenimiento: z.string().optional(),
  comentarioGerente: z.string().optional(),
  assignedToId: z.string().optional(),
})

export const solicitudesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', requireAuth)

  async function canAccessSolicitud(
    user: { sub: string; role: Role },
    sol: { creatorId: string; assignedToId: string | null; area: string }
  ): Promise<boolean> {
    if (user.role === Role.ADMIN || user.role === Role.GERENTE) return true
    if (user.role === Role.USER) return sol.creatorId === user.sub
    const u = await fastify.prisma.user.findUnique({ where: { id: user.sub } })
    if (user.role === Role.JEFE_AREA || user.role === Role.SUPERVISOR) {
      return sol.area === (u?.area ?? '')
    }
    if (user.role === Role.MANTENIMIENTO) {
      if (u?.cargo?.toLowerCase().includes('coordinador')) return true
      return sol.assignedToId === user.sub
    }
    return false
  }

  fastify.get('/', async (request) => {
    const user = request.user as { sub: string; role: Role; email: string }

    const where: Record<string, unknown> = {}

    if (user.role === Role.USER) {
      where.creatorId = user.sub
    } else if (user.role === Role.JEFE_AREA || user.role === Role.SUPERVISOR) {
      const u = await fastify.prisma.user.findUnique({ where: { id: user.sub } })
      where.area = u?.area ?? ''
    } else if (user.role === Role.MANTENIMIENTO) {
      const u = await fastify.prisma.user.findUnique({ where: { id: user.sub } })
      if (!u?.cargo?.toLowerCase().includes('coordinador')) {
        where.assignedToId = user.sub
      }
    }

    const solicitudes = await fastify.prisma.solicitud.findMany({
      where,
      include: {
        creator: { select: { nombre: true, email: true, area: true } },
        assignedTo: { select: { nombre: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return solicitudes
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const user = request.user as { sub: string; role: Role }
    const sol = await fastify.prisma.solicitud.findUnique({
      where: { id },
      include: {
        creator: { select: { nombre: true, email: true, area: true } },
        assignedTo: { select: { nombre: true, email: true } },
      },
    })
    if (!sol) return reply.code(404).send({ error: 'No encontrada' })
    if (!(await canAccessSolicitud(user, sol))) {
      return reply.code(403).send({ error: 'Sin permisos' })
    }
    return sol
  })

  fastify.post('/', async (request, reply) => {
    const user = request.user as { sub: string }
    const body = createSchema.safeParse(request.body)
    if (!body.success) return reply.code(400).send({ error: 'Datos inválidos', details: body.error.flatten() })

    const sol = await fastify.prisma.solicitud.create({
      data: { ...body.data, creatorId: user.sub },
      include: { creator: { select: { nombre: true, email: true } } },
    })

    return reply.code(201).send(sol)
  })

  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const user = request.user as { sub: string; role: Role }
    const body = updateSchema.safeParse(request.body)
    if (!body.success) return reply.code(400).send({ error: 'Datos inválidos' })

    const isMant = user.role === Role.MANTENIMIENTO
    const isGerencia = user.role === Role.GERENTE || user.role === Role.ADMIN
    if (!isMant && !isGerencia) {
      return reply.code(403).send({ error: 'Sin permisos para modificar la solicitud' })
    }

    const decisionEstados: EstadoSolicitud[] = [
      EstadoSolicitud.AUTORIZADA,
      EstadoSolicitud.POSTERGADA,
      EstadoSolicitud.RECHAZADA,
    ]
    const tocaCamposGerencia =
      body.data.comentarioGerente !== undefined ||
      (body.data.estado !== undefined && decisionEstados.includes(body.data.estado))
    if (tocaCamposGerencia && !isGerencia) {
      return reply.code(403).send({ error: 'Solo Gerencia puede autorizar, postergar o rechazar' })
    }

    const existing = await fastify.prisma.solicitud.findUnique({ where: { id } })
    if (!existing) return reply.code(404).send({ error: 'No encontrada' })
    if (!(await canAccessSolicitud(user, existing))) {
      return reply.code(403).send({ error: 'Sin permisos' })
    }

    const sol = await fastify.prisma.solicitud.update({
      where: { id },
      data: body.data,
      include: {
        creator: { select: { nombre: true, email: true } },
        assignedTo: { select: { nombre: true, email: true } },
      },
    })

    return sol
  })

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const user = request.user as { sub: string; role: Role }

    const sol = await fastify.prisma.solicitud.findUnique({ where: { id } })
    if (!sol) return reply.code(404).send({ error: 'No encontrada' })

    if (sol.creatorId !== user.sub && user.role !== Role.ADMIN) {
      return reply.code(403).send({ error: 'Sin permisos' })
    }

    await fastify.prisma.solicitud.delete({ where: { id } })
    return { ok: true }
  })

  fastify.get('/stats/resumen', async () => {
    const [total, pendientes, valorizadas, autorizadas, postergadas, rechazadas] = await Promise.all([
      fastify.prisma.solicitud.count(),
      fastify.prisma.solicitud.count({ where: { estado: 'PENDIENTE' } }),
      fastify.prisma.solicitud.count({ where: { estado: 'VALORIZADA' } }),
      fastify.prisma.solicitud.count({ where: { estado: 'AUTORIZADA' } }),
      fastify.prisma.solicitud.count({ where: { estado: 'POSTERGADA' } }),
      fastify.prisma.solicitud.count({ where: { estado: 'RECHAZADA' } }),
    ])
    return { total, pendientes, valorizadas, autorizadas, postergadas, rechazadas }
  })
}
