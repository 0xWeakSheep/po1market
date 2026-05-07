import { BadRequestException, Inject, Injectable, ServiceUnavailableException } from '@nestjs/common'

import { SETTINGS } from '../../common/constants'
import type { Settings } from '../../config/settings'
import { buildSearchQueries } from '../query-builder'
import type { MarketContext } from '../types/recommendations'

type PolymarketMarketPayload = {
  id?: string | number
  question: string
  description?: string
  resolutionSource?: string
  endDate?: string
}

@Injectable()
export class PolymarketClient {
  constructor (@Inject(SETTINGS) private readonly settings: Settings) {}

  async fetchMarket (marketId: string): Promise<MarketContext> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.settings.requestTimeoutSeconds * 1000)

    const url = `${this.settings.polymarketGammaApi.replace(/\/$/, '')}/markets/${marketId}`

    let response: Response
    try {
      response = await fetch(url, {
        headers: { 'User-Agent': this.settings.userAgent },
        signal: controller.signal
      })
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new ServiceUnavailableException(
          `Polymarket API timed out after ${this.settings.requestTimeoutSeconds}s (market ${marketId}).`
        )
      }

      const cause = err instanceof Error && 'cause' in err
        ? (err as Error & { cause?: { code?: string; message?: string } }).cause
        : undefined
      const code = cause?.code ?? ''
      const upstream = this.settings.polymarketGammaApi.replace(/\/$/, '')
      const detail =
        [code, err instanceof Error ? err.message : 'fetch failed'].filter(Boolean).join(' — ') || 'fetch failed'

      throw new ServiceUnavailableException(
        `Cannot reach Polymarket API at ${upstream} (${detail}). ` +
          'Common causes: firewall/VPN blocking outbound TLS, regional restrictions, or proxy/DNS issues. ' +
          'Workaround: call POST /api/v1/recommendations with only market_question (no market_id) to skip Gamma.'
      )
    } finally {
      clearTimeout(timeout)
    }

    if (!response.ok) {
      throw new BadRequestException(
        `Polymarket returned HTTP ${response.status} for market ${marketId}.`
      )
    }

    try {
      const payload = await response.json() as PolymarketMarketPayload

      return {
        marketId: String(payload.id ?? marketId),
        question: payload.question.trim(),
        description: payload.description ?? undefined,
        resolutionSource: payload.resolutionSource ?? undefined,
        endDate: payload.endDate ? new Date(payload.endDate) : undefined,
        searchQueries: buildSearchQueries({
          question: payload.question.trim(),
          description: payload.description ?? undefined,
          resolutionSource: payload.resolutionSource ?? undefined
        })
      }
    } catch (err: unknown) {
      if (err instanceof BadRequestException) throw err
      const message = err instanceof Error ? err.message : 'Invalid JSON'
      throw new BadRequestException(`Failed to parse Polymarket response for market ${marketId}: ${message}`)
    }
  }
}
