// Xboard API 类型定义

// 用户信息
export interface User {
  email: string
  transfer_enable: number
  last_login_at: number | null
  created_at: number
  banned: boolean
  remind_expire: boolean
  remind_traffic: boolean
  expired_at: number | null
  balance: number
  commission_balance: number
  plan_id: number | null
  discount: number | null
  commission_rate: number | null
  telegram_id: number | null
  uuid: string
  avatar_url: string
  sign?: string
  // v2board 独有：用户信息中返回设备限制与自动续费
  device_limit?: number | null
  auto_renewal?: boolean
}

// 订阅信息
export interface Subscribe {
  plan_id: number | null
  token: string
  expired_at: number | null
  u: number
  d: number
  transfer_enable: number
  email: string
  uuid: string
  device_limit: number | null
  speed_limit: number | null
  next_reset_at: number | null
  subscribe_url: string
  reset_day: number | null
  plan: Plan | null
  // v2board 独有：当前在线 IP 数与是否允许流量提前重置
  alive_ip?: number
  allow_new_period?: boolean
}

// 统计信息
export interface Stat {
  up_rate: number
  down_rate: number
  last_traffic_at: number | null
  u: number
  d: number
  total_up: number
  total_down: number
}

// 套餐
export interface Plan {
  id: number
  group_id: number | null
  name: string
  tags: string[]
  content: string
  month_price: number | null
  quarter_price: number | null
  half_year_price: number | null
  year_price: number | null
  two_year_price: number | null
  three_year_price: number | null
  onetime_price: number | null
  reset_price: number | null
  // 库存/订阅人数上限（Xboard capacity_limit）：
  // null = 不限量；正整数 = 上限；0 或后端本地化的 "Sold out"/"已售罄" 字符串 = 已售罄
  // 语义随后端不同：Xboard 返回上限（总数），v2board 返回剩余库存
  // Xboard 售罄套餐兼容约定：后端插件可仅在列表筛选条件中按 capacity_limit + 1
  // 计算以保留该记录，响应中的 capacity_limit 仍需返回真实 0/"Sold out"，供前端正确显示售罄。
  capacity_limit: number | string | null
  // 后端库存补丁新增字段（可选，未打补丁时不存在）：
  // capacity_total = 库存总数；capacity_remaining = 剩余库存（0/"Sold out" = 售罄，null = 不限量）
  capacity_total?: number | string | null
  capacity_remaining?: number | string | null
  transfer_enable: number
  speed_limit: number | null
  device_limit: number | null
  show: boolean
  sell: boolean
  renew: boolean
  reset_traffic_method: string | null
  sort: number | null
  created_at: number
  updated_at: number
}

// 订单
export interface Order {
  id: number
  trade_no: string
  plan_id: number
  period: string
  total_amount: number
  discount_amount: number
  surplus_amount: number
  refund_amount: number
  balance_amount: number
  surplus_transfer: number
  commission_balance: number
  actual_commission_balance: number
  paid_at: number | null
  created_at: number
  updated_at: number
  cancel_at: number | null
  status: number
  commission_status: number
  commission_type: number
  try_out_plan_id: number | null
  plan: Plan | null
  payment_id?: number
  coupon_code?: string | null
}

// 订单结算返回
export interface OrderCheckoutResult {
  trade_no?: string
  url?: string
  qr_code?: string
  content?: string
  type?: string
  payment_id?: number
}

// 邀请详情
export interface InviteDetails {
  inviter_id: number | null
  commission_rate: number
  commission_balance: number
  total_get: number
  total_invite: number
  level: number
  level_name: string | null
  next_level_condition: string | null
  level_percent: number
}

// 流量日志分页
export interface TrafficLogResponse {
  data: TrafficLog[]
  total?: number
  current_page?: number
  last_page?: number
  per_page?: number
}

// 订单列表分页
export interface OrderListResponse {
  data: Order[]
  total?: number
  current_page?: number
  last_page?: number
  per_page?: number
}

// 工单列表分页
export interface TicketListResponse {
  data: Ticket[]
  total?: number
  current_page?: number
  last_page?: number
  per_page?: number
}

// 邀请记录分页
export interface InviteListResponse {
  data: Invite[]
  total?: number
  current_page?: number
  last_page?: number
  per_page?: number
}

// 服务器/线路
export interface Server {
  id: number
  name: string
  type: string
  host: string
  port: number
  server_name: string
  tags: string[] | null
  rate: string
  show: number
  last_check_at: number | null
  is_available: number
  traffic: {
    up: number
    down: number
    total: number
  } | null
}

// 工单
export interface Ticket {
  id: number
  subject: string
  level: number
  status: number
  reply_status?: number
  updated_at: number
  created_at: number
  message?: any
  reply: {
    id: number
    message: string
    created_at: number
    is_me: number
  }[] | null
}

// 邀请
export interface Invite {
  user_id: number
  code: string
  status: string
  created_at: number
  invite_user: {
    id: number
    email: string
    created_at: number
    status: string
  } | null
}

// 知识库分类
export interface KnowledgeCategory {
  id: number
  name: string
  category: string
}

// 知识库文章
export interface Knowledge {
  id: number
  category: string
  title: string
  body: string
  updated_at: number
  show: number
}

// 公告
export interface Notice {
  id: number
  title: string
  content: string
  created_at: number
  show: number
  tags: string[] | null
  img_url: string | null
}

// 优惠券
export interface Coupon {
  code: string
  name: string
  type: 'fixed' | 'percentage'  // 统一格式：fixed=固定金额, percentage=百分比
  value: number  // percentage 时为小数（如 0.2 表示 20%）
  limit_use: number | null
  limit_use_with_user: number | null
  limit_period: string[] | null
  limit_plan: number[] | null
  started_at: number | null
  ended_at: number | null
  use_count: number
}

// 流量日志
export interface TrafficLog {
  id: number
  user_id: number
  server_id: number
  u: number
  d: number
  record_at: number
  server_name: string
  server_rate: string
}

// 支付方式
export interface PaymentMethod {
  id: number
  name: string
  payment: string
  icon: string | null
  handling_fee_fixed: number
  handling_fee_percent: number
}

export interface UserConfig {
  is_telegram?: number
  telegram_discuss_link?: string | null
  withdraw_methods?: string[]
  withdraw_close?: number
  currency?: string
  currency_symbol?: string
}

// 站点配置
export interface GuestConfig {
  tos_url: string | null
  is_email_verify: number
  is_invite_force: number
  email_whitelist_suffix: number | string[]
  is_captcha: number
  captcha_type: string
  recaptcha_site_key: string | null
  recaptcha_v3_site_key: string | null
  recaptcha_v3_score_threshold: number
  turnstile_site_key: string | null
  app_description: string | null
  app_url: string | null
  logo: string | null
  is_recaptcha: number
  telegram_group?: string | null
  telegram?: string | null
  tg_group?: string | null
  group_link?: string | null
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  per_page: number
  current_page: number
  last_page: number
}
