import { useState, type Dispatch, type SetStateAction } from 'react'
import { Renderer } from '../renderer/Renderer'
import type { PageDocument, RendererRuntime, Toast } from '../renderer/types'

type Viewport = 'desktop' | 'tablet' | 'mobile'
interface Props { page: PageDocument; runtime: RendererRuntime; toasts: Toast[]; setState: Dispatch<SetStateAction<Record<string, unknown>>>; inspectorOpen: boolean; onInspectorToggle: () => void; onRefresh: () => void; validationReady: boolean }

export function PrototypePanel({ page, runtime, toasts, setState, inspectorOpen, onInspectorToggle, onRefresh, validationReady }: Props) {
  const [viewport, setViewport] = useState<Viewport>('desktop')
  const changeStatus = (pageStatus: string) => setState((current) => ({ ...current, pageStatus }))
  return <main className="prototype-workspace">
    <header className="prototype-header"><div><span>LIVE PROTOTYPE</span><h1>{page.meta.title}</h1></div><div className="prototype-status"><b>V1</b><i data-ready={String(validationReady)} />{validationReady ? 'Prototype Ready' : 'Validation Failed'}</div></header>
    <div className="prototype-toolbar">
      <div className="viewport-segmented" aria-label="Prototype viewport">{(['desktop', 'tablet', 'mobile'] as Viewport[]).map((item) => <button key={item} type="button" data-active={String(viewport === item)} onClick={() => setViewport(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div>
      <div className="prototype-toolbar-actions"><button type="button" onClick={onRefresh}>Refresh</button><button type="button" onClick={() => window.open(window.location.href, '_blank', 'noopener,noreferrer')}>Open Preview</button><button type="button" onClick={onInspectorToggle}>{inspectorOpen ? 'Hide Inspector' : 'Inspector'}</button></div>
    </div>
    <div className="prototype-canvas"><div className={`prototype-viewport prototype-viewport--${viewport}`}><div className="prototype-viewport-bar"><span>Preview surface</span><div><i /><i /><i /></div></div><div className="prototype-render-surface"><Renderer page={page} runtime={runtime} /></div></div></div>
    <div className="prototype-state-controls" aria-label="Preview state"><span>Prototype state</span>{['success', 'loading', 'error'].map((state) => <button key={state} type="button" data-active={String(String(runtime.state.pageStatus ?? 'success') === state)} onClick={() => changeStatus(state)}>{state}</button>)}</div>
    <div className="toast-stack" aria-live="polite">{toasts.map((toast) => <div key={toast.id} className="ds-toast" data-type={toast.type}>{toast.content}</div>)}</div>
  </main>
}
