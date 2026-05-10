/**
 * 市场上下文解析器
 * 
 * 功能：
 * 1. 解析市场上下文：polymarket
 * 2. 返回市场上下文
 */
import { Injectable } from '@nestjs/common'

import { PolymarketClient } from '../../clients/polymarket.client'
import { QueryService } from '../../query/domain/query.service'
import {
  type MarketContext,
  type RecommendationRequest
} from '../../types/recommendations'

@Injectable()
export class MarketContextResolverService {
  constructor (
    private readonly polymarketClient: PolymarketClient,
    private readonly queryService: QueryService
  ) {}

  /**
   * 解析市场上下文
   * 
   * 输入：
   * 1. 请求
   * 
   * 输出：
   * 1. 市场上下文
   */
  async resolveMarket (request: RecommendationRequest): Promise<MarketContext> {
    //如果是market_id，则从polymarket获取市场上下文
    if (request.market_id) {
      const market = await this.polymarketClient.fetchMarket(request.market_id)
      market.question = request.market_question ?? market.question
      market.description = request.market_description ?? market.description
      market.resolutionSource = request.resolution_source ?? market.resolutionSource
      market.searchQueries = this.queryService.buildQueries({
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
      searchQueries: this.queryService.buildQueries({
        question: request.market_question ?? '',
        description: request.market_description,
        resolutionSource: request.resolution_source
      })
    }
  }
}
