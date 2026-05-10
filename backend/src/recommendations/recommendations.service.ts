/**
 * 推荐服务
 * 
 * 功能：
 * 1. 标准化请求
 * 2. 解析市场上下文
 * 3. 收集候选源
 * 4. 打分
 * 5. 返回推荐链接列表
 */
import { Inject, Injectable } from '@nestjs/common'

import { SETTINGS } from '../common/constants'
import type { Settings } from '../config/settings'
import { normalizeRequest } from './application/normalize-request'
import { RetrievalService } from './retrieval/domain/retrieval.service'
import { ScoringService } from './scoring.service'
import {
  type RecommendationRequest,
  type RecommendationResponse
} from './types/recommendations'

@Injectable()
export class RecommendationsService {
  constructor (
    @Inject(SETTINGS) private readonly settings: Settings,
    private readonly retrievalService: RetrievalService,
    private readonly scoringService: ScoringService
  ) {}

  async recommend (request: RecommendationRequest): Promise<RecommendationResponse> {
    console.log('[backend]recommend', request)
    //标准化请求
    const normalizedRequest = normalizeRequest(request, this.settings)
    console.log('[backend]normalizedRequest', normalizedRequest)
    const retrievalResult = await this.retrievalService.retrieve({
      request: normalizedRequest,
      candidateLimit: normalizedRequest.candidate_limit ?? this.settings.marketCandidateLimit
    })
    console.log('[backend]market', retrievalResult.market)
    console.log('[backend]candidates', retrievalResult.candidates)

    const scoredCandidates = await this.scoringService.scoreCandidates(
      retrievalResult.market,
      retrievalResult.candidates
    )
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
