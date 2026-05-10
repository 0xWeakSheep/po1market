import { QueryService } from './query.service'

describe('QueryService', () => {
  it('resolveQueries 在有 market_id 时优先使用用户覆盖字段', async () => {
    const queryMarketProvider = {
      resolveQueryMarketInput: jest.fn().mockResolvedValue({
        marketId: 'm1',
        question: 'Will BTC close above 120k this month?',
        description: 'Polymarket description',
        resolutionSource: 'https://polymarket.com/source',
        endDate: new Date('2026-12-31T00:00:00.000Z')
      })
    }

    const service = new QueryService(queryMarketProvider as any)
    const result = await service.resolveQueries({
      market_id: 'm1',
      market_question: 'Will BTC close above 120k this month?'
    })

    expect(queryMarketProvider.resolveQueryMarketInput).toHaveBeenCalledWith({
      market_id: 'm1',
      market_question: 'Will BTC close above 120k this month?'
    })
    expect(result.question).toBe('Will BTC close above 120k this month?')
    expect(result.searchQueries.length).toBeGreaterThan(0)
  })

  it('resolveMarketContext 返回推荐链路需要的完整上下文', async () => {
    const queryMarketProvider = {
      resolveQueryMarketInput: jest.fn().mockResolvedValue({
        marketId: 'm2',
        question: 'Will ETH reach 10k?',
        description: 'ETH target market',
        resolutionSource: 'https://example.com/source',
        endDate: new Date('2026-08-01T00:00:00.000Z')
      })
    }

    const service = new QueryService(queryMarketProvider as any)
    const marketContext = await service.resolveMarketContext({
      market_id: 'm2'
    })

    expect(marketContext.marketId).toBe('m2')
    expect(marketContext.question).toBe('Will ETH reach 10k?')
    expect(marketContext.searchQueries.length).toBeGreaterThan(0)
  })

  it('buildQueries 会追加 official source 查询词', () => {
    const service = new QueryService({ resolveQueryMarketInput: jest.fn() } as any)
    const queries = service.buildQueries({
      question: 'Will Trump tweet today?',
      resolutionSource: 'https://truthsocial.com'
    })

    expect(queries[0]).toBe('Will Trump tweet today?')
    expect(queries.some((query) => query.includes('official source'))).toBe(true)
  })
})
