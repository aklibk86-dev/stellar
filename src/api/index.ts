import http from './http'
import type {
  User, Subscribe, Stat, Plan, Order, Server, Ticket,
  Invite, Knowledge, KnowledgeCategory, Notice, Coupon,
  TrafficLog, PaymentMethod, GuestConfig, UserConfig,
  OrderCheckoutResult, InviteDetails,
  OrderListResponse, TicketListResponse, InviteListResponse, TrafficLogResponse,
} from './types'
import { getApiPaths, can } from '@/utils/backend'

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

// 获取当前后端的 API 路径表（每次调用动态获取，以便 backend_type 切换后立即生效）
const paths = () => getApiPaths()

// ===== Guest API (无需认证) =====
export const guestApi = {
  getConfig: () => http.get<GuestConfig>(paths().guestConfig),
  getPlans: () => {
    // v2board 无游客套餐接口，返回空数组以便前端回退到示例套餐
    const url = paths().guestPlanFetch
    if (!url) return Promise.resolve({ data: [] as Plan[] })
    return http.get<Plan[]>(url)
  },
}

// ===== Passport API (认证) =====
export const passportApi = {
  login: (email: string, password: string) =>
    http.post<{ token: string; auth_data: string; is_admin: boolean }>(paths().login, { email, password }),
  register: (email: string, password: string, invite_code?: string, email_code?: string) =>
    http.post<{ token: string; auth_data: string; is_admin: boolean }>(paths().register, {
      email, password, invite_code, email_code,
    }),
  forget: (email: string, password: string, email_code: string) =>
    http.post<Record<string, never>>(paths().forget, { email, password, email_code }),
  token2Login: (verify: string) =>
    http.get<{ token: string; auth_data: string; is_admin: boolean }>(paths().token2Login, { params: { verify } }),
  getQuickLoginUrl: () =>
    http.post<{ url: string }>(paths().getQuickLoginUrl),
  loginWithMailLink: (email: string, redirect?: string) => {
    // v2board 不支持魔法链接登录
    if (!can('magicLinkLogin')) {
      return Promise.reject({ status: 0, message: '当前后端不支持邮箱链接登录' })
    }
    return http.post<boolean>(paths().loginWithMailLink, {
      email, redirect,
    })
  },
  sendEmailVerify: (email: string, password?: string) =>
    http.post<Record<string, never>>(paths().sendEmailVerify, { email, password }),
}

