import type { PageDocument } from '../renderer/types'

export type GenerationStatus = 'idle' | 'generating' | 'valid' | 'error'

export interface GenerationState {
  status: GenerationStatus
  requirement: string
  message?: string
  diagnostics: string[]
  attempt?: 1 | 2
}

export interface GenerationSuccess { ok: true; page: PageDocument; diagnostics: string[]; attempt: 1 | 2 }
export interface GenerationFailure { ok: false; diagnostics: string[] }
export type GenerationResult = GenerationSuccess | GenerationFailure

export interface PageGenerationRequest {
  mode: 'generate' | 'repair'
  requirement: string
  candidate?: unknown
  diagnostics?: string[]
}
