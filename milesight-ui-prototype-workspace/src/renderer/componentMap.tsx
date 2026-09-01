import type { CSSProperties, ChangeEvent, ReactNode } from 'react'
import { registry } from '../design-system/registry'
import type { AdapterDefinition, AdapterRenderProps } from './types'

const registryProps = (name: string) => registry.components.find((component) => component.name === name)?.props.map((prop) => prop.name) ?? []
const event = (input: AdapterRenderProps, name: string, payload?: unknown) => () => input.runtime.trigger(input.node, name, payload)
const string = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback
const number = (value: unknown, fallback = 0) => typeof value === 'number' ? value : fallback
const nodeValue = (value: unknown): ReactNode => value === null || value === undefined ? null : String(value)

function Layout({ children }: AdapterRenderProps) { return <main className="ds-layout">{children}</main> }
function Grid({ props, children }: AdapterRenderProps) {
  const span = number(props.span, 24)
  return <section className="ds-grid" data-span={span} style={{ '--grid-gutter': typeof props.gutter === 'number' ? `var(--spacing-${props.gutter})` : undefined } as CSSProperties}>{children}</section>
}
function PageHeader({ props, slots }: AdapterRenderProps) {
  return <header className="ds-page-header"><div><h1>{String(props.title ?? '')}</h1>{Boolean(props.subTitle) && <p>{String(props.subTitle)}</p>}</div><div className="ds-page-header-actions">{slots.extra ?? null}</div></header>
}
function Button(input: AdapterRenderProps) {
  const { props, content, children } = input
  const type = string(props.type, 'default')
  const loading = Boolean(props.loading)
  return <button className="ds-button" data-type={type} type="button" disabled={Boolean(props.disabled) || loading} onClick={event(input, 'onClick')}>
    {loading ? <span className="ds-button-spinner" aria-hidden="true" /> : null}{content ?? children}
  </button>
}
function Input(input: AdapterRenderProps) {
  const { props } = input
  return <input className="ds-input" value={string(props.value)} placeholder="输入内容" onChange={(item) => input.runtime.trigger(input.node, 'onChange', item.target.value)} />
}
function InputSearch(input: AdapterRenderProps) {
  const { props } = input
  return <label className="ds-search"><span aria-hidden="true">⌕</span><input value={string(props.value)} placeholder={string(props.placeholder)} onChange={(item) => input.runtime.trigger(input.node, 'onChange', item.target.value)} />{props.allowClear && props.value ? <button type="button" onClick={event(input, 'onChange', '')}>×</button> : null}</label>
}
function Select(input: AdapterRenderProps) {
  const options = Array.isArray(input.props.options) ? input.props.options as Array<{ label: string; value: string }> : []
  return <select className="ds-select" value={string(input.props.value)} onChange={(item) => input.runtime.trigger(input.node, 'onChange', item.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
}
function Checkbox(input: AdapterRenderProps) {
  return <label className="ds-checkbox"><input type="checkbox" checked={Boolean(input.props.checked)} onChange={(item) => input.runtime.trigger(input.node, 'onChange', item.target.checked)} />{input.content}</label>
}
function Space({ props, children }: AdapterRenderProps) { return <div className="ds-space" data-direction={string(props.direction, 'horizontal')} data-size={string(props.size, 'middle')}>{children}</div> }
function Card({ props, children }: AdapterRenderProps) { return <section className="ds-card" data-bordered={String(props.bordered ?? true)}>{children}</section> }
function Statistic({ props, content }: AdapterRenderProps) { return <div className="ds-statistic"><span>{content}</span><strong>{String(props.value ?? 0)}{nodeValue(props.suffix)}</strong></div> }
function Typography({ props, content, children }: AdapterRenderProps) {
  const level = number(props.level, 0)
  if (level >= 1 && level <= 5) { const Heading = `h${level}` as 'h1'; return <Heading className="ds-typography" data-type={string(props.type)}>{content ?? children}</Heading> }
  return <p className="ds-typography" data-type={string(props.type)}>{content ?? children}</p>
}
function Tag({ props, content, children }: AdapterRenderProps) { return <span className="ds-tag" data-status={string(props.color, 'primary')}>{content ?? children}</span> }
function Badge({ props, content, children }: AdapterRenderProps) { return <span className="ds-badge" data-status={string(props.status, 'default')}>{props.dot ? null : nodeValue(props.count)}{content ?? children}</span> }
function Pagination(input: AdapterRenderProps) {
  const { props } = input
  const current = Math.max(1, number(props.current, 1)); const total = number(props.total); const pageSize = Math.max(1, number(props.pageSize, 20)); const pages = Math.max(1, Math.ceil(total / pageSize))
  const visible = Array.from({ length: Math.min(pages, 5) }, (_, index) => Math.min(pages, Math.max(1, current - 2) + index))
  return <div className="ds-pagination"><span>共 {total} 条</span><div><button type="button" disabled={current <= 1} onClick={event(input, 'onChange', current - 1)}>‹</button>{visible.map((page) => <button key={page} type="button" data-active={String(page === current)} onClick={event(input, 'onChange', page)}>{page}</button>)}<button type="button" disabled={current >= pages} onClick={event(input, 'onChange', current + 1)}>›</button></div>{props.showSizeChanger ? <select value={pageSize} onChange={(item) => input.runtime.trigger(input.node, 'onPageSizeChange', Number(item.target.value))}>{[6, 10, 20].map((size) => <option key={size} value={size}>{size} / 页</option>)}</select> : null}</div>
}
function statusLabel(status: unknown) { return ({ online: '在线', offline: '离线', error: '故障' } as Record<string, string>)[String(status)] ?? String(status) }
function Table(input: AdapterRenderProps) {
  const data = Array.isArray(input.props.dataSource) ? input.props.dataSource as Array<Record<string, unknown>> : []
  const columns = Array.isArray(input.props.columns) ? input.props.columns as Array<{ key: string; title: string; type?: string }> : []
  const selected = Array.isArray(input.props.selectedRowKeys) ? input.props.selectedRowKeys.map(String) : []
  const current = Math.max(1, number(input.props.page, 1)); const pageSize = Math.max(1, number(input.props.pageSize, 6)); const rows = data.slice((current - 1) * pageSize, current * pageSize)
  const updateSelection = (id: string, checked: boolean) => input.runtime.trigger(input.node, 'onSelectionChange', checked ? [...new Set([...selected, id])] : selected.filter((item) => item !== id))
  const allVisibleChecked = rows.length > 0 && rows.every((row) => selected.includes(String(row.id)))
  return <div className="ds-table-wrap"><table className="ds-table"><thead><tr><th><input aria-label="全选当前页" type="checkbox" checked={allVisibleChecked} onChange={(item) => input.runtime.trigger(input.node, 'onSelectionChange', item.target.checked ? [...new Set([...selected, ...rows.map((row) => String(row.id))])] : selected.filter((item) => !rows.some((row) => String(row.id) === item)))} /></th>{columns.map((column) => <th key={column.key}>{column.title}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={String(row.id)}><td><input aria-label={`选择 ${String(row.name)}`} type="checkbox" checked={selected.includes(String(row.id))} onChange={(item) => updateSelection(String(row.id), item.target.checked)} /></td>{columns.map((column) => <td key={column.key}>{column.type === 'status' ? <span className="ds-status" data-status={String(row.status)}><i />{statusLabel(row.status)}</span> : column.type === 'network' ? <span className="ds-network">{String(row.ip)}<small>{String(row.mac)}</small></span> : column.type === 'actions' ? <span className="ds-row-actions"><button type="button" onClick={event(input, 'onRowOpen', row)}>查看详情</button><button type="button" onClick={event(input, 'onRowUpgrade', row)}>升级</button><button type="button" onClick={event(input, 'onRowMore', row)}>更多</button></span> : column.key === 'name' ? <button className="ds-name-link" type="button" onClick={event(input, 'onRowOpen', row)}>{String(row.name)}</button> : String(row[column.key] ?? '—')}</td>)}</tr>)}</tbody></table>{rows.length === 0 ? <div className="ds-table-empty">{string(input.props.emptyText, '暂无数据')}</div> : null}</div>
}
function Drawer(input: AdapterRenderProps) {
  if (!input.props.open) return null
  return <div className="ds-drawer-layer" role="presentation" onMouseDown={event(input, 'onClose')}><aside className="ds-drawer" role="dialog" aria-modal="true" onMouseDown={(item) => item.stopPropagation()}><header>{input.slots.header}<button type="button" aria-label="关闭" onClick={event(input, 'onClose')}>×</button></header><section>{input.slots.content ?? input.children}</section>{input.slots.footer ? <footer>{input.slots.footer}</footer> : null}</aside></div>
}
function Form({ children }: AdapterRenderProps) { return <form className="ds-form" onSubmit={(event) => event.preventDefault()}>{children}</form> }
function Tabs(input: AdapterRenderProps) { const items = Array.isArray(input.props.items) ? input.props.items as Array<{ key: string; label: string }> : []; return <section className="ds-tabs"><nav>{items.map((item) => <button key={item.key} type="button" data-active={String(item.key === input.props.activeKey)} onClick={event(input, 'onChange', item.key)}>{item.label}</button>)}</nav><div>{input.children}</div></section> }
function Descriptions({ props }: AdapterRenderProps) { const items = Array.isArray(props.items) ? props.items as Array<{ label: string; value: unknown }> : []; return <dl className="ds-descriptions">{items.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{String(item.value ?? '—')}</dd></div>)}</dl> }
function Upload(input: AdapterRenderProps) { return <label className="ds-upload"><span>选择 Firmware 文件</span><input type="file" accept={string(input.props.accept)} onChange={(item: ChangeEvent<HTMLInputElement>) => input.runtime.trigger(input.node, 'onChange', item.target.files?.[0]?.name ?? '')} />{Boolean(input.runtime.state.upgrade) && <small>{String((input.runtime.state.upgrade as Record<string, unknown>).fileName ?? '')}</small>}</label> }
function DatePicker(input: AdapterRenderProps) { return <input className="ds-input" type="date" value={string(input.props.value)} onChange={(item) => input.runtime.trigger(input.node, 'onChange', item.target.value)} /> }
function TimePicker(input: AdapterRenderProps) { return <input className="ds-input" type="time" value={string(input.props.value)} onChange={(item) => input.runtime.trigger(input.node, 'onChange', item.target.value)} /> }
function Progress({ props }: AdapterRenderProps) { const percent = Math.min(100, Math.max(0, number(props.percent))); return <div className="ds-progress" data-status={string(props.status, 'normal')}><div><span style={{ width: `${percent}%` }} /></div>{props.showInfo !== false ? <b>{percent}%</b> : null}</div> }
function Empty({ props, content }: AdapterRenderProps) { return <div className="ds-empty"><strong>○</strong><p>{nodeValue(content ?? props.description ?? '暂无数据')}</p></div> }
function Spin({ props, children }: AdapterRenderProps) { return <div className="ds-spin" data-spinning={String(Boolean(props.spinning))}>{children}{props.spinning ? <span>{nodeValue(props.tip ?? '加载中')}</span> : null}</div> }
function Skeleton({ content }: AdapterRenderProps) { return <div className="ds-skeleton" aria-label="加载中"><i /><i /><i /><i /><p>{content}</p></div> }
function Result({ props, content }: AdapterRenderProps) { return <div className="ds-result" data-status={string(props.status, 'info')}><strong>{props.status === 'error' ? '!' : '✓'}</strong><h2>{nodeValue(content ?? props.title ?? '操作完成')}</h2>{props.subTitle ? <p>{String(props.subTitle)}</p> : null}</div> }
function Popconfirm(input: AdapterRenderProps) { return <button className="ds-button" type="button" onClick={() => { if (window.confirm(string(input.props.title, '确认执行此操作？'))) input.runtime.trigger(input.node, 'onConfirm') }}>{input.children ?? input.content}</button> }
function Message({ content }: AdapterRenderProps) { return <span>{content}</span> }

function registered(name: string, render: AdapterDefinition['render']): AdapterDefinition { return { status: 'registered', source: 'registry-backed-adapter', allowedProps: registryProps(name), render } }

export const adapterDefinitions: Record<string, AdapterDefinition> = {
  Layout: registered('Layout', Layout), Grid: registered('Grid', Grid), PageHeader: registered('PageHeader', PageHeader), Button: registered('Button', Button), Input: registered('Input', Input), Select: registered('Select', Select), Checkbox: registered('Checkbox', Checkbox), Space: registered('Space', Space), Card: registered('Card', Card), Statistic: registered('Statistic', Statistic), Typography: registered('Typography', Typography), Tag: registered('Tag', Tag), Badge: registered('Badge', Badge), Pagination: registered('Pagination', Pagination), Drawer: registered('Drawer', Drawer), Form: registered('Form', Form), Tabs: registered('Tabs', Tabs), Descriptions: registered('Descriptions', Descriptions), Upload: registered('Upload', Upload), DatePicker: registered('DatePicker', DatePicker), TimePicker: registered('TimePicker', TimePicker), Progress: registered('Progress', Progress), Empty: registered('Empty', Empty), Spin: registered('Spin', Spin), Skeleton: registered('Skeleton', Skeleton), Result: registered('Result', Result), Popconfirm: registered('Popconfirm', Popconfirm), Message: registered('Message', Message),
  'Input.Search': registered('Input.Search', InputSearch),
  Table: registered('Table', Table),
}
