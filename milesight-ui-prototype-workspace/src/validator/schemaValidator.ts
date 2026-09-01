import Ajv2020 from 'ajv/dist/2020'
import rawSchema from '../../page-schema.json'
import type { PageDocument } from '../renderer/types'
import type { ValidationIssue } from './types'

const ajv = new Ajv2020({ allErrors: true, strict: false })
const validate = ajv.compile(rawSchema)

export function validateSchema(page: PageDocument): ValidationIssue[] {
  const valid = validate(page)
  if (valid) return []
  return (validate.errors ?? []).map((error) => ({
    severity: 'error' as const,
    code: 'SCHEMA' as const,
    message: `${error.instancePath || 'page'} ${error.message ?? 'does not satisfy page schema'}`,
  }))
}
