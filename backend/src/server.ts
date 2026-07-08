import { build } from './app'

const PORT = Number(process.env.PORT ?? 3001)

build().then(async (server) => {
  try {
    await server.listen({ port: PORT, host: '0.0.0.0' })
    console.log(`Backend corriendo en http://localhost:${PORT}`)
    console.log(`Swagger UI en http://localhost:${PORT}/docs`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
})
