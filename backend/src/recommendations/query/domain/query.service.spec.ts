import { QueryService } from './query.service'

describe('QueryService', () => {
  it('resolveQueries 在有 market_id 时优先使用用户覆盖字段', async () => {
    const queryMarketProvider = {
      resolveQueryMarketInput: jest.fn().mockResolvedValue({
        question: 'Will BTC close above 120k this month?',
        description: 'Polymarket description',
        resolutionSource: 'https://polymarket.com/source'
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
