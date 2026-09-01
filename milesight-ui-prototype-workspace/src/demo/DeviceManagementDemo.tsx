import { useMemo } from 'react'
import { RequirementPanel } from './RequirementPanel'
import { PreviewPanel } from './PreviewPanel'
import { InspectorPanel } from './InspectorPanel'
import { usePageRuntime } from '../renderer/usePageRuntime'
import type { ComponentRegistry, PageDocument } from '../renderer/types'
import { validateDesignSystem } from '../validator/designSystemValidator'
import { validateSchema } from '../validator/schemaValidator'
import type { GenerationState } from '../generation/types'

interface Props { page: PageDocument; registry: ComponentRegistry; generation: GenerationState; onRequirementChange: (value: string) => void; onGenerate: () => void }

export function DeviceManagementDemo({ page, registry, generation, onRequirementChange, onGenerate }: Props) {
  const { runtime, toasts, setState } = usePageRuntime(page)
  const schemaIssues = useMemo(() => validateSchema(page), [page])
  const report = useMemo(() => validateDesignSystem(page, registry), [page, registry])
  return <div className="generator-shell"><RequirementPanel page={page} generation={generation} onRequirementChange={onRequirementChange} onGenerate={onGenerate}/><PreviewPanel page={page} runtime={runtime} toasts={toasts} setState={setState}/><InspectorPanel report={{ ...report, issues: [...schemaIssues, ...report.issues] }}/></div>
}
