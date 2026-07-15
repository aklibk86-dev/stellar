import http from './http'
import type {
  User, Subscribe, Stat, Plan, Order, Server, Ticket,
  Invite, Knowledge, KnowledgeCategory, Notice, Coupon,
  TrafficLog, PaymentMethod, GuestConfig,
  OrderCheckoutResult, InviteDetails,
  OrderListResponse, TicketListResponse, InviteListResponse, TrafficLogResponse,
} from './types'

// 规范化列表数据：兼容数组和 { data: [] } 两种格式
export function normalizeListData<T>(payload: T[] | { data: T[]; total?: number } | null | undefined): T[] {
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload.data)) return payload.data
  return []
}

// 规范化服务器列表：统一字段名 + 按 type 分组
export function normalizeServers(payload: any): Record<string, Server[]> {
  const list: Server[] = []
  if (Array.isArray(payload)) {
    for (const s of payload) {
      list.push({
        ...s,
        type: s.type || s.group || s.server_type || 'other',
        is_available: s.is_available ?? s.is_online ?? 0,
        tags: s.tags || [],
      })
    }
  } else if (payload && typeof payload === 'object') {
    for (const [type, servers] of Object.entries(payload as Record<string, any[]>)) {
      if (Array.isArray(servers)) {
        for (const s of servers) {
          list.push({
            ...s,
            type: s.type || type,
            is_available: s.is_available ?? s.is_online ?? 0,
            tags: s.tags || [],
          })
        }
      }
    }
  }
  const grouped: Record<string, Server[]> = {}
  for (const s of list) {
    if (!grouped[s.type]) grouped[s.type] = []
    grouped[s.type].push(s)
  }
  return grouped
}

// 规范化知识库文章列表：统一数组格式
export function normalizeKnowledge(payload: any): Knowledge[] {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === 'object') {
    const docs: Knowledge[] = []
    for (const [, group] of Object.entries(payload as Record<string, any[]>)) {
      if (Array.isArray(group)) docs.push(...group)
    }
    return docs
  }
  return []
}

// ===== Guest API (无需认证) =====
export const guestApi = {
  getConfig: () => http.get<GuestConfig>('/api/v1/guest/comm/config'),
  getPlans: () => http.get<Plan[]>('/api/v1/guest/plan/fetch'),
}

// ===== Passport API (认证) =====
export const passportApi = {
  login: (email: string, password: string) =>
    http.post<{ token: string; auth_data: string; is_admin: boolean }>('/api/v1/passport/auth/login', { email, password }),
  register: (email: string, password: string, invite_code?: string, email_code?: string) =>
    http.post<{ token: string; auth_data: string; is_admin: boolean }>('/api/v1/passport/auth/register', {
      email, password, invite_code, email_code,
    }),
  forget: (email: string, password: string, email_code: string) =>
    http.post<Record<string, never>>('/api/v1/passport/auth/forget', { email, password, email_code }),
  token2Login: (token: string) =>
    http.get<{ token: string; auth_data: User }>('/api/v1/passport/auth/token2Login', { params: { token } }),
  getQuickLoginUrl: () =>
    http.post<{ url: string }>('/api/v1/passport/auth/getQuickLoginUrl'),
  loginWithMailLink: (email: string, email_code: string, redirect?: string) =>
    http.post<{ token: string; auth_data: User }>('/api/v1/passport/auth/loginWithMailLink', {
      email, email_code, redirect,
    }),
  sendEmailVerify: (email: string, password?: string) =>
    http.post<Record<string, never>>('/api/v1/passport/comm/sendEmailVerify', { email, password }),
}

