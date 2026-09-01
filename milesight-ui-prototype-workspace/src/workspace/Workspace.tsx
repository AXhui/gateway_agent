import { useMemo, useState } from 'react'
import type { PageDocument } from '../renderer/types'
import { usePageRuntime } from '../renderer/usePageRuntime'
import { validateDesignSystem } from '../validator/designSystemValidator'
import { validateSchema } from '../validator/schemaValidator'
import { registry } from '../design-system/registry'
import { WorkspaceHeader } from './WorkspaceHeader'
import { WorkspaceRequirementPanel } from './WorkspaceRequirementPanel'
import { PrototypePanel } from './PrototypePanel'
import { WorkspaceInspector } from './WorkspaceInspector'
import { FollowUpPromptBar } from './FollowUpPromptBar'

export type WorkspaceStatus = 'idle' | 'validating' | 'ready' | 'error'

export interface WorkspaceGeneration {
  status: WorkspaceStatus
  message?: string
}

interface Props {
  page: PageDocument
  pageVersion: number
  requirement: string
  generation: WorkspaceGeneration
  onRequirementChange: (value: string) => void
  onGenerate: () => void
  onSelectExample: (id: string) => void
  onRefresh: () => void
  onNewPrototype: () => void
}

export function Workspace(props: Props) {
  const [inspectorOpen, setInspectorOpen] = useState(true)
  return <WorkspaceRuntime key={props.pageVersion} {...props} inspectorOpen={inspectorOpen} onInspectorToggle={() => setInspectorOpen((open) => !open)} />
}

function WorkspaceRuntime({ page, requirement, generation, onRequirementChange, onGenerate, onSelectExample, onRefresh, onNewPrototype, inspectorOpen, onInspectorToggle }: Props & { inspectorOpen: boolean; onInspectorToggle: () => void }) {
  const { runtime, toasts, setState } = usePageRuntime(page)
  const schemaIssues = useMemo(() => validateSchema(page), [page])
  const report = useMemo(() => validateDesignSystem(page, registry), [page])
  const hasValidationError = schemaIssues.some((issue) => issue.severity === 'error') || report.issues.some((issue) => issue.severity === 'error')

  return <div className={`workspace-shell ${inspectorOpen ? '' : 'workspace-shell--inspector-collapsed'}`}>
    <WorkspaceHeader coverage={report.coverage.percentage} ready={!hasValidationError} inspectorOpen={inspectorOpen} onInspectorToggle={onInspectorToggle} onNewPrototype={onNewPrototype} />
    <div className="workspace-grid">
      <WorkspaceRequirementPanel page={page} requirement={requirement} generation={generation} onRequirementChange={onRequirementChange} onGenerate={onGenerate} onSelectExample={onSelectExample} />
      <PrototypePanel page={page} runtime={runtime} toasts={toasts} setState={setState} inspectorOpen={inspectorOpen} onInspectorToggle={onInspectorToggle} onRefresh={onRefresh} validationReady={!hasValidationError} />
      {inspectorOpen ? <WorkspaceInspector page={page} report={report} schemaIssues={schemaIssues} /> : null}
    </div>
    <FollowUpPromptBar />
  </div>
}
