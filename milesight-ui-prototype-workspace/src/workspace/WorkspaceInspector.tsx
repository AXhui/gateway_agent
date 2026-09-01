import type { PageDocument } from '../renderer/types'
import type { DesignSystemReport, ValidationIssue } from '../validator/types'

interface Props { page: PageDocument; report: DesignSystemReport; schemaIssues: ValidationIssue[] }

function Check({ label, value, valid = true }: { label: string; value: string | number; valid?: boolean }) {
  return <div className="validation-row"><span><i data-valid={String(valid)}>{valid ? '✓' : '!'}</i>{label}</span><b>{value}</b></div>
}

export function WorkspaceInspector({ page, report, schemaIssues }: Props) {
  const designSystemValid = report.issues.every((issue) => issue.severity !== 'error')
  const warnings = [...schemaIssues, ...report.issues].filter((issue) => issue.severity === 'warning')
  return <aside className="workspace-panel workspace-inspector">
    <div className="workspace-panel-heading"><div><span>VALIDATION / RUNTIME</span><h2>Design System Inspector</h2><p>Live results from the current page tree</p></div></div>
    <section className="inspector-coverage"><span>Coverage</span><strong>{report.coverage.percentage}%</strong><p>{report.coverage.matched} / {report.coverage.total} matched</p><div><i style={{ width: `${report.coverage.percentage}%` }} /></div></section>
    <section className="inspector-section"><div className="section-label">Validation</div><Check label="Schema" value={schemaIssues.length === 0 ? 'Valid' : 'Invalid'} valid={schemaIssues.length === 0} /><Check label="Design System" value={designSystemValid ? 'Valid' : 'Invalid'} valid={designSystemValid} /><Check label="Invalid Props" value={report.invalidProps.length} valid={report.invalidProps.length === 0} /><Check label="Raw HEX" value={report.rawHexUsage.length} valid={report.rawHexUsage.length === 0} /><Check label="Primary Warnings" value={report.primaryActionWarnings.length} valid={report.primaryActionWarnings.length === 0} /></section>
    <section className="inspector-section"><div className="section-label">Components <b>{report.usages.length}</b></div><ul className="workspace-component-list">{report.usages.map((usage) => <li key={usage.nodeId} data-status={usage.status}><i>{usage.status === 'registered' ? '✓' : usage.status === 'unregistered' ? '!' : '×'}</i><span>{usage.name}</span><small>{usage.source}</small></li>)}</ul></section>
    <section className="inspector-section"><div className="section-label">Component Gaps <b>{report.componentGaps.length}</b></div>{report.componentGaps.length === 0 ? <p className="inspector-empty">No component gaps</p> : <ul className="workspace-gap-list">{report.componentGaps.map((gap) => <li key={`${gap.requestedComponent}-${gap.reason}`}><strong>{gap.requestedComponent}</strong><span>{gap.reason}</span></li>)}</ul>}</section>
    <section className="inspector-section"><div className="section-label">Design Decisions / Warnings</div>{warnings.length === 0 ? <p className="inspector-pass">All Design System checks passed.</p> : <ul className="workspace-warning-list">{warnings.map((warning) => <li key={warning.message}>{warning.message}</li>)}</ul>}{page.review.designDecisions?.map((decision) => <p className="inspector-decision" key={decision}>{decision}</p>)}</section>
  </aside>
}
