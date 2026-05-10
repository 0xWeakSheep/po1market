import { Injectable } from '@nestjs/common'

import { PolymarketClient } from '../../clients/polymarket.client'
import type { RecommendationRequest } from '../../types/recommendations'

type QueryMarketInput = {
  question: string
  description?: string
  resolutionSource?: string
}

@Injectable()
export class QueryMarketProvider {
  constructor (private readonly polymarketClient: PolymarketClient) {}

  async resolveQueryMarketInput (request: RecommendationRequest): Promise<QueryMarketInput> {
    if (request.market_id) {
      const market = await this.polymarketClient.fetchMarket(request.market_id)
      return {
        question: request.market_question ?? market.question,
        description: request.market_description ?? market.description,
        resolutionSource: request.resolution_source ?? market.resolutionSource
      }
    }

    return {
      question: request.market_question ?? '',
      description: request.market_description,
      resolutionSource: request.resolution_source
    }
  }
}