// ===== User API (需登录) =====
export const userApi = {
  getInfo: () => http.get<User>(paths().userInfo),
  getSubscribe: () => http.get<Subscribe>(paths().userSubscribe),
  getStat: () => http.get<Stat>(paths().userStat),
  changePassword: (oldPassword: string, newPassword: string) =>
    http.post<Record<string, never>>(paths().changePassword, {
      old_password: oldPassword,
      new_password: newPassword,
    }),
  update: (data: Partial<User>) =>
    http.post<Record<string, never>>(paths().userUpdate, data),
  changeEmail: (email: string, emailCode: string) =>
    http.post<Record<string, never>>(paths().userUpdate, { email, email_code: emailCode }),
  getQuickLoginUrl: () =>
    http.post<{ url: string }>(paths().userQuickLoginUrl),
  checkLogin: () => http.get<Record<string, never>>(paths().checkLogin),
  // 佣金划转：amount 单位为「分」，与 commission_balance 单位一致
  transfer: (amount: number) =>
    http.post<Record<string, never>>(paths().transfer, { transfer_amount: amount }),
  resetSecurity: () => http.get<string>(paths().resetSecurity),
  getActiveSession: () => http.get<any[]>(paths().getActiveSession),
  removeActiveSession: (session_id: string) =>
    http.post<Record<string, never>>(paths().removeActiveSession, { session_id }),
  getConfig: () => http.get<UserConfig>(paths().userConfig),
  // 流量提前重置（仅 v2board 支持）
  newPeriod: () => {
    if (!can('newPeriod')) {
      return Promise.reject({ status: 0, message: '当前后端不支持流量提前重置' })
    }
    return http.post<Record<string, never>>(paths().newPeriod)
  },
  // 解绑 Telegram（仅 v2board 支持）
  unbindTelegram: () => {
    if (!can('unbindTelegram')) {
      return Promise.reject({ status: 0, message: '当前后端不支持解绑 Telegram' })
    }
    return http.get<Record<string, never>>(paths().unbindTelegram)
  },

  // 订单
  getOrderList: (page = 1, pageSize = 20, signal?: AbortSignal) =>
    http.get<OrderListResponse>(paths().orderFetch, { params: { page, page_size: pageSize }, signal, silent: true }),
  orderSave: (plan_id: number, period: string, coupon_code?: string) =>
    http.post<string | { trade_no: string }>(paths().orderSave, {
      plan_id, period, ...(coupon_code ? { coupon_code } : {}),
    }),
  orderCheckout: (trade_no: string, method: number | string) =>
    http.post<OrderCheckoutResult>(paths().orderCheckout, { trade_no, method }),
  orderCheck: (trade_no: string) =>
    http.get<{ status: number }>(paths().orderCheck, { params: { trade_no } }),
  orderDetail: (trade_no: string) =>
    http.get<Order>(paths().orderDetail, { params: { trade_no } }),
  orderCancel: (trade_no: string) =>
    http.post<Record<string, never>>(paths().orderCancel, { trade_no }),
  getPaymentMethod: () =>
    http.get<PaymentMethod[]>(paths().getPaymentMethod),

  // 套餐
  getPlans: () => http.get<Plan[]>(paths().planFetch),

  // 邀请
  getInviteList: (page = 1) =>
    http.get<InviteListResponse>(paths().inviteFetch, { params: { page } }),
  getInviteDetails: () =>
    http.get<InviteDetails>(paths().inviteDetails),
  saveInvite: () =>
    http.get<{ code: string }>(paths().inviteSave),

  // 公告
  getNotices: () => http.get<Notice[]>(paths().noticeFetch),

  // 工单
  getTicketList: (page = 1, signal?: AbortSignal) =>
    http.get<TicketListResponse>(paths().ticketFetch, { params: { page }, signal, silent: true }),
  getTicketDetail: (id: number) =>
    http.get<Ticket>(paths().ticketFetch, { params: { id } }),
  createTicket: (subject: string, level: number, message: string) =>
    http.post<{ id: number }>(paths().ticketSave, { subject, level, message }),
  replyTicket: (id: number, message: string) =>
    http.post<Record<string, never>>(paths().ticketReply, { id, message }),
  closeTicket: (id: number) =>
    http.post<Record<string, never>>(paths().ticketClose, { id }),
  // 通过工单发起佣金提现
  withdrawTicket: (withdraw_method: string, withdraw_account: string) => {
    if (!can('ticketWithdraw')) {
      return Promise.reject({ status: 0, message: '当前后端不支持工单提现' })
    }
    return http.post<Record<string, never>>(paths().ticketWithdraw, { withdraw_method, withdraw_account })
  },

  // 服务器
  getServers: () => http.get<Record<string, Server[]>>(paths().serverFetch),

  // 优惠券
  checkCoupon: (code: string) =>
    http.post<Coupon>(paths().couponCheck, { code }),

  // 知识库 - xboard 后端需要 language 参数(zh-CN)才能返回对应语言文档
  getKnowledgeCategories: () =>
    http.get<KnowledgeCategory[]>(paths().knowledgeGetCategory, { silent: true }),
  getKnowledge: (keyword?: string, language?: string) =>
    http.get<Knowledge[]>(paths().knowledgeFetch, { params: { keyword, language }, silent: true }),

  // 流量统计
  getTrafficLog: (page = 1, pageSize = 20) =>
    http.get<TrafficLogResponse>(paths().trafficLog, { params: { page, page_size: pageSize } }),

  // 礼品卡（xboard 完整模块，v2board 仅兑换）
  checkGiftCard: (code: string) => {
    if (!can('giftCardFull')) {
      return Promise.reject({ status: 0, message: '当前后端不支持礼品卡校验' })
    }
    return http.post<any>(paths().giftCardCheck, { code })
  },
  redeemGiftCard: (code: string) => {
    // v2board 与 xboard 都支持兑换，但路径不同
    const url = paths().giftCardRedeem
    if (!url) {
      return Promise.reject({ status: 0, message: '当前后端不支持礼品卡兑换' })
    }
    return http.post<any>(url, { code })
  },
  getGiftCardHistory: (page = 1) => {
    if (!can('giftCardFull')) {
      return Promise.resolve({ data: [] as any[] })
    }
    return http.get<any[]>(paths().giftCardHistory, { params: { page } })
  },

  // Telegram
  getTelegramBotInfo: () =>
    http.get<any>(paths().telegramBotInfo),

  // Stripe
  getStripePublicKey: (id: number) =>
    http.post<string>(paths().stripePublicKey, { id }),
}
