/**
 * 查询构建器
 * 
 * 功能：
 * 1. 标准化空白
 * 2. 提取焦点子句
 * 3. 生成查询词列表
 * 4. 添加官方来源查询
 */
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

/**
 * 构建搜索查询词列表
 * 
 * 输入：
 * 1. 问题
 * 2. 描述
 * 3. 官方来源
 */
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

/**
 * 去重并过滤空值
 * 
 * 输入：
 * 1. 查询词列表
 * 
 * 输出：
 * 1. 去重后的查询词列表
 */
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

/**
 * 提取焦点子句
 * 
 * 输入：
 * 1. 问题
 * 
 * 输出：
 * 1. 焦点子句
 */
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
