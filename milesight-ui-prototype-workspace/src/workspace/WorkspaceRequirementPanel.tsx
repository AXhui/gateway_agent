import type { FormEvent } from 'react'
import type { PageDocument } from '../renderer/types'
import type { WorkspaceGeneration } from './Workspace'

interface Props { page: PageDocument; requirement: string; generation: WorkspaceGeneration; onRequirementChange: (value: string) => void; onGenerate: () => void; onSelectExample: (id: string) => void }

const pageTypeLabels: Record<string, string> = { settings: 'Configuration', list: 'List', detail: 'Detail', form: 'Form', dashboard: 'Dashboard', topology: 'Topology' }
const exampleItems = [
  { id: 'device-management', label: 'Device Management', available: true },
  { id: 'offline-alert', label: 'Offline Alert', available: true },
  { id: 'firmware-upgrade', label: 'Firmware Upgrade', available: false },
  { id: 'gateway-detail', label: 'Gateway Detail', available: false },
]

function primaryEntity(page: PageDocument) {
  if (page.meta.title.includes('告警')) return 'Device Alert Rule'
  if (page.meta.title.includes('设备')) return 'Device'
  return page.meta.productLine ?? 'Prototype'
}

export function WorkspaceRequirementPanel({ page, requirement, generation, onRequirementChange, onGenerate, onSelectExample }: Props) {
  const submit = (event: FormEvent) => { event.preventDefault(); onGenerate() }
  return <aside className="workspace-panel workspace-requirement-panel">
    <div className="workspace-panel-heading"><div><span>INPUT</span><h2>Requirement</h2><p>Describe what you want to build</p></div><span className="manual-mode">Manual mode</span></div>
    <form className="workspace-requirement-form" onSubmit={submit}>
      <label htmlFor="workspace-requirement">Product requirement</label>
      <textarea id="workspace-requirement" value={requirement} onChange={(event) => onRequirementChange(event.target.value)} />
      <button type="submit" className="workspace-generate-button" disabled={!requirement.trim() || generation.status === 'validating'}>{generation.status === 'validating' ? 'Validating…' : 'Generate Prototype'}</button>
    </form>
    <div className={`workspace-generation-note workspace-generation-note--${generation.status}`}><b>{generation.status === 'ready' ? 'Prototype ready' : generation.status === 'validating' ? 'Checking workspace' : generation.status === 'error' ? 'Validation failed' : 'Manual Generation Mode'}</b><p>{generation.message ?? 'Current workspace uses pre-generated Page JSON.'}</p></div>
    <section className="workspace-analysis"><div className="section-label">Requirement Analysis</div><dl><div><dt>Page Type</dt><dd>{pageTypeLabels[page.meta.pageType] ?? page.meta.pageType}</dd></div><div><dt>User</dt><dd>{page.meta.userRole}</dd></div><div><dt>Primary Entity</dt><dd>{primaryEntity(page)}</dd></div></dl><h3>Core Tasks</h3><ul>{page.meta.coreFunctions.map((task) => <li key={task}>{task}</li>)}</ul></section>
    <section className="workspace-examples"><div className="section-label">Examples</div><div>{exampleItems.map((item) => <button type="button" key={item.id} data-available={String(item.available)} onClick={() => onSelectExample(item.id)}>{item.label}<small>{item.available ? 'Load' : 'Prompt'}</small></button>)}</div></section>
    <footer className="workspace-schema-meta"><span>Schema <b>{page.schemaVersion}</b></span><span>Source <b>page.json</b></span></footer>
  </aside>
}
