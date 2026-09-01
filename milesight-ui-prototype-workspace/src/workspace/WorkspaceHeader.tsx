interface Props { coverage: number; ready: boolean; inspectorOpen: boolean; onInspectorToggle: () => void; onNewPrototype: () => void }

export function WorkspaceHeader({ coverage, ready, inspectorOpen, onInspectorToggle, onNewPrototype }: Props) {
  return <header className="workspace-header">
    <div className="workspace-brand"><span className="workspace-brand-mark">M</span><div><strong>Milesight AI UI Generator</strong><small>Design System Prototype Workspace</small></div></div>
    <div className="workspace-header-actions">
      <span className="workspace-ready"><i data-ready={String(ready)} />Design System <b>{ready ? `${coverage}%` : 'Review'}</b></span>
      <button type="button" className="workspace-text-button" onClick={onInspectorToggle}>{inspectorOpen ? 'Hide Inspector' : 'Inspector'}</button>
      <button type="button" className="workspace-text-button" onClick={onNewPrototype}>History</button>
      <button type="button" className="workspace-new-button" onClick={onNewPrototype}>New Prototype</button>
    </div>
  </header>
}
