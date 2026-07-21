import DOMPurify from 'dompurify'
import { marked } from 'marked'

// 配置 marked：启用 GFM（表格、删除线等）与换行转 <br>
marked.setOptions({
  breaks: true,
  gfm: true,
})

// 全局 hook：为所有 <a> 链接添加安全属性，统一在新标签页打开，防止 tabnabbing
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('href')) {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return ''
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target'],
  })
}

// 转义 HTML 特殊字符，防止 JSON 值中的内容注入
// 使用 String.fromCharCode 避免实体字符在源码中被二次转义
const ENT_AMP = String.fromCharCode(38) + 'amp;'   // &
const ENT_LT = String.fromCharCode(38) + 'lt;'     // <
const ENT_GT = String.fromCharCode(38) + 'gt;'     // >
const ENT_QUOT = String.fromCharCode(38) + 'quot;' // "
const ENT_SQUOT = String.fromCharCode(38) + '#39;' // '
function escapeHtml(str: unknown): string {
  return String(str)
    .replace(/&/g, ENT_AMP)
    .replace(/</g, ENT_LT)
    .replace(/>/g, ENT_GT)
    .replace(/"/g, ENT_QUOT)
    .replace(/'/g, ENT_SQUOT)
}

/**
 * 将结构化 JSON 数据渲染为 HTML。
 *
 * 支持的 JSON 结构：
 * - 数组：直接作为条目列表
 *   ["不限速", {"label":"节点","value":"50+"}]
 * - 对象：
 *   {
 *     "title": "套餐亮点",                 // 可选，渲染为小标题
 *     "items": [                           // 条目列表（也可用 "features"）
 *       "不限速高速节点",                   // 字符串 → 文本条目（带勾选图标）
 *       {"label":"节点数","value":"50+"},   // 键值对
 *       {"text":"支持多设备"},              // 文本项
 *       {"label":"官网","value":"前往","link":"https://..."},  // 链接键值对
 *       {"divider": true}                  // 分隔线
 *     ]
 *   }
 * - 对象还支持 "sections" 多分组：
 *   {
 *     "sections": [
 *       {"title":"基础","items":[...]},
 *       {"title":"高级","items":[...]}
 *     ]
 *   }
 * - 若对象无 items/features/sections，则将其余键值对作为条目渲染
 */
// 勾选图标 SVG（用于文本条目前缀）
const CHECK_ICON = '<svg class="ji" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'

// 渲染单个条目为 <li>
function renderJsonItem(item: unknown): string {
  if (item === null || item === undefined) return ''
  // 字符串 / 数字 → 文本条目
  if (typeof item === 'string' || typeof item === 'number') {
    return `<li class="jt-text">${CHECK_ICON}<span>${escapeHtml(item)}</span></li>`
  }
  if (typeof item !== 'object') return ''
  const it = item as Record<string, unknown>

  // 分隔线
  if (it.divider === true) return `<li class="jt-divider"></li>`

  // 键值对（含可选链接 / 高亮）
  if (it.label !== undefined && it.value !== undefined) {
    const hl = it.highlight ? ' is-hl' : ''
    const valueHtml = it.link
      ? `<a class="jt-value jt-link" href="${escapeHtml(it.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(it.value)}</a>`
      : `<span class="jt-value">${escapeHtml(it.value)}</span>`
    return `<li class="jt-kv${hl}"><span class="jt-label">${escapeHtml(it.label)}</span>${valueHtml}</li>`
  }

  // 纯文本项
  if (it.text !== undefined) {
    return `<li class="jt-text">${CHECK_ICON}<span>${escapeHtml(it.text)}</span></li>`
  }

  return ''
}

// 渲染一个分组（title + items 列表）
function renderJsonSection(title: string, items: unknown[]): string {
  const parts: string[] = []
  if (title) parts.push(`<h4 class="jt">${escapeHtml(title)}</h4>`)
  const lis = items.map(renderJsonItem).filter(Boolean)
  if (lis.length) parts.push(`<ul class="jt-list">${lis.join('')}</ul>`)
  return parts.join('')
}

function renderJsonContent(data: unknown): string {
  // 数组：直接作为单个分组的条目
  if (Array.isArray(data)) {
    return renderJsonSection('', data)
  }

  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>

    // 多分组模式
    if (Array.isArray(obj.sections)) {
      return (obj.sections as unknown[])
        .map((sec) => {
          if (sec && typeof sec === 'object') {
            const s = sec as Record<string, unknown>
            const secTitle = typeof s.title === 'string' ? s.title : ''
            const secItems = Array.isArray(s.items) ? s.items : (Array.isArray(s.features) ? s.features : [])
            return renderJsonSection(secTitle, secItems)
          }
          return ''
        })
        .filter(Boolean)
        .join('')
    }

    // 单分组模式
    const title = typeof obj.title === 'string' ? obj.title : ''
    let items: unknown[] = []
    if (Array.isArray(obj.items)) items = obj.items
    else if (Array.isArray(obj.features)) items = obj.features
    else {
      // 无显式列表时，把除 title 外的键值对转为条目
      items = Object.entries(obj)
        .filter(([k]) => k !== 'title')
        .map(([k, v]) => ({ label: k, value: v }))
    }
    return renderJsonSection(title, items)
  }

  return ''
}

/**
 * 渲染内容：统一用 marked 解析，同时支持 HTML 与 Markdown 格式。
 * 用于文档中心等纯文本/标记内容。
 *
 * 策略：
 * - marked 原生支持 HTML 块与行内 HTML：
 *   1. 纯 HTML：块级 HTML 原样透传
 *   2. 纯 Markdown：转换为 HTML
 *   3. HTML 与 Markdown 混排：Markdown 被解析，HTML 块/行内 HTML 保留
 * - 不再用“是否含 HTML 标签”做二选一判断，避免 Markdown 中夹带任意
 *   HTML 标签（如 <br>、<span>、代码块内 <div>、<details> 等）时整篇
 *   被当作纯 HTML 而跳过 Markdown 解析，导致 # 标题、列表等语法原样输出。
 * - 最终经 DOMPurify 消毒，防止 XSS。
 *
 * @param content 后端返回的原始内容
 * @returns 可安全用于 v-html 的 HTML 字符串
 */
export function renderContent(content: string | null | undefined): string {
  if (!content) return ''
  const trimmed = content.trim()
  if (!trimmed) return ''

  const html = marked.parse(trimmed, { async: false }) as string
  return sanitizeHtml(html)
}

function isLikelyPureHtml(text: string): boolean {
  if (!text.startsWith('<')) return false
  if (!/<\/[a-z][a-z0-9]*>/i.test(text)) return false
  const mdHeadings = /(^|\n)#{1,6}\s/.test(text)
  const mdUList = /(^|\n)[-*+]\s/.test(text)
  const mdOList = /(^|\n)\d+\.\s/.test(text)
  const mdBlockquote = /(^|\n)>\s/.test(text)
  const mdFence = /(^|\n)```/.test(text)
  if (mdHeadings || mdUList || mdOList || mdBlockquote || mdFence) return false
  return true
}

/**
 * 渲染富文本内容：同时支持 JSON、HTML 与 Markdown 格式。
 * 用于套餐介绍等需要结构化 JSON 渲染的场景。
 *
 * 判断策略（按优先级）：
 * 1. 内容以 { 或 [ 开头且能被 JSON.parse 解析 → 视为 JSON，结构化渲染
 * 2. 内容以 < 开头且包含块级 HTML 标签、无明显 Markdown 特征 → 视为纯 HTML，
 *    直接经 DOMPurify 消毒后返回，避免 marked 把缩进的 HTML 当作代码块
 * 3. 否则 → 统一用 marked 解析：marked 原生支持 HTML 块与行内 HTML，
 *    纯 Markdown 转换为 HTML、HTML 与 Markdown 混排则两者兼顾。
 * 4. 所有路径最终都经过 DOMPurify 消毒，防止 XSS。
 *
 * @param content 后端返回的原始内容
 * @returns 可安全用于 v-html 的 HTML 字符串
 */
export function renderRichContent(content: string | null | undefined): string {
  if (!content) return ''
  const trimmed = content.trim()
  if (!trimmed) return ''

  // 1. JSON 格式
  if (trimmed[0] === '{' || trimmed[0] === '[') {
    try {
      const data = JSON.parse(trimmed)
      const jsonHtml = renderJsonContent(data)
      if (jsonHtml) return sanitizeHtml(jsonHtml)
    } catch {
      // 解析失败，继续尝试其他格式
    }
  }

  // 2. 纯 HTML 格式（无明显 Markdown 特征）
  // 直接用 DOMPurify 消毒，避免 marked 把缩进的 HTML 误判为代码块
  if (isLikelyPureHtml(trimmed)) {
    return sanitizeHtml(trimmed)
  }

  // 3. Markdown / HTML 混排格式
  // marked 原生支持 HTML 块与行内 HTML，统一走 marked 解析。
  // 注意：ESM 模式下 marked.parse() 默认返回 Promise，需传入 {async: false} 强制同步
  const html = marked.parse(trimmed, { async: false }) as string
  return sanitizeHtml(html)
}

export function isSafeRedirect(path: string): boolean {
  if (!path) return false
  const decoded = decodeURIComponent(path).replace(/\\/g, '/')
  if (decoded.startsWith('/') && !decoded.startsWith('//')) return true
  return false
}

export function getSafeRedirect(path: string | undefined | null, fallback = '/dashboard'): string {
  if (!path) return fallback
  if (isSafeRedirect(path)) return path
  return fallback
}

export function isValidHttpUrl(url: string): boolean {
  if (!url) return true
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export function truncate(str: string | null | undefined, maxLen: number): string {
  if (!str) return ''
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen)
}
