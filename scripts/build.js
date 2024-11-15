import { transform } from '@svgr/core'
import { resolve, dirname, extname, basename } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import camelCase from 'camelcase'
import { optimize } from 'svgo'
import svgoConfig from '../svgo.config.js'
import svgoRawConfig from '../svgo.raw.config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const entryDir = resolve(__dirname, '../svgIncon/original')
const outDir = resolve(__dirname, '../src/incons/original')

const files = fs.readdirSync(entryDir, 'utf-8')
const indexFileName = 'index.ts'
const prefix = ''
const suffix = ''
const batches = files.filter(f => extname(f) === '.svg').map(async file => {
  try {
    const svgFileName = basename(file, '.svg')
    const componentName = `${prefix}${camelCase(svgFileName, { pascalCase: true })}${suffix}`
    const reactFileName = `${componentName}.tsx`
    const svgContent = fs.readFileSync(resolve(entryDir, file), 'utf-8')
    const config = file.includes('-raw.svg') ? svgoRawConfig : svgoConfig
    const result = optimize(svgContent, config)
    const jsxCode = await transform(result.data, {
      plugins: ['@svgr/plugin-jsx', '@svgr/plugin-prettier'],
      icon: true,
      typescript: true
    }, {
      componentName: componentName,
    })
    fs.writeFileSync(resolve(outDir, reactFileName), jsxCode, 'utf-8')
    return { fileName: reactFileName, componentName }
  } catch (error) {
    console.error(error)
    throw error
  }
})
const arr = await Promise.all(batches)
const indexFileContent = arr.map(a => `export { default as ${a.componentName} } from './${a.componentName}';`).join('\n')
fs.writeFileSync(resolve(outDir, indexFileName), indexFileContent, 'utf-8')
