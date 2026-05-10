import { Module } from '@nestjs/common'

import { SETTINGS } from '../common/constants'
import { getSettings } from '../config/settings'
import { OpenAiClient } from './clients/openai.client'
import { PolymarketClient } from './clients/polymarket.client'
import { SearchClient } from './clients/search.client'
import { MarketContextResolverService } from './domain/market/market-context.resolver'
import { QueryController } from './query/api/query.controller'
import { QueryService } from './query/domain/query.service'
import { QueryMarketProvider } from './query/integration/query-market.provider'
import { RecommendationsController } from './recommendations.controller'
import { RecommendationsService } from './recommendations.service'
import { ScoringService } from './scoring.service'

@Module({
  controllers: [RecommendationsController, QueryController],
  providers: [
    { provide: SETTINGS, useFactory: getSettings },
    PolymarketClient,
    SearchClient,
    OpenAiClient,
    QueryMarketProvider,
    QueryService,
    MarketContextResolverService,
    ScoringService,
    RecommendationsService
  ]
})
export class RecommendationsModule {}
