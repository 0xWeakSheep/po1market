import type { Settings } from '../../config/settings'
import type { RecommendationRequest } from '../types/recommendations'

export function normalizeRequest (
  request: RecommendationRequest,
  settings: Settings
): RecommendationRequest {
  return {
    ...request,
    max_results: request.max_results ?? settings.marketDefaultLimit,
    candidate_limit: request.candidate_limit ?? settings.marketCandidateLimit,
    include_rejected: request.include_rejected ?? false
  }
}
