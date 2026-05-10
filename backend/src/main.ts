import 'reflect-metadata'

import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(AppModule)
  app.enableCors({
    origin: process.env.PO1MARKET_CORS_ORIGIN?.split(',').map((o) => o.trim()) ?? true
  })
  //默认3001避免与前端冲突
  const port = Number(process.env.PORT ?? 3001)
  await app.listen(port)
}

bootstrap().catch((err) => {
  console.error(err)
  process.exit(1)
})
