import { FastifyPluginAsync } from 'fastify'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const changePassSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/login', async (request, reply) => {
    const body = loginSchema.safeParse(request.body)
    if (!body.success) return reply.code(400).send({ error: 'Datos inválidos' })

    const { email, password } = body.data
    const user = await fastify.prisma.user.findUnique({ where: { email } })

    if (!user || !user.active) return reply.code(401).send({ error: 'Credenciales incorrectas' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return reply.code(401).send({ error: 'Credenciales incorrectas' })

    const payload = { sub: user.id, email: user.email, role: user.role, nombre: user.nombre }
    const accessToken = fastify.jwt.sign(payload, { expiresIn: '15m' })
    const refreshToken = fastify.jwt.sign({ sub: user.id, email: user.email, role: user.role, nombre: user.nombre }, { expiresIn: '7d' })

    await fastify.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        role: user.role,
        cargo: user.cargo,
        area: user.area,
        mustChangePass: user.mustChangePass,
      },
    }
  })

  fastify.post('/refresh', async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken?: string }
    if (!refreshToken) return reply.code(400).send({ error: 'Token requerido' })

    const stored = await fastify.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })

    if (!stored || stored.expiresAt < new Date()) {
      return reply.code(401).send({ error: 'Token inválido o expirado' })
    }

    const payload = {
      sub: stored.user.id,
      email: stored.user.email,
      role: stored.user.role,
      nombre: stored.user.nombre,
    }
    const accessToken = fastify.jwt.sign(payload, { expiresIn: '15m' })

    return { accessToken }
  })

  fastify.post('/logout', async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken?: string }
    if (refreshToken) {
      await fastify.prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
    }
    return { ok: true }
  })

  fastify.post('/change-password', {
    preHandler: [async (req, rep) => { try { await req.jwtVerify() } catch { rep.code(401).send({ error: 'No autenticado' }) } }],
  }, async (request, reply) => {
    const body = changePassSchema.safeParse(request.body)
    if (!body.success) return reply.code(400).send({ error: 'Datos inválidos' })

    const userId = (request.user as { sub: string }).sub
    const user = await fastify.prisma.user.findUnique({ where: { id: userId } })
    if (!user) return reply.code(404).send({ error: 'Usuario no encontrado' })

    const valid = await bcrypt.compare(body.data.currentPassword, user.password)
    if (!valid) return reply.code(400).send({ error: 'Contraseña actual incorrecta' })

    const hashed = await bcrypt.hash(body.data.newPassword, 10)
    await fastify.prisma.user.update({
      where: { id: userId },
      data: { password: hashed, mustChangePass: false },
    })

    await fastify.prisma.refreshToken.deleteMany({ where: { userId } })

    return { ok: true }
  })

  fastify.get('/me', {
    preHandler: [async (req, rep) => { try { await req.jwtVerify() } catch { rep.code(401).send({ error: 'No autenticado' }) } }],
  }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub
    const user = await fastify.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, nombre: true, role: true, cargo: true, area: true, mustChangePass: true, active: true },
    })
    if (!user || !user.active) return reply.code(401).send({ error: 'Usuario no válido' })
    const { active, ...safe } = user
    return safe
  })
}
