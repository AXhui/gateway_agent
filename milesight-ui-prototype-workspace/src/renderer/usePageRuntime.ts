import { useCallback, useMemo, useState } from 'react'
import type { ComponentNode, FlowAction, PageDocument, RendererRuntime, Toast } from './types'
import { resolveEventPayload, resolveFlowValue } from './valueResolver'

function setAtPath(source: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const copy = structuredClone(source)
  const keys = path.split('.')
  let cursor: Record<string, unknown> = copy
  keys.slice(0, -1).forEach((key) => {
    const existing = cursor[key]
    cursor[key] = existing && typeof existing === 'object' ? existing as Record<string, unknown> : {}
    cursor = cursor[key] as Record<string, unknown>
  })
  cursor[keys[keys.length - 1] ?? path] = value
  return copy
}

export function usePageRuntime(page: PageDocument) {
  const [state, setState] = useState<Record<string, unknown>>(() => structuredClone(page.state ?? {}))
  const [dataSources, setDataSources] = useState<Record<string, unknown>>(() => Object.fromEntries((page.dataSources ?? []).map((source) => [source.id, structuredClone(source.data)])))
  const [toasts, setToasts] = useState<Toast[]>([])

  const notify = useCallback((type: Toast['type'], content: string) => {
    const toast = { id: `${Date.now()}-${Math.random()}`, type, content }
    setToasts((items) => [...items, toast])
    if (type !== 'loading') window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== toast.id)), 3200)
  }, [])

  const runCustom = useCallback((target: string | undefined) => {
    const selected = (state.selectedDeviceIds ?? []) as string[]
    if (target === 'start-upgrade') {
      const steps = [26, 48, 72, 100]
      steps.forEach((progress, index) => window.setTimeout(() => {
        setState((current) => setAtPath(setAtPath(current, 'upgrade.progress', progress), 'upgrade.status', progress === 100 ? 'success' : 'active'))
        if (progress === 100) {
          setDataSources((sources) => ({ ...sources, devices: Array.isArray(sources.devices) ? sources.devices.map((device) => selected.includes((device as Record<string, unknown>).id as string) ? { ...device as Record<string, unknown>, firmware: (state.upgrade as Record<string, unknown>).firmware, status: 'online', lastSeen: '刚刚' } : device) : sources.devices }))
          setState((current) => setAtPath(current, 'upgrade.running', false))
          notify('success', 'Upgrade task created successfully')
        }
      }, (index + 1) * 650))
      return
    }
    if (target === 'export-devices' || target === 'export-selected') {
      const devices = Array.isArray(dataSources.devices) ? dataSources.devices as Array<Record<string, unknown>> : []
      const exportRows = target === 'export-selected' ? devices.filter((device) => selected.includes(String(device.id))) : devices
      const blob = new Blob([JSON.stringify(exportRows, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = target === 'export-selected' ? 'selected-devices.json' : 'devices.json'
      anchor.click()
      URL.revokeObjectURL(url)
      notify('success', `${exportRows.length} 台设备已导出`)
    }
  }, [dataSources.devices, notify, state.selectedDeviceIds, state.upgrade])

  const executeAction = useCallback((action: FlowAction, payload: Record<string, unknown>) => {
    const value = resolveFlowValue(action.value, payload)
    if (action.type === 'set-state' || action.type === 'select') {
      if (action.key) setState((current) => setAtPath(current, action.key as string, value))
      return
    }
    if (action.type === 'open' || action.type === 'close') {
      if (action.target) setState((current) => setAtPath(current, `openTargets.${action.target}`, action.type === 'open'))
      return
    }
    if (action.type === 'notify') notify(action.status ?? 'info', action.message ?? '')
    if (action.type === 'custom') runCustom(action.target)
  }, [notify, runCustom])

  const trigger = useCallback((node: ComponentNode, eventName: string, event?: unknown) => {
    const binding = node.events?.[eventName]
    const flow = (page.flows ?? []).find((item) => item.id === binding?.flowId)
    if (!binding || !flow) return
    const payload = resolveEventPayload(binding.payload, event)
    flow.steps.forEach((action) => executeAction(action, payload))
  }, [executeAction, page.flows])

  const runtime = useMemo<RendererRuntime>(() => ({ state, dataSources, trigger }), [dataSources, state, trigger])
  return { runtime, toasts, setState }
}
