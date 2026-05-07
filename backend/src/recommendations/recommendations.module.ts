import { Module } from '@nestjs/common'

import { SETTINGS } from '../common/constants'
import { getSettings } from '../config/settings'
import { OpenAiClient } from './clients/openai.client'
import { PolymarketClient } from './clients/polymarket.client'
import { SearchClient } from './clients/search.client'
import { RecommendationsController } from './recommendations.controller'
import { RecommendationsService } from './recommendations.service'
import { ScoringService } from './scoring.service'

@Module({
  controllers: [RecommendationsController],
  providers: [
    { provide: SETTINGS, useFactory: getSettings },
    PolymarketClient,
    SearchClient,
    OpenAiClient,
    ScoringService,
    RecommendationsService
  ]
})
export class RecommendationsModule {}
