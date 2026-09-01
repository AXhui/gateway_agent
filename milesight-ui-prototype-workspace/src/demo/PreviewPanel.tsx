import type { Dispatch, SetStateAction } from 'react'
import { Renderer } from '../renderer/Renderer'
import type { PageDocument, RendererRuntime, Toast } from '../renderer/types'

interface Props { page: PageDocument; runtime: RendererRuntime; toasts: Toast[]; setState: Dispatch<SetStateAction<Record<string, unknown>>> }

export function PreviewPanel({ page, runtime, toasts, setState }: Props) {
  const changeStatus = (pageStatus: string) => setState((current) => ({ ...current, pageStatus }))
  return <section className="preview-panel"><header className="preview-chrome"><div><span>GENERATED PROTOTYPE</span><strong>{page.meta.title}</strong></div><div className="state-switcher" aria-label="预览状态"><button type="button" onClick={() => changeStatus('success')}>Success</button><button type="button" onClick={() => changeStatus('loading')}>Loading</button><button type="button" onClick={() => changeStatus('error')}>Error</button></div></header><div className="prototype-stage"><Renderer page={page} runtime={runtime} /></div><div className="toast-stack" aria-live="polite">{toasts.map((toast) => <div key={toast.id} className="ds-toast" data-type={toast.type}>{toast.content}</div>)}</div></section>
}
