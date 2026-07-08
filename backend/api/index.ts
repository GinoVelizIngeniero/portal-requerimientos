import { build } from '../src/app'

let app: Awaited<ReturnType<typeof build>> | null = null

export default async function handler(req: any, res: any) {
  if (!app) {
    app = await build()
    await app.ready()
  }
  app.server.emit('request', req, res)
}
