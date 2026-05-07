import { ScoringService } from './scoring.service'
import { OpenAiClient } from './clients/openai.client'

describe('ScoringService', () => {
  const mockLlm = {
    scoreCandidate: async () => null
  } as unknown as OpenAiClient

  it('stale social link is penalized', async () => {
    const service = new ScoringService(mockLlm)

    const market = {
      question: 'Will Trump tweet today?',
      searchQueries: ['Will Trump tweet today?']
    }

    const candidate = {
      title: 'Old reddit thread about Trump',
      url: 'https://www.reddit.com/r/politics/comments/example',
      snippet: 'Discussion from last year',
      provider: 'reddit',
      sourceType: 'social' as const,
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    }

    const [scored] = await service.scoreCandidates(market, [candidate])

    expect(scored.stale).toBe(true)
    expect(scored.totalScore).toBeLessThan(0.5)
  })

  it('official source is not marked stale', async () => {
    const service = new ScoringService(mockLlm)

    const market = {
      question: 'Will Trump tweet today?',
      searchQueries: ['Will Trump tweet today?']
    }

    const candidate = {
      title: 'Official resolution source',
      url: 'https://example.com/source',
      provider: 'polymarket',
      sourceType: 'official' as const
    }

    const [scored] = await service.scoreCandidates(market, [candidate])

    expect(scored.stale).toBe(false)
    expect(scored.totalScore).toBeGreaterThan(0.4)
  })
})
