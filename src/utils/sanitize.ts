import DOMPurify from 'dompurify'

/**
 * 知识库文档正文内嵌的"一键导入"标记。
 *
 * 管理员在文档内容（HTML 或 Markdown 均可）中写入
 * `<stellar-import></stellar-import>`，
 * 知识库文档详情页渲染后会把该标记替换为"一键导入订阅"组件
 * （复用 SubscribeImportModal，支持 30+ 客户端与二维码扫码）。
 * 在其他页面（如套餐内容）该标记按普通空元素忽略，不产生任何可见内容。
 */
export const STELLAR_IMPORT_TAG = 'stellar-import'

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
    // DOMPurify 3.x 默认会移除未在配置中放行的自定义元素
    // （CUSTOM_ELEMENT_HANDLING.tagNameCheck 默认 null = 不放行任何自定义元素），
    // 这里仅放行知识库一键导入标记，属性不做任何放行（保持最小攻击面）。
    CUSTOM_ELEMENT_HANDLING: {
      tagNameCheck: (tagName: string) => tagName === STELLAR_IMPORT_TAG,
    },
  })
}
