import 'reflect-metadata'
import 'dotenv/config'

import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(AppModule)
  /** 允许的浏览器来源（页面 origin），不是后端自己的地址。逗号分隔多个。未设置或非空字符串时用 true（开发便利）。 */
  const corsRaw = process.env.PO1MARKET_CORS_ORIGIN?.trim()
  const corsOrigin =
    corsRaw !== undefined && corsRaw !== ''
      ? corsRaw.split(',').map((o) => o.trim())
      : true
  app.enableCors({ origin: corsOrigin })
  //默认3001避免与前端冲突
  const port = Number(process.env.PORT ?? 3001)
  await app.listen(port)
}

bootstrap().catch((err) => {
  console.error(err)
  process.exit(1)
})
