import { buildSearchQueries, inferUrgency } from './query-builder'

describe('query-builder', () => {
  it('buildSearchQueries keeps original question and adds official-source query', () => {
    const queries = buildSearchQueries({
      question: 'Will Trump tweet today?',
      description: 'Resolves to yes if Donald Trump posts on X.',
      resolutionSource: 'https://truthsocial.com'
    })

    expect(queries[0]).toBe('Will Trump tweet today?')
    expect(queries.some((query) => query.includes('official source'))).toBe(true)
    expect(queries.length).toBeGreaterThanOrEqual(3)
  })

  it('buildSearchQueries extracts focus clause before time qualifier', () => {
    const queries = buildSearchQueries({
      question: 'Russia-Ukraine Ceasefire before GTA VI?',
      description: 'Official ceasefire agreement between Russia and Ukraine.'
    })

    expect(queries.includes('Russia-Ukraine Ceasefire')).toBe(true)
    expect(queries.some((query) => query.includes('This market will resolve'))).toBe(false)
  })

  it('inferUrgency detects short and medium horizon questions', () => {
    expect(inferUrgency('Will Trump tweet today?')).toBe(1)
    expect(inferUrgency('Will the Fed cut rates this month?')).toBe(7)
    expect(inferUrgency('Will a ceasefire happen?')).toBe(30)
  })
})
