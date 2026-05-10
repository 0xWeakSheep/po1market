import { Injectable } from '@nestjs/common'

import { QueryService } from '../../query/domain/query.service'
import type {
  CandidateSource,
  MarketContext,
  RecommendationRequest
} from '../../types/recommendations'
import { CandidateRetrieverService } from './candidate-retriever.service'

type RetrievalResult = {
  market: MarketContext
  candidates: CandidateSource[]
}

@Injectable()
export class RetrievalService {
  constructor (
    private readonly queryService: QueryService,
    private readonly candidateRetriever: CandidateRetrieverService
  ) {}

  async retrieve (input: {
    request: RecommendationRequest
    candidateLimit?: number
  }): Promise<RetrievalResult> {
    const market = await this.queryService.resolveMarketContext(input.request)
    const candidates = await this.candidateRetriever.retrieve({
      market,
      candidateLimit: input.candidateLimit
    })

    return { market, candidates }
  }
}
