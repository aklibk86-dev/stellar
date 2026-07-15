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
  capacity_limit: number | null
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
  type: string
  value: number
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
