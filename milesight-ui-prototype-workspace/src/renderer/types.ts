import type { ReactNode } from 'react'

export type Primitive = string | number | boolean | null
export type ComponentProps = Record<string, unknown>

export interface EventBinding {
  flowId: string
  payload?: Record<string, unknown>
}

export interface ComponentNode {
  id: string
  kind: 'component'
  component: string
  semanticRole?: string
  props?: ComponentProps
  content?: Primitive
  children?: ComponentNode[]
  slots?: Record<string, ComponentNode[]>
  binding?: { source: string; path?: string; map?: Record<string, string>; emptyFallback?: unknown }
  visibility?: { expr: string; fallback?: 'hide' | 'disable' }
  events?: Record<string, EventBinding>
  annotation?: { requirement?: string; selectionReason?: string; ruleRefs?: string[] }
}

export interface FlowAction {
  type: 'set-state' | 'open' | 'close' | 'navigate' | 'submit' | 'refresh' | 'confirm' | 'notify' | 'select' | 'custom'
  target?: string
  key?: string
  value?: unknown
  message?: string
  status?: 'success' | 'error' | 'warn' | 'info' | 'loading'
  params?: Record<string, unknown>
}

export interface Flow { id: string; description?: string; steps: FlowAction[] }

export interface PageDocument {
  schemaVersion: '1.0.0'
  meta: {
    pageId: string; title: string; pageType: string; productLine?: string
    businessScenario: string; userRole: string; coreFunctions: string[]
    specialRequirements?: string[]; theme: 'light' | 'dark' | 'dual'
  }
  designSystem: {
    registry: 'component-registry.json'; name: 'Milesight IOT Web'; version: '1.0.0'
    coverage: { status: 'pending-validation' | 'valid' | 'has-gaps' }
  }
  state?: Record<string, unknown>
  dataSources?: Array<{ id: string; kind: string; entity?: string; data?: unknown; description?: string }>
  root: ComponentNode
  flows?: Flow[]
  pageStates?: Record<string, { component: string; props?: ComponentProps; message?: string }>
  review: { assumptions: string[]; warnings: string[]; componentGaps: ComponentGap[]; designDecisions?: string[] }
}

export interface ComponentGap { requestedComponent: string; reason: string; fallback?: string; status: string }

export interface RegistryProp { name: string; type: string; default?: string; desc?: string }
export interface RegistryComponent { id: string; name: string; category: string; props: RegistryProp[]; tokens?: string[]; guidance?: string; interactionSkill?: string }
export interface ComponentRegistry {
  designSystem: { name: string; version: string; runtimeTarget: string; counts: { functionalComponents: number; designResources: number; totalEntries: number } }
  globalRules: Array<{ id: string; rule: string; severity: 'error' | 'warning' }>
  tokenCatalog: Record<string, Array<{ name: string; light: string; dark?: string }>>
  knownSourceGaps?: Array<{ name: string; type: string; detail: string }>
  components: RegistryComponent[]
}

export type AdapterStatus = 'registered' | 'unregistered'
export interface AdapterDefinition {
  status: AdapterStatus
  source: 'registry-backed-adapter' | 'demo-adapter'
  allowedProps: string[]
  render: (props: AdapterRenderProps) => ReactNode
}

export interface AdapterRenderProps {
  node: ComponentNode
  props: ComponentProps
  content?: Primitive
  children: ReactNode
  slots: Record<string, ReactNode>
  runtime: RendererRuntime
}

export interface RendererRuntime {
  state: Record<string, unknown>
  dataSources: Record<string, unknown>
  trigger: (node: ComponentNode, eventName: string, event?: unknown) => void
}

export interface Toast { id: string; type: 'success' | 'error' | 'warn' | 'info' | 'loading'; content: string }
