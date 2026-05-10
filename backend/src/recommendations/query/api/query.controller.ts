import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post
} from '@nestjs/common'

import { QueryService } from '../domain/query.service'
import type { RecommendationRequest } from '../../types/recommendations'

@Controller('api/v1/search')
export class QueryController {
  constructor (private readonly queryService: QueryService) {}

  @Post('queries')
  @HttpCode(HttpStatus.OK)
  async create (@Body() payload: RecommendationRequest) {
    if (!payload?.market_id && !payload?.market_question) {
      throw new BadRequestException(
        'Either market_id or market_question must be provided.'
      )
    }

    return await this.queryService.resolveQueries(payload)
  }
}
