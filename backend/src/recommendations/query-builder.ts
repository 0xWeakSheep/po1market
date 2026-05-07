const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'be',
  'before',
  'by',
  'did',
  'does',
  'for',
  'if',
  'in',
  'is',
  'of',
  'on',
  'or',
  'the',
  'to',
  'today',
  'will',
  'with'
])

type BuildSearchQueriesInput = {
  question: string
  description?: string
  resolutionSource?: string
}

export function buildSearchQueries ({
  question,
  description,
  resolutionSource
}: BuildSearchQueriesInput): string[] {
  void description

  const normalizedQuestion = normalizeWhitespace(question)
  const focusQuestion = extractFocusClause(normalizedQuestion)
  const tokens = (focusQuestion.toLowerCase().match(/[A-Za-z0-9']+/g) ?? [])
    .filter((token) => !STOP_WORDS.has(token) && token.length > 2)

  const keyPhrase = tokens.slice(0, 6).join(' ').trim()
  const queries = [normalizedQuestion, focusQuestion]

  if (keyPhrase && keyPhrase.toLowerCase() !== focusQuestion.toLowerCase()) {
    queries.push(keyPhrase)
  }

  if (resolutionSource?.startsWith('http')) {
    queries.push(`${focusQuestion} official source`)
  }

  return uniqueNonEmpty(queries)
}

export function inferUrgency (question: string): number {
  const lowered = question.toLowerCase()

  if (
    ['today', 'tonight', 'this hour', 'in may', 'this week']
      .some((marker) => lowered.includes(marker))
  ) {
    return 1
  }

  if (
    ['this month', 'before', 'by ']
      .some((marker) => lowered.includes(marker))
  ) {
    return 7
  }

  return 30
}

function uniqueNonEmpty (values: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    const normalized = normalizeWhitespace(value)

    if (!normalized || seen.has(normalized.toLowerCase())) {
      continue
    }

    seen.add(normalized.toLowerCase())
    result.push(normalized)
  }

  return result
}

/** Align with Python `query_builder._extract_focus_clause` + `strip(" ?")`. */
function extractFocusClause (question: string): string {
  const parts = question.split(/\b(before|after|by|if|unless|until)\b/i)
  const rawFocus = parts[0] ?? question
  const focus = rawFocus.replace(/^[\s?]+|[\s?]+$/g, '').trim()
  return focus || question.trim()
}

function normalizeWhitespace (value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}
