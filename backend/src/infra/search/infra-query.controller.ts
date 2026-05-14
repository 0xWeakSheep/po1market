import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post
} from '@nestjs/common'

import type { RecommendationRequest } from '../../recommendations/types/recommendations'
import { InfraQueryService } from './infra-query.service'

@Controller('api/v1/search')
export class InfraQueryController {
  constructor (private readonly infraQueryService: InfraQueryService) {}

  @Post('queries')
  @HttpCode(HttpStatus.OK)
  async create (@Body() payload: RecommendationRequest) {
    if (!payload?.market_id && !payload?.market_question) {
      throw new BadRequestException(
        'Either market_id or market_question must be provided.'
      )
    }

    return await this.infraQueryService.resolveQueries(payload)
  }
}