// ===== User API (需登录) =====
export const userApi = {
  getInfo: () => http.get<User>('/api/v1/user/info'),
  getSubscribe: () => http.get<Subscribe>('/api/v1/user/getSubscribe'),
  getStat: () => http.get<Stat>('/api/v1/user/getStat'),
  changePassword: (oldpwd: string, newpwd: string) =>
    http.post<Record<string, never>>('/api/v1/user/changePassword', { oldpwd, newpwd }),
  update: (data: Partial<User>) =>
    http.post<Record<string, never>>('/api/v1/user/update', data),
  getQuickLoginUrl: () =>
    http.post<{ url: string }>('/api/v1/user/getQuickLoginUrl'),
  checkLogin: () => http.get<Record<string, never>>('/api/v1/user/checkLogin'),
  // 佣金划转：amount 单位为「分」，与 commission_balance 单位一致
  transfer: (amount: number) =>
    http.post<Record<string, never>>('/api/v1/user/transfer', { transfer_amount: amount }),
  resetSecurity: () => http.get<{ token: string }>('/api/v1/user/resetSecurity'),
  getActiveSession: () => http.get<any[]>('/api/v1/user/getActiveSession'),
  removeActiveSession: (session_id: string) =>
    http.post<Record<string, never>>('/api/v1/user/removeActiveSession', { session_id }),

  // 订单
  getOrderList: (page = 1, pageSize = 20) =>
    http.get<OrderListResponse>('/api/v1/user/order/fetch', { params: { page, page_size: pageSize } }),
  orderSave: (plan_id: number, period: string, coupon_code?: string) =>
    http.post<string | { trade_no: string }>('/api/v1/user/order/save', {
      plan_id, period, ...(coupon_code ? { coupon_code } : {}),
    }),
  orderCheckout: (trade_no: string, method: number | string) =>
    http.post<OrderCheckoutResult>('/api/v1/user/order/checkout', { trade_no, method }),
  orderCheck: (trade_no: string) =>
    http.get<{ status: number }>('/api/v1/user/order/check', { params: { trade_no } }),
  orderDetail: (trade_no: string) =>
    http.get<Order>('/api/v1/user/order/detail', { params: { trade_no } }),
  orderCancel: (trade_no: string) =>
    http.post<Record<string, never>>('/api/v1/user/order/cancel', { trade_no }),
  getPaymentMethod: () =>
    http.get<PaymentMethod[]>('/api/v1/user/order/getPaymentMethod'),

  // 套餐
  getPlans: () => http.get<Plan[]>('/api/v1/user/plan/fetch'),

  // 邀请
  getInviteList: (page = 1) =>
    http.get<InviteListResponse>('/api/v1/user/invite/fetch', { params: { page } }),
  getInviteDetails: () =>
    http.get<InviteDetails>('/api/v1/user/invite/details'),
  saveInvite: () =>
    http.get<{ code: string }>('/api/v1/user/invite/save'),

  // 公告
  getNotices: () => http.get<Notice[]>('/api/v1/user/notice/fetch'),

  // 工单
  getTicketList: (page = 1) =>
    http.get<TicketListResponse>('/api/v1/user/ticket/fetch', { params: { page } }),
  getTicketDetail: (id: number) =>
    http.get<Ticket>('/api/v1/user/ticket/fetch', { params: { id } }),
  createTicket: (subject: string, level: number, message: string) =>
    http.post<{ id: number }>('/api/v1/user/ticket/save', { subject, level, message }),
  replyTicket: (id: number, message: string) =>
    http.post<Record<string, never>>('/api/v1/user/ticket/reply', { id, message }),
  closeTicket: (id: number) =>
    http.post<Record<string, never>>('/api/v1/user/ticket/close', { id }),
  withdrawTicket: (id: number) =>
    http.post<Record<string, never>>('/api/v1/user/ticket/withdraw', { id }),

  // 服务器
  getServers: () => http.get<Record<string, Server[]>>('/api/v1/user/server/fetch'),

  // 优惠券
  checkCoupon: (code: string) =>
    http.post<Coupon>('/api/v1/user/coupon/check', { code }),

  // 知识库
  getKnowledgeCategories: () =>
    http.get<KnowledgeCategory[]>('/api/v1/user/knowledge/getCategory'),
  getKnowledge: (keyword?: string, language?: string) =>
    http.get<Knowledge[]>('/api/v1/user/knowledge/fetch', { params: { keyword, language } }),

  // 流量统计
  getTrafficLog: (page = 1, pageSize = 20) =>
    http.get<TrafficLogResponse>('/api/v1/user/stat/getTrafficLog', { params: { page, page_size: pageSize } }),

  // 礼品卡
  checkGiftCard: (code: string) =>
    http.post<any>('/api/v1/user/gift-card/check', { code }),
  redeemGiftCard: (code: string) =>
    http.post<any>('/api/v1/user/gift-card/redeem', { code }),
  getGiftCardHistory: (page = 1) =>
    http.get<any[]>('/api/v1/user/gift-card/history', { params: { page } }),

  // Telegram
  getTelegramBotInfo: () =>
    http.get<any>('/api/v1/user/telegram/getBotInfo'),

  // Stripe
  getStripePublicKey: () =>
    http.post<{ public_key: string }>('/api/v1/user/comm/getStripePublicKey'),
}
