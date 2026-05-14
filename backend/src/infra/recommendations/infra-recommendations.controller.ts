import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post
} from '@nestjs/common'

import type { RecommendationRequest } from '../../recommendations/types/recommendations'
import { InfraRecommendationsService } from './infra-recommendations.service'

@Controller('api/v1')
export class InfraRecommendationsController {
  constructor (
    private readonly infraRecommendationsService: InfraRecommendationsService
  ) {}

  @Post('recommendations')
  @HttpCode(HttpStatus.OK)
  async create (@Body() payload: RecommendationRequest) {
    if (!payload?.market_id && !payload?.market_question) {
      throw new BadRequestException(
        'Either market_id or market_question must be provided.'
      )
    }

    return await this.infraRecommendationsService.recommend(payload)
  }
}
