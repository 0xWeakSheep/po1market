import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { HealthModule } from './health/health.module'
import { RecommendationsModule } from './recommendations/recommendations.module'

@Module({
  imports: [HealthModule, RecommendationsModule],
  controllers: [AppController]
})
export class AppModule {}
