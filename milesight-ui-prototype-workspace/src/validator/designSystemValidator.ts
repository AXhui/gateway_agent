import { adapterDefinitions } from '../renderer/componentMap'
import type { ComponentGap, ComponentNode, ComponentRegistry, PageDocument } from '../renderer/types'
import type { ComponentUsage, DesignSystemReport, ValidationIssue } from './types'

const rawHexPattern = /#[0-9a-fA-F]{3,8}\b/

function collectNodes(node: ComponentNode, surface = 'page'): Array<{ node: ComponentNode; surface: string }> {
  const currentSurface = node.component === 'Drawer' ? node.id : surface
  return [{ node, surface: currentSurface }, ...(node.children ?? []).flatMap((child) => collectNodes(child, currentSurface)), ...Object.values(node.slots ?? {}).flatMap((items) => items.flatMap((child) => collectNodes(child, currentSurface)))]
}

function walkValue(value: unknown, path: string, issues: ValidationIssue[], node: ComponentNode) {
  if (typeof value === 'string' && rawHexPattern.test(value)) {
    issues.push({ severity: 'error', code: 'RAW_HEX', nodeId: node.id, component: node.component, message: `${path} contains a raw hex color: ${value}` })
  }
  if (Array.isArray(value)) value.forEach((item, index) => walkValue(item, `${path}[${index}]`, issues, node))
  if (value && typeof value === 'object') Object.entries(value as Record<string, unknown>).forEach(([key, item]) => walkValue(item, `${path}.${key}`, issues, node))
}

function findMissingFlows(node: ComponentNode, flowIds: Set<string>): ValidationIssue[] {
  return Object.entries(node.events ?? {}).flatMap(([eventName, binding]) => flowIds.has(binding.flowId)
    ? []
    : [{ severity: 'error' as const, code: 'MISSING_FLOW' as const, nodeId: node.id, component: node.component, message: `${node.id}.${eventName} references missing flow "${binding.flowId}"` }])
}

/** Coverage is per schema component instance: registry-backed adapters match; demo and unknown adapters do not. */
export function validateDesignSystem(page: PageDocument, registry: ComponentRegistry): DesignSystemReport {
  const registryByName = new Map(registry.components.map((component) => [component.name, component]))
  const flowIds = new Set((page.flows ?? []).map((flow) => flow.id))
  const usages: ComponentUsage[] = []
  const issues: ValidationIssue[] = []
  const invalidProps: ValidationIssue[] = []
  const rawHexUsage: ValidationIssue[] = []
  const primaryActionWarnings: ValidationIssue[] = []
  const primaryButtons = new Map<string, ComponentNode[]>()

  for (const { node, surface } of collectNodes(page.root)) {
    const registryComponent = registryByName.get(node.component)
    const adapter = adapterDefinitions[node.component]
    if (registryComponent) {
      usages.push({ nodeId: node.id, name: node.component, status: 'registered', source: 'registry-backed-adapter' })
      if (!adapter) {
        issues.push({ severity: 'error', code: 'UNAVAILABLE_ADAPTER', nodeId: node.id, component: node.component, message: `${node.component} is registered in the Design System but has no renderer adapter in this MVP` })
      }
      const allowedProps = new Set(registryComponent.props.map((prop) => prop.name))
      for (const propName of Object.keys(node.props ?? {})) {
        if (!allowedProps.has(propName)) {
          const issue: ValidationIssue = { severity: 'warning', code: 'INVALID_PROP', nodeId: node.id, component: node.component, message: `${node.component}.${propName} is not declared in component-registry.json` }
          invalidProps.push(issue)
          issues.push(issue)
        }
      }
    } else if (adapter?.status === 'unregistered') {
      usages.push({ nodeId: node.id, name: node.component, status: 'unregistered', source: 'demo-adapter' })
      const issue: ValidationIssue = { severity: 'warning', code: 'UNREGISTERED_ADAPTER', nodeId: node.id, component: node.component, message: `${node.component} is rendered by a demo adapter but is not registered in the Design System` }
      issues.push(issue)
      const allowedProps = new Set(adapter.allowedProps)
      for (const propName of Object.keys(node.props ?? {})) {
        if (!allowedProps.has(propName)) {
          const invalidIssue: ValidationIssue = { severity: 'warning', code: 'INVALID_PROP', nodeId: node.id, component: node.component, message: `${node.component}.${propName} is not supported by its demo adapter` }
          invalidProps.push(invalidIssue)
          issues.push(invalidIssue)
        }
      }
    } else {
      usages.push({ nodeId: node.id, name: node.component, status: 'unknown', source: 'unknown' })
      issues.push({ severity: 'error', code: 'UNKNOWN_COMPONENT', nodeId: node.id, component: node.component, message: `${node.component} has neither a registry entry nor an adapter` })
    }

    walkValue(node.props, `${node.component}.props`, rawHexUsage, node)
    issues.push(...findMissingFlows(node, flowIds))
    if (node.component === 'Button' && node.props?.type === 'primary') primaryButtons.set(surface, [...(primaryButtons.get(surface) ?? []), node])
  }

  for (const [surface, buttons] of primaryButtons) {
    if (buttons.length <= 1) continue
    const issue: ValidationIssue = { severity: 'warning', code: 'PRIMARY_ACTION', message: `Found ${buttons.length} primary Button instances in ${surface}; the registry rule recommends one primary action per visible screen` }
    primaryActionWarnings.push(issue)
    issues.push(issue)
  }
  issues.push(...rawHexUsage)

  const registeredCount = usages.filter((usage) => usage.status === 'registered').length
  const unregisteredAdapterCount = usages.filter((usage) => usage.status === 'unregistered').length
  const unknownComponentCount = usages.filter((usage) => usage.status === 'unknown').length
  const total = usages.length
  const ratio = total === 0 ? 1 : registeredCount / total
  const componentGaps: ComponentGap[] = [
    ...page.review.componentGaps,
    ...usages.filter((usage) => usage.status !== 'registered' && !page.review.componentGaps.some((gap) => gap.requestedComponent === usage.name)).map((usage) => ({ requestedComponent: usage.name, reason: 'Renderer could not match this component to the registered Design System.', status: 'unresolved' })),
  ]

  return { usages, registeredCount, unregisteredAdapterCount, unknownComponentCount, invalidProps, rawHexUsage, primaryActionWarnings, componentGaps, coverage: { matched: registeredCount, total, ratio, percentage: Math.round(ratio * 100) }, issues }
}
