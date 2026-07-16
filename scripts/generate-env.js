// ============================================================
// 运行时环境变量生成脚本
// ============================================================
// 说明：
//   用于静态部署平台（Vercel / Cloudflare Pages / Railway 等），
//   在构建时从环境变量覆盖 public/env.js 中的配置值。
//
// 设计原则：
//   只替换值，不改动变量名、注释、格式、引号风格。
//   直接基于文本定位 key: 后的值进行替换，不做全量序列化。
//
// 使用：
//   在 Vercel 构建命令中设为：node scripts/generate-env.js && npm run build
//   然后设置 STELLAR_ 前缀的环境变量即可覆盖对应配置。
// ============================================================

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ENV_FILE = resolve(__dirname, '..', 'public', 'env.js')

// 收集 STELLAR_ 前缀的环境变量覆盖值
function collectOverrides() {
  const env = (name) => {
    const v = process.env[name]
    return v !== undefined && v !== '' ? v : undefined
  }

  const o = {}
  const S = (key, val) => { if (val !== undefined) o[key] = val }

  S('title', env('STELLAR_TITLE'))
  S('description', env('STELLAR_DESCRIPTION'))
  S('assets_path', env('STELLAR_ASSETS_PATH'))
  S('background_url', env('STELLAR_BACKGROUND_URL'))
  S('logo', env('STELLAR_LOGO'))
  S('header_code', env('STELLAR_HEADER_CODE'))
  S('footer_code', env('STELLAR_FOOTER_CODE'))
  S('version', env('STELLAR_VERSION'))
  S('telegram_group', env('STELLAR_TELEGRAM_GROUP'))
  S('api_error_contact', env('STELLAR_API_ERROR_CONTACT'))
  S('landing_theme_mode', env('STELLAR_LANDING_THEME_MODE'))

  const le = env('STELLAR_LANDING_PAGE_ENABLED')
  if (le !== undefined) S('landing_page_enabled', le === 'true')

  const dl = {}
  for (const p of ['windows','macos','android','ios','linux','router']) {
    const v = env(`STELLAR_CLIENT_DOWNLOAD_${p.toUpperCase()}`)
    if (v !== undefined) dl[p] = v
  }
  if (Object.keys(dl).length > 0) o.client_downloads = dl

  const api = {}
  const urlMode = env('STELLAR_URL_MODE')
  if (urlMode !== undefined) api.url_mode = urlMode

  const urls = env('STELLAR_STATIC_BASE_URLS')
  if (urls !== undefined) api.static_base_urls = urls.split(',').map(s => s.trim()).filter(Boolean)

  const ce = env('STELLAR_CHECK_ENABLED')
  if (ce !== undefined) api.check_enabled = ce === 'true'

  const cp = env('STELLAR_CHECK_PATH')
  if (cp !== undefined) api.check_path = cp

  const pe = env('STELLAR_PROXY_ENABLED')
  if (pe !== undefined) api.proxy_enabled = pe === 'true'

  const pu = env('STELLAR_PROXY_URL')
  if (pu !== undefined) api.proxy_url = pu

  const pp = env('STELLAR_PROXY_PATH')
  if (pp !== undefined) api.proxy_path = pp

  const pm = env('STELLAR_PROXY_MODE')
  if (pm !== undefined) api.proxy_mode = pm

  if (Object.keys(api).length > 0) o.api = api

  return o
}

// 在文本中定位 settings 块
function extractSettingsBlock(content) {
  const marker = 'window.settings ='
  const idx = content.indexOf(marker)
  if (idx === -1) return null

  const brace = content.indexOf('{', idx + marker.length)
  if (brace === -1) return null

  let depth = 0, inStr = false, strChar = '', end = -1
  for (let i = brace; i < content.length; i++) {
    const c = content[i]
    if (inStr) {
      if (c === '\\') { i++; continue }
      if (c === strChar) inStr = false
      continue
    }
    if (c === '"' || c === "'" || c === '`') { inStr = true; strChar = c; continue }
    if (c === '{') depth++
    else if (c === '}') { depth--; if (depth === 0) { end = i + 1; break } }
  }

  if (end === -1) return null
  return { text: content.substring(brace, end), start: brace, end }
}

