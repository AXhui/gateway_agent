import type { ReactNode } from 'react'
import { adapterDefinitions } from './componentMap'
import type { ComponentNode, RendererRuntime } from './types'
import { resolveExpression, resolveProps, resolveValue } from './valueResolver'

interface Props { node: ComponentNode; runtime: RendererRuntime }

export function ComponentRenderer({ node, runtime }: Props): ReactNode {
  if (node.visibility && !resolveExpression(node.visibility.expr, runtime.state)) return null
  const adapter = adapterDefinitions[node.component]
  if (!adapter) return <div className="ds-unknown-component">Unknown / Unregistered Component: {node.component}</div>
  const children = <>{(node.children ?? []).map((child) => <ComponentRenderer key={child.id} node={child} runtime={runtime} />)}</>
  const slots = Object.fromEntries(Object.entries(node.slots ?? {}).map(([name, nodes]) => [name, <>{nodes.map((child) => <ComponentRenderer key={child.id} node={child} runtime={runtime} />)}</>]))
  const props = resolveProps(node.props, runtime)
  if (node.binding) {
    props.value = node.binding.source === 'state'
      ? resolveValue({ $state: node.binding.path ?? '' }, runtime)
      : resolveValue({ $data: node.binding.source }, runtime)
  }
  return <>{adapter.render({ node, props, content: node.content, children, slots, runtime })}</>
}
