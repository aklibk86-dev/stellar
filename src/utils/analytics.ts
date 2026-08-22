// ============================================================
// 转化埋点事件总线（无第三方依赖）
// ============================================================
// 统一事件通道：track() 通过 window.dispatchEvent 广播 CustomEvent
// 'stellar:track'，任何分析平台脚本（或自建采集端）监听该事件即可接入，
// 无需改动前端代码即可切换/接入任意分析平台。
//
// 隐私约定：不采集邮箱、token、订阅链接等可识别个人信息，只传事件名
// 与业务 ID（订单号、套餐 ID、工单 ID 等）。
//
// 使用示例（页面/脚本侧监听）：
//   window.addEventListener('stellar:track', (e) => {
//     console.log(e.detail.event, e.detail.metadata)
//   })
// 脚本侧也可直接调用公开 API：
//   window.stellarAnalytics?.track('order_payment_success', { trade_no: 'xxx' })
// ============================================================

export interface AnalyticsEventDetail {
  event: string
  metadata?: Record<string, string | number | boolean | null | undefined>
}

export interface AnalyticsPublicApi {
  /** 上报一个业务事件；metadata 仅允许业务 ID，禁止传邮箱/token 等 PII */
  track(event: string, metadata?: Record<string, string | number | boolean | null | undefined>): void
}

/** 广播 'stellar:track' 事件 */
export const track = (event: string, metadata?: AnalyticsEventDetail['metadata']): void => {
  window.dispatchEvent(new CustomEvent<AnalyticsEventDetail>('stellar:track', {
    detail: { event, metadata },
  }))
}

// 与 customerService.ts 一致的公开 API 模式：任何脚本可无障碍调用
export const stellarAnalytics: AnalyticsPublicApi = { track }

if (typeof window !== 'undefined') {
  try {
    window.stellarAnalytics = stellarAnalytics
  } catch {
    // 极罕见的赋值失败场景（如严格 CSP 环境），事件总线本身不受影响
  }
}

/** 常用事件名常量，避免手写字符串漂移 */
export const ANALYTICS_EVENTS = {
  register_success: 'register_success',
  login_success: 'login_success',
  order_created: 'order_created',
  order_payment_success: 'order_payment_success',
  renew_success: 'renew_success',
  ticket_created: 'ticket_created',
  traffic_reset: 'traffic_reset',
} as const