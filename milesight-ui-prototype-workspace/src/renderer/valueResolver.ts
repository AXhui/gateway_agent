import type { ComponentProps, RendererRuntime } from './types'

function getPath(source: unknown, path: string): unknown {
  if (!path) return source
  return path.split('.').reduce<unknown>((value, key) => {
    if (Array.isArray(value) && key === 'length') return value.length
    return value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined
  }, source)
}

function queryData(query: Record<string, unknown>, runtime: RendererRuntime): unknown[] {
  const source = runtime.dataSources[String(query.source)]
  let data = Array.isArray(source) ? [...source] : []
  const search = query.search as { statePath: string; fields: string[] } | undefined
  if (search) {
    const term = String(getPath(runtime.state, search.statePath) ?? '').trim().toLowerCase()
    if (term) data = data.filter((record) => search.fields.some((field) => String((record as Record<string, unknown>)[field] ?? '').toLowerCase().includes(term)))
  }
  for (const filter of (query.equals ?? []) as Array<{ statePath: string; field: string; ignore?: unknown }>) {
    const expected = getPath(runtime.state, filter.statePath)
    if (expected !== undefined && expected !== filter.ignore) data = data.filter((record) => (record as Record<string, unknown>)[filter.field] === expected)
  }
  return data
}

export function resolveValue(value: unknown, runtime: RendererRuntime): unknown {
  if (Array.isArray(value)) return value.map((item) => resolveValue(item, runtime))
  if (!value || typeof value !== 'object') return value
  const object = value as Record<string, unknown>
  if ('$state' in object) return getPath(runtime.state, String(object.$state))
  if ('$data' in object) return runtime.dataSources[String(object.$data)]
  if ('$query' in object) return queryData(object.$query as Record<string, unknown>, runtime)
  if ('$lengthOf' in object) {
    const resolved = resolveValue(object.$lengthOf, runtime)
    return Array.isArray(resolved) ? resolved.length : 0
  }
  if ('$countWhere' in object) {
    const query = object.$countWhere as { source: string; field: string; equals: unknown }
    const source = runtime.dataSources[query.source]
    return Array.isArray(source) ? source.filter((item) => (item as Record<string, unknown>)[query.field] === query.equals).length : 0
  }
  if ('$lookup' in object) {
    const lookup = object.$lookup as { source: string; id: unknown; field: string }
    const id = resolveValue(lookup.id, runtime)
    const source = runtime.dataSources[lookup.source]
    const record = Array.isArray(source) ? source.find((item) => (item as Record<string, unknown>).id === id) : undefined
    return record ? (record as Record<string, unknown>)[lookup.field] : '—'
  }
  return Object.fromEntries(Object.entries(object).map(([key, item]) => [key, resolveValue(item, runtime)]))
}

export function resolveProps(props: ComponentProps | undefined, runtime: RendererRuntime): ComponentProps {
  return (resolveValue(props ?? {}, runtime) ?? {}) as ComponentProps
}

export function resolveExpression(expression: string, state: Record<string, unknown>): boolean {
  const comparison = expression.match(/^state\.([\w.]+?)(\.length)?\s*(===|!==|>|<|>=|<=)\s*(.+)$/)
  if (!comparison) return Boolean(getPath(state, expression.replace(/^state\./, '')))
  const [, path, lengthAccessor, operator, rawExpected] = comparison
  const target = getPath(state, path)
  const actual = lengthAccessor ? (Array.isArray(target) || typeof target === 'string' ? target.length : undefined) : target
  const expected = rawExpected === 'true' ? true : rawExpected === 'false' ? false : rawExpected.replace(/^['"]|['"]$/g, '')
  switch (operator) {
    case '===': return actual === expected
    case '!==': return actual !== expected
    case '>': return Number(actual) > Number(expected)
    case '<': return Number(actual) < Number(expected)
    case '>=': return Number(actual) >= Number(expected)
    case '<=': return Number(actual) <= Number(expected)
    default: return false
  }
}

export function resolveFlowValue(value: unknown, payload: Record<string, unknown>): unknown {
  if (typeof value === 'string' && value.startsWith('$payload.')) return getPath(payload, value.slice('$payload.'.length))
  if (Array.isArray(value)) return value.map((item) => resolveFlowValue(item, payload))
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, resolveFlowValue(item, payload)]))
  return value
}

export function resolveEventPayload(payload: Record<string, unknown> | undefined, event: unknown): Record<string, unknown> {
  const eventRecord = event && typeof event === 'object' ? event as Record<string, unknown> : { value: event }
  const resolve = (value: unknown): unknown => {
    if (value === '$event') return event
    if (typeof value === 'string' && value.startsWith('$event.')) return getPath(eventRecord, value.slice('$event.'.length))
    if (Array.isArray(value)) return value.map(resolve)
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, resolve(item)]))
    return value
  }
  return (resolve(payload ?? {}) ?? {}) as Record<string, unknown>
}
