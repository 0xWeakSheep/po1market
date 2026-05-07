import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post
} from '@nestjs/common'

import { RecommendationsService } from './recommendations.service'
import type { RecommendationRequest } from './types/recommendations'

@Controller('api/v1')
export class RecommendationsController {
  constructor (private readonly recommendationsService: RecommendationsService) {}

  @Post('recommendations')
  @HttpCode(HttpStatus.OK)
  async create (@Body() payload: RecommendationRequest) {
    if (!payload?.market_id && !payload?.market_question) {
      throw new BadRequestException(
        'Either market_id or market_question must be provided.'
      )
    }

    return await this.recommendationsService.recommend(payload)
  }
}
