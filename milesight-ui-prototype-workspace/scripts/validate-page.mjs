import fs from 'node:fs'
import Ajv2020 from 'ajv/dist/2020.js'

const schema = JSON.parse(fs.readFileSync(new URL('../page-schema.json', import.meta.url), 'utf8'))
const page = JSON.parse(fs.readFileSync(new URL('../src/examples/device-management.page.json', import.meta.url), 'utf8'))
const validate = new Ajv2020({ allErrors: true, strict: false }).compile(schema)

if (!validate(page)) {
  console.error(JSON.stringify(validate.errors, null, 2))
  process.exit(1)
}

console.log('page schema validation: pass')
