import { Inject, Injectable } from '@nestjs/common'

import { SETTINGS } from '../common/constants'
import type { Settings } from '../config/settings'
import { PolymarketClient } from './clients/polymarket.client'
import { SearchClient } from './clients/search.client'
import { buildSearchQueries } from './query-builder'
import { ScoringService } from './scoring.service'
import {
  type MarketContext,
  type RecommendationRequest,
  type RecommendationResponse
} from './types/recommendations'

export function normalizeRequest (request: RecommendationRequest, settings: Settings): RecommendationRequest {
  return {
    ...request,
    max_results: request.max_results ?? settings.marketDefaultLimit,
    candidate_limit: request.candidate_limit ?? settings.marketCandidateLimit,
    include_rejected: request.include_rejected ?? false
  }
}

@Injectable()
export class RecommendationsService {
  constructor (
    @Inject(SETTINGS) private readonly settings: Settings,
    private readonly polymarketClient: PolymarketClient,
    private readonly searchClient: SearchClient,
    private readonly scoringService: ScoringService
  ) {}

  async recommend (request: RecommendationRequest): Promise<RecommendationResponse> {
    const normalizedRequest = normalizeRequest(request, this.settings)
    const market = await this.resolveMarket(normalizedRequest)
    const candidates = await this.searchClient.gatherCandidates({
      queries: market.searchQueries,
      resolutionSource: market.resolutionSource,
      candidateLimit: normalizedRequest.candidate_limit ?? this.settings.marketCandidateLimit
    })

    const scoredCandidates = await this.scoringService.scoreCandidates(market, candidates)
    const recommended = scoredCandidates
      .filter((candidate) => !candidate.stale)
      .slice(0, normalizedRequest.max_results ?? this.settings.marketDefaultLimit)

    return {
      recommended_sources: recommended.map((candidate) => ({
        url: candidate.url,
        score: 0
      }))
    }
  }

  private async resolveMarket (request: RecommendationRequest): Promise<MarketContext> {
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