// 替换单个 key 的值
function replaceKeyValue(blockText, key, newValue) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`(${escapedKey}\\s*:)`, 'g')
  let match
  let result = blockText
  let replaced = false

  while ((match = pattern.exec(result)) !== null) {
    const colonPos = match.index + match[0].length
    const afterColon = result.substring(colonPos)
    const trimmed = afterColon.replace(/^(\s*)/, '')
    const leadingSpaces = afterColon.length - trimmed.length
    const valueStart = colonPos + leadingSpaces

    if (trimmed.length === 0) continue

    let valueEnd = -1
    let replacement = ''
    const firstCh = trimmed[0]

    if (firstCh === "'" || firstCh === '"') {
      // 字符串：找到匹配的结束引号
      let j = 1
      while (j < trimmed.length) {
        if (trimmed[j] === '\\') { j += 2; continue }
        if (trimmed[j] === firstCh) { valueEnd = colonPos + leadingSpaces + j + 1; break }
        j++
      }
      if (valueEnd > 0) {
        const q = firstCh
        if (q === "'") {
          replacement = "'" + newValue.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"
        } else {
          replacement = JSON.stringify(newValue)
        }
      }
    } else if (trimmed.startsWith('true') || trimmed.startsWith('false')) {
      const boolLen = trimmed.startsWith('true') ? 4 : 5
      valueEnd = colonPos + leadingSpaces + boolLen
      replacement = newValue === true || newValue === 'true' ? 'true' : 'false'
    } else if (trimmed[0] === '[') {
      // 数组：找到匹配的 ]
      let depth = 1, j = 1
      let inArrStr = false, arrStrChar = ''
      while (j < trimmed.length && depth > 0) {
        const ac = trimmed[j]
        if (inArrStr) {
          if (ac === '\\') { j += 2; continue }
          if (ac === arrStrChar) inArrStr = false
          j++; continue
        }
        if (ac === '"' || ac === "'") { inArrStr = true; arrStrChar = ac; j++; continue }
        if (ac === '[') depth++
        else if (ac === ']') depth--
        if (depth > 0) j++
      }
      valueEnd = colonPos + leadingSpaces + j + 1

      // 检测原数组是否多行
      const originalArr = trimmed.substring(1, j)
      const isMultiLine = originalArr.includes('\n')

      const items = newValue || []
      if (isMultiLine) {
        // 保持多行格式，从原数组中检测缩进
        const lines = originalArr.split('\n')
        let itemIndent = '      ' // 默认 6 空格
        for (const line of lines) {
          const t = line.trim()
          if (t && (t.startsWith("'") || t.startsWith('"'))) {
            const sp = line.match(/^\s*/)
            if (sp) itemIndent = sp[0]
            break
          }
        }
        const arrLines = items.map(v => `\n${itemIndent}'${v.replace(/'/g, "\\'")}',`)
        const bracketIndent = itemIndent.slice(0, -2) // 回退 2 格给 ]
        replacement = `[${arrLines.join('')}\n${bracketIndent}]`
      } else {
        // 单行格式，用单引号
        const arrContent = items.map(v => `'${v.replace(/'/g, "\\'")}'`).join(', ')
        replacement = `[${arrContent}]`
      }
    }

    if (valueEnd > 0 && replacement !== undefined) {
      const before = result.substring(0, valueStart)
      const after = result.substring(valueEnd)
      result = before + replacement + after
      replaced = true
      pattern.lastIndex = valueStart + replacement.length
    }
  }

  if (!replaced) {
    console.warn(`[generate-env] ⚠ 在 settings 块中未找到 "${key}" 的可替换位置`)
  }

  return result
}

// 递归替换嵌套对象的 key
function applyOverridesToBlock(blockText, obj, path = '') {
  let result = blockText

  for (const [key, val] of Object.entries(obj)) {
    const fullKey = path ? `${path}.${key}` : key

    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      // 嵌套对象，递归处理
      result = applyOverridesToBlock(result, val, fullKey)
    } else {
      result = replaceKeyValue(result, key, val)
    }
  }

  return result
}

// 主流程
function main() {
  const overrides = collectOverrides()
  const keys = Object.keys(overrides)

  if (keys.length === 0) {
    console.log('[generate-env] ✅ 未检测到 STELLAR_ 环境变量，保留原有 env.js')
    return
  }

  if (!existsSync(ENV_FILE)) {
    console.error(`[generate-env] ❌ 未找到 ${ENV_FILE}`)
    process.exit(1)
  }

  const content = readFileSync(ENV_FILE, 'utf-8')
  const block = extractSettingsBlock(content)

  if (!block) {
    console.error('[generate-env] ❌ 无法解析 env.js 中的 settings 块')
    process.exit(1)
  }

  const newBlockText = applyOverridesToBlock(block.text, overrides)

  if (newBlockText === block.text) {
    console.log('[generate-env] ⚠ 配置未变化，跳过写入')
    return
  }

  const before = content.substring(0, block.start)
  const after = content.substring(block.end)
  writeFileSync(ENV_FILE, before + newBlockText + after, 'utf-8')

  console.log(`[generate-env] ✅ public/env.js 已更新 ${keys.length} 个配置:`)
  for (const key of keys) {
    const val = overrides[key]
    if (typeof val === 'object' && !Array.isArray(val)) {
      console.log(`[generate-env]    - ${key}: { ${Object.keys(val).join(', ')} }`)
    } else {
      console.log(`[generate-env]    - ${key}: ${JSON.stringify(val).substring(0, 80)}`)
    }
  }
}

main()
