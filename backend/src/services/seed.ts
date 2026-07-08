import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

let seeded = false

export async function ensureSeed(prisma: PrismaClient): Promise<void> {
  if (seeded) return
  try {
    const adminEmail = 'gvelizm@sopraval.cl'
    const exists = await prisma.user.findUnique({ where: { email: adminEmail } })
    if (exists) {
      seeded = true
      return
    }

    const hash = (p: string) => bcrypt.hash(p, 10)
    const adminPass = process.env.SEED_ADMIN_PASSWORD ?? 'Admin2026!'
    const defaultPass = process.env.SEED_DEFAULT_PASSWORD ?? 'Sopraval2026'
    const users = [
      { email: adminEmail, nombre: 'Gino Véliz', cargo: 'Ingeniero Confiabilidad', area: 'Mantenimiento', role: Role.ADMIN, pass: adminPass },
      { email: 'rabarzua@sopraval.cl', nombre: 'R. Abarzúa', cargo: 'Gerente Planta', area: 'Gerencia', role: Role.GERENTE, pass: defaultPass },
      { email: 'fescobara@sopraval.cl', nombre: 'F. Escobar', cargo: 'Coordinador Mantenimiento', area: 'Mantenimiento', role: Role.MANTENIMIENTO, pass: defaultPass },
      { email: 'cmadridp@sopraval.cl', nombre: 'C. Madrid', cargo: 'Técnico Mantenimiento', area: 'Mantenimiento', role: Role.MANTENIMIENTO, pass: defaultPass },
      { email: 'trabajador1@sopraval.cl', nombre: 'Juan Pérez', cargo: 'Operario', area: 'A', role: Role.USER, pass: defaultPass },
    ]

    for (const u of users) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          email: u.email,
          nombre: u.nombre,
          cargo: u.cargo,
          area: u.area,
          role: u.role,
          password: await hash(u.pass),
          mustChangePass: true,
        },
      })
    }
    seeded = true
    console.log('Seed inicial completado (5 usuarios)')
  } catch (err) {
    console.error('ensureSeed fallo (se ignora):', err)
  }
}
