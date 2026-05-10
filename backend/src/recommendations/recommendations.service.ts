import { Inject, Injectable } from '@nestjs/common'

import { SETTINGS } from '../common/constants'
import type { Settings } from '../config/settings'
import { normalizeRequest } from './application/normalize-request'
import { MarketContextResolverService } from './domain/market/market-context.resolver'
import { SearchClient } from './clients/search.client'
import { ScoringService } from './scoring.service'
import {
  type RecommendationRequest,
  type RecommendationResponse
} from './types/recommendations'

@Injectable()
export class RecommendationsService {
  constructor (
    @Inject(SETTINGS) private readonly settings: Settings,
    private readonly marketContextResolver: MarketContextResolverService,
    private readonly searchClient: SearchClient,
    private readonly scoringService: ScoringService
  ) {}

  async recommend (request: RecommendationRequest): Promise<RecommendationResponse> {
    const normalizedRequest = normalizeRequest(request, this.settings)
    const market = await this.marketContextResolver.resolveMarket(normalizedRequest)

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
}
