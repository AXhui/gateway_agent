import { readFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { renderableRegistryComponents } from './src/generation/renderableComponents'

type LlmConfig = { apiUrl: string; apiKey: string; model: string }
const llmRequestTimeoutMs = 60_000

function readJson(file: string) { return JSON.parse(readFileSync(new URL(file, import.meta.url), 'utf8')) as Record<string, unknown> }
const registry = readJson('./component-registry.json')
const pageSchema = readJson('./page-schema.json')
const registryComponents = (registry.components as Array<Record<string, unknown>>).filter((component) => renderableRegistryComponents.includes(component.name as typeof renderableRegistryComponents[number])).map((component) => ({ name: component.name, props: (component.props as Array<Record<string, unknown>>).map((prop) => ({ name: prop.name, type: prop.type })), tokens: component.tokens, guidance: component.guidance }))
const generationContext = JSON.stringify({ designSystem: registry.designSystem, globalRules: registry.globalRules, allowedComponents: registryComponents, pageSchema }, null, 2)

function readBody(request: IncomingMessage): Promise<string> { return new Promise((resolve, reject) => { let body = ''; request.on('data', (chunk: Buffer) => { body += chunk; if (body.length > 1_500_000) reject(new Error('Request is too large')) }); request.on('end', () => resolve(body)); request.on('error', reject) }) }
function extractJson(content: string): unknown | undefined { const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? content; const start = fenced.indexOf('{'); const end = fenced.lastIndexOf('}'); if (start < 0 || end <= start) return undefined; try { return JSON.parse(fenced.slice(start, end + 1)) } catch { return undefined } }

function promptFor(mode: 'generate' | 'repair', requirement: string, candidate?: unknown, diagnostics?: string[]) {
  const contract = `You generate Milesight UI page JSON. Return exactly one JSON object, no Markdown. You MUST conform to the supplied JSON Schema. You MUST select only names from allowedComponents. Do not use custom components, raw hex colors, or any component not explicitly allowed. Include valid review, flows and events. All component props must be declared for that component.`
  if (mode === 'repair') return `${contract}\n\nRequirement:\n${requirement}\n\nPrevious candidate:\n${JSON.stringify(candidate)}\n\nValidator diagnostics to repair:\n${diagnostics?.join('\n') ?? 'Invalid output'}\n\nRegistry and schema context:\n${generationContext}`
  return `${contract}\n\nRequirement:\n${requirement}\n\nRegistry and schema context:\n${generationContext}`
}

async function callLlm(config: LlmConfig, prompt: string) {
  let response: Response
  try {
    response = await fetch(config.apiUrl, { method: 'POST', signal: AbortSignal.timeout(llmRequestTimeoutMs), headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` }, body: JSON.stringify({ model: config.model, temperature: 0.1, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'Follow the supplied component and JSON-schema contract exactly.' }, { role: 'user', content: prompt }] }) })
  } catch (error) {
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) throw new Error(`LLM request timed out after ${llmRequestTimeoutMs / 1000} seconds.`)
    throw error
  }
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string }; text?: string }>; error?: { message?: string } }
  if (!response.ok) throw new Error(payload.error?.message ?? `LLM request failed (${response.status})`)
  const content = payload.choices?.[0]?.message?.content ?? payload.choices?.[0]?.text
  if (!content) throw new Error('LLM response did not contain a message.')
  return content
}

function llmGateway(config: LlmConfig): Plugin {
  return { name: 'local-llm-generation-gateway', configureServer(server) { server.middlewares.use('/api/generate-page', async (request: IncomingMessage, response: ServerResponse) => { if (request.method !== 'POST') { response.statusCode = 405; response.end(JSON.stringify({ error: 'Method not allowed' })); return } if (!config.apiUrl || !config.apiKey || !config.model) { response.statusCode = 503; response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify({ error: 'LLM generation is not configured. Set LLM_API_URL, LLM_API_KEY, and LLM_MODEL in .env.local.' })); return } try { const body = JSON.parse(await readBody(request)) as { mode: 'generate' | 'repair'; requirement: string; candidate?: unknown; diagnostics?: string[] }; const content = await callLlm(config, promptFor(body.mode, body.requirement, body.candidate, body.diagnostics)); const page = extractJson(content); response.statusCode = 200; response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify(page ? { page } : { raw: content })); } catch (error) { response.statusCode = 502; response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'LLM generation failed' })); } }) } }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
  base: '/',
  build: { outDir: 'dist', emptyOutDir: true },
  plugins: [react(), llmGateway({ apiUrl: env.LLM_API_URL ?? '', apiKey: env.LLM_API_KEY ?? '', model: env.LLM_MODEL ?? '' })],
  }
})
