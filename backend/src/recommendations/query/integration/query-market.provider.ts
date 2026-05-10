import { Injectable } from '@nestjs/common'

import { PolymarketClient } from '../../clients/polymarket.client'
import type {
  MarketContext,
  RecommendationRequest
} from '../../types/recommendations'

type QueryMarketInput = Omit<MarketContext, 'searchQueries'> & {
  question: string
}

@Injectable()
export class QueryMarketProvider {
  constructor (private readonly polymarketClient: PolymarketClient) {}

  async resolveQueryMarketInput (request: RecommendationRequest): Promise<QueryMarketInput> {
    if (request.market_id) {
      const market = await this.polymarketClient.fetchMarket(request.market_id)
      return {
        marketId: market.marketId,
        question: request.market_question ?? market.question,
        description: request.market_description ?? market.description,
        resolutionSource: request.resolution_source ?? market.resolutionSource,
        endDate: market.endDate
      }
    }

    return {
      question: request.market_question ?? '',
      description: request.market_description,
      resolutionSource: request.resolution_source
    }
  }
}
