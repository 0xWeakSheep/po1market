import { Injectable } from '@nestjs/common'

import { buildSearchQueries } from './query-builder'
import { QueryMarketProvider } from '../integration/query-market.provider'
import type {
  MarketContext,
  QueryPreviewResponse,
  RecommendationRequest
} from '../../types/recommendations'

@Injectable()
export class QueryService {
  constructor (private readonly queryMarketProvider: QueryMarketProvider) {}

  buildQueries (input: {
    question: string
    description?: string
    resolutionSource?: string
  }): string[] {
    return buildSearchQueries({
      question: input.question,
      description: input.description,
      resolutionSource: input.resolutionSource
    })
  }

  async resolveQueries (request: RecommendationRequest): Promise<QueryPreviewResponse> {
    const queryMarketInput = await this.queryMarketProvider.resolveQueryMarketInput(request)

    return {
      question: queryMarketInput.question,
      description: queryMarketInput.description,
      resolutionSource: queryMarketInput.resolutionSource,
      searchQueries: this.buildQueries(queryMarketInput)
    }
  }

  async resolveMarketContext (request: RecommendationRequest): Promise<MarketContext> {
    const queryMarketInput = await this.queryMarketProvider.resolveQueryMarketInput(request)

    return {
      marketId: queryMarketInput.marketId,
      question: queryMarketInput.question,
      description: queryMarketInput.description,
      resolutionSource: queryMarketInput.resolutionSource,
      endDate: queryMarketInput.endDate,
      searchQueries: this.buildQueries(queryMarketInput)
    }
  }
}
