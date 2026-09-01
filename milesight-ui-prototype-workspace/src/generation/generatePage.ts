import { registry } from '../design-system/registry'
import type { PageDocument } from '../renderer/types'
import { validateDesignSystem } from '../validator/designSystemValidator'
import { validateSchema } from '../validator/schemaValidator'
import type { GenerationResult, PageGenerationRequest } from './types'

function diagnosticsFor(candidate: unknown): string[] {
  const schemaIssues = validateSchema(candidate as PageDocument)
  if (schemaIssues.length > 0) return schemaIssues.map((issue) => issue.message)
  const report = validateDesignSystem(candidate as PageDocument, registry)
  const strictIssues = report.issues.map((issue) => issue.message)
  if (report.unregisteredAdapterCount > 0) strictIssues.push('Generated page uses an unregistered demo adapter. LLM generation must use registered components only.')
  if (report.unknownComponentCount > 0) strictIssues.push('Generated page contains unknown components.')
  return [...new Set(strictIssues)]
}

async function askGateway(request: PageGenerationRequest): Promise<{ page?: unknown; raw?: string; error?: string }> {
  const response = await fetch('/api/generate-page', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request) })
  const data = await response.json() as { page?: unknown; raw?: string; error?: string }
  if (!response.ok) return { error: data.error ?? `Generation service returned ${response.status}` }
  return data
}

/** A candidate is never passed to Renderer until schema and Design System validation both pass. */
export async function generateValidatedPage(requirement: string): Promise<GenerationResult> {
  let candidate: unknown
  let diagnostics: string[] = []
  for (const attempt of [1, 2] as const) {
    const response = await askGateway(attempt === 1 ? { mode: 'generate', requirement } : { mode: 'repair', requirement, candidate, diagnostics })
    if (response.error) return { ok: false, diagnostics: [response.error] }
    candidate = response.page ?? response.raw
    diagnostics = diagnosticsFor(candidate)
    if (diagnostics.length === 0) return { ok: true, page: candidate as PageDocument, diagnostics: [], attempt }
  }
  return { ok: false, diagnostics: ['AI output remains invalid after one automatic repair attempt.', ...diagnostics] }
}
