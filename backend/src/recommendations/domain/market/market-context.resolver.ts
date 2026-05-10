/**
 * 市场上下文解析器
 * 
 * 功能：
 * 1. 解析市场上下文：polymarket
 * 2. 返回市场上下文
 */
import { Injectable } from '@nestjs/common'

import { PolymarketClient } from '../../clients/polymarket.client'
import { buildSearchQueries } from '../../query-builder'
import {
  type MarketContext,
  type RecommendationRequest
} from '../../types/recommendations'

@Injectable()
export class MarketContextResolverService {
  constructor (private readonly polymarketClient: PolymarketClient) {}

  async resolveMarket (request: RecommendationRequest): Promise<MarketContext> {
    if (request.market_id) {
      const market = await this.polymarketClient.fetchMarket(request.market_id)

      if (request.market_question) {
        market.question = request.market_question
      }

      if (request.market_description) {
        market.description = request.market_description
      }

      if (request.resolution_source) {
        market.resolutionSource = request.resolution_source
      }

      market.searchQueries = buildSearchQueries({
        question: market.question,
        description: market.description,
        resolutionSource: market.resolutionSource
      })

      return market
    }

    return {
      question: request.market_question ?? '',
      description: request.market_description,
      resolutionSource: request.resolution_source,
      searchQueries: buildSearchQueries({
        question: request.market_question ?? '',
        description: request.market_description,
        resolutionSource: request.resolution_source
      })
    }
  }
}
