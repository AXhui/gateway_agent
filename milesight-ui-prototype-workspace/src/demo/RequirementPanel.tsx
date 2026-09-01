import type { FormEvent } from 'react'
import type { PageDocument } from '../renderer/types'
import type { GenerationState } from '../generation/types'

interface Props { page: PageDocument; generation: GenerationState; onRequirementChange: (value: string) => void; onGenerate: () => void }

export function RequirementPanel({ page, generation, onRequirementChange, onGenerate }: Props) {
  const submit = (event: FormEvent) => { event.preventDefault(); onGenerate() }
  return <aside className="demo-panel requirement-panel"><div className="panel-kicker">INPUT / REQUIREMENT → PAGE JSON</div><h2>Requirement</h2><form className="requirement-form" onSubmit={submit}><label htmlFor="requirement-input">自然语言需求</label><textarea id="requirement-input" value={generation.requirement} onChange={(event) => onRequirementChange(event.target.value)} placeholder="例如：为 IoT 平台生成一个设备管理列表页，支持搜索、状态筛选和详情抽屉。" /><button type="submit" className="generate-button" disabled={generation.status === 'generating' || !generation.requirement.trim()}>{generation.status === 'generating' ? '正在生成…' : '生成 Page JSON'}</button></form>{generation.message ? <section className="generation-status" data-status={generation.status}><span>{generation.message}</span>{generation.diagnostics.length > 0 ? <ul>{generation.diagnostics.map((item) => <li key={item}>{item}</li>)}</ul> : null}</section> : null}<section><span>当前页面类型</span><strong>{page.meta.pageType === 'list' ? '列表页' : page.meta.pageType}</strong></section><section><span>业务场景</span><p>{page.meta.businessScenario}</p></section><section><span>核心功能</span><ul>{page.meta.coreFunctions.map((item) => <li key={item}>{item}</li>)}</ul></section><footer><small>Schema</small><code>{page.schemaVersion}</code><small>Design System</small><code>{page.designSystem.name}</code></footer></aside>
}
