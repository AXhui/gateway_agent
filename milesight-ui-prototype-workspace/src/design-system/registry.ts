import rawRegistry from '../../component-registry.json'
import type { ComponentRegistry } from '../renderer/types'

export const registry = rawRegistry as ComponentRegistry

export function applyDesignTokens(theme: 'light' | 'dark' = 'light') {
  for (const group of Object.values(registry.tokenCatalog)) {
    for (const token of group) {
      const value = theme === 'dark' ? token.dark ?? token.light : token.light
      document.documentElement.style.setProperty(token.name, value)
    }
  }
}
