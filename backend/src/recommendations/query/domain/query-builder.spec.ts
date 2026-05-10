import { buildSearchQueries, inferUrgency } from './query-builder'

describe('查询构建器', () => {
  it('buildSearchQueries 保留原问题并追加官方来源查询', () => {
    const queries = buildSearchQueries({
      question: 'Will Trump tweet today?',
      description: 'Resolves to yes if Donald Trump posts on X.',
      resolutionSource: 'https://truthsocial.com'
    })

    expect(queries[0]).toBe('Will Trump tweet today?')
    expect(queries.some((query) => query.includes('official source'))).toBe(true)
    expect(queries.length).toBeGreaterThanOrEqual(3)
  })

  it('buildSearchQueries 在时间限定词前提取焦点子句', () => {
    const queries = buildSearchQueries({
      question: 'Russia-Ukraine Ceasefire before GTA VI?',
      description: 'Official ceasefire agreement between Russia and Ukraine.'
    })

    expect(queries.includes('Russia-Ukraine Ceasefire')).toBe(true)
    expect(queries.some((query) => query.includes('This market will resolve'))).toBe(false)
  })

  it('inferUrgency 能识别短中长期问题时效', () => {
    expect(inferUrgency('Will Trump tweet today?')).toBe(1)
    expect(inferUrgency('Will the Fed cut rates this month?')).toBe(7)
    expect(inferUrgency('Will a ceasefire happen?')).toBe(30)
  })
})
