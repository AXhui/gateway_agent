import { useEffect, useState } from 'react'
import pageDocument from '../examples/test-cases/device-offline-alert-config.page.json'
import deviceManagementPage from './examples/device-management.page.json'
import { applyDesignTokens, registry } from './design-system/registry'
import type { PageDocument } from './renderer/types'
import { validateDesignSystem } from './validator/designSystemValidator'
import { validateSchema } from './validator/schemaValidator'
import { Workspace, type WorkspaceGeneration } from './workspace/Workspace'

const offlineAlertRequirement = '做一个设备离线告警配置页面。\n运维人员可以选择设备，\n设置离线多久后触发告警，\n选择邮件通知，\n并查看最近的离线告警记录。'
const deviceManagementRequirement = '做一个设备管理页面，运维人员可以快速查找设备、查看在线或离线状态，并查看设备详细信息。'
const promptOnlyExamples: Record<string, string> = {
  'firmware-upgrade': '做一个 Firmware Upgrade 页面，支持选择设备、上传 Firmware、设置升级时间并查看升级进度。',
  'gateway-detail': '做一个 Gateway Detail 页面，展示网关状态、网络信息、Firmware 和最近事件。',
}

export default function App() {
  const [page, setPage] = useState<PageDocument>(pageDocument as PageDocument)
  const [pageVersion, setPageVersion] = useState(0)
  const [requirement, setRequirement] = useState(offlineAlertRequirement)
  const [generation, setGeneration] = useState<WorkspaceGeneration>({ status: 'idle' })
  useEffect(() => applyDesignTokens('light'), [])
  const refreshPage = () => setPageVersion((value) => value + 1)
  const generate = () => {
    const expected = page.meta.pageId === 'device-offline-alert-config' ? offlineAlertRequirement : deviceManagementRequirement
    if (requirement.trim() !== expected.trim()) { setGeneration({ status: 'idle', message: 'Manual Generation Mode — current workspace uses pre-generated Page JSON.' }); return }
    setGeneration({ status: 'validating', message: 'Reading requirement… Validating Design System…' })
    window.setTimeout(() => {
      const schemaIssues = validateSchema(page)
      const report = validateDesignSystem(page, registry)
      if (schemaIssues.length > 0 || report.issues.some((issue) => issue.severity === 'error')) { setGeneration({ status: 'error', message: 'Validation failed. The current prototype was kept unchanged.' }); return }
      refreshPage()
      setGeneration({ status: 'ready', message: 'Prototype ready — current pre-generated Page JSON was reloaded.' })
    }, 120)
  }
  const selectExample = (id: string) => {
    if (id === 'offline-alert') { setPage(pageDocument as PageDocument); setRequirement(offlineAlertRequirement); setGeneration({ status: 'ready', message: 'Offline Alert example loaded.' }); refreshPage(); return }
    if (id === 'device-management') { setPage(deviceManagementPage as PageDocument); setRequirement(deviceManagementRequirement); setGeneration({ status: 'ready', message: 'Device Management example loaded.' }); refreshPage(); return }
    setRequirement(promptOnlyExamples[id] ?? '')
    setGeneration({ status: 'idle', message: 'Requirement loaded. Manual generation is required because no Page JSON exists for this example.' })
  }
  return <Workspace page={page} pageVersion={pageVersion} requirement={requirement} generation={generation} onRequirementChange={(value) => { setRequirement(value); setGeneration({ status: 'idle' }) }} onGenerate={generate} onSelectExample={selectExample} onRefresh={refreshPage} onNewPrototype={() => selectExample('offline-alert')} />
}
