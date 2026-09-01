import type { AdapterStatus, ComponentGap } from '../renderer/types'

export type ValidationSeverity = 'error' | 'warning'

export interface ValidationIssue {
  severity: ValidationSeverity
  code: 'SCHEMA' | 'UNKNOWN_COMPONENT' | 'UNREGISTERED_ADAPTER' | 'UNAVAILABLE_ADAPTER' | 'INVALID_PROP' | 'RAW_HEX' | 'PRIMARY_ACTION' | 'MISSING_FLOW'
  message: string
  nodeId?: string
  component?: string
}

export interface ComponentUsage {
  nodeId: string
  name: string
  status: AdapterStatus | 'unknown'
  source: 'registry-backed-adapter' | 'demo-adapter' | 'unknown'
}

export interface DesignSystemReport {
  usages: ComponentUsage[]
  registeredCount: number
  unregisteredAdapterCount: number
  unknownComponentCount: number
  invalidProps: ValidationIssue[]
  rawHexUsage: ValidationIssue[]
  primaryActionWarnings: ValidationIssue[]
  componentGaps: ComponentGap[]
  coverage: { matched: number; total: number; ratio: number; percentage: number }
  issues: ValidationIssue[]
}
