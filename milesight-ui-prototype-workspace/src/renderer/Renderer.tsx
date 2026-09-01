import { ComponentRenderer } from './ComponentRenderer'
import type { PageDocument, RendererRuntime } from './types'

interface Props { page: PageDocument; runtime: RendererRuntime }

/** Recursively turns a schema component tree into registry-backed React adapters. */
export function Renderer({ page, runtime }: Props) {
  const pageStatus = String(runtime.state.pageStatus ?? 'success')
  if (pageStatus !== 'success') {
    const preset = page.pageStates?.[pageStatus]
    if (preset) return <ComponentRenderer node={{ id: `page-state-${pageStatus}`, kind: 'component', component: preset.component, props: preset.props, content: preset.message }} runtime={runtime} />
  }
  return <ComponentRenderer node={page.root} runtime={runtime} />
}
