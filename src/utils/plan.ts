// 套餐库存工具
// 两类后端对 plan.capacity_limit 的语义不同：
//   - Xboard（cedar2025/Xboard）：返回库存上限（总数）。
//       null = 不限量；正整数 = 上限；0 或本地化字符串（官方为英文 "Sold out"，
//       部分分支为 "已售罄"）= 已售罄；售罄套餐会被列表接口过滤。
//   - v2board（wyx2685/v2board）：返回剩余库存（上限 - 在用人数）。
//       null = 不限量；正整数 = 剩余份数；<= 0 = 已售罄；售罄套餐仍在列表中。
// 打过后端补丁（见 documentation/套餐库存显示-后端补丁.md）后，套餐会额外返回：
//   - capacity_total：库存总数
//   - capacity_remaining：剩余库存（0 或 "Sold out" 表示售罄，null 表示不限量）
// 此时前端优先展示「剩余 X / 总 Y」；未打补丁时按后端语义回退展示
// 「限量 N 份」（Xboard）或「仅剩 N 份」（v2board）。
import type { Plan } from '@/api/types'
import { can } from './backend'

export type PlanStockState = 'unlimited' | 'limited' | 'soldOut'

export interface PlanStockInfo {
  state: PlanStockState
  /** state 为 limited 时的库存数值（Xboard 为上限，v2board 为剩余） */
  limit: number | null
}

// 后端本地化的“已售罄”文案
const SOLD_OUT_MARKERS = ['sold out', 'soldout', '已售罄', '售罄', '无货']
// 后端本地化的“不限量”文案
const UNLIMITED_MARKERS = ['unlimited', '不限量', '不限', 'no limit']

/**
 * 解析单个库存字段：
 * - null/undefined/空串 → null（不限量）
 * - 正数 → 数值
 * - 0/负数/"Sold out"/"已售罄" → 'soldOut'
 * - 无法识别的字符串 → null（不展示，由后端购买校验兜底）
 */
function parseStockValue(value: unknown): number | 'soldOut' | null {
  if (value === null || value === undefined) return null

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null
    return value <= 0 ? 'soldOut' : Math.floor(value)
  }

  const trimmed = String(value).trim()
  if (trimmed === '') return null

  const lower = trimmed.toLowerCase()
  if (SOLD_OUT_MARKERS.some(marker => lower.includes(marker))) return 'soldOut'
  if (UNLIMITED_MARKERS.some(marker => lower.includes(marker))) return null

  const numeric = Number(trimmed)
  if (!Number.isFinite(numeric)) return null
  return numeric <= 0 ? 'soldOut' : Math.floor(numeric)
}

export function getPlanStockInfo(capacityLimit: Plan['capacity_limit'] | undefined): PlanStockInfo {
  const parsed = parseStockValue(capacityLimit)
  if (parsed === null) return { state: 'unlimited', limit: null }
  if (parsed === 'soldOut') return { state: 'soldOut', limit: null }
  return { state: 'limited', limit: parsed }
}

export function isPlanSoldOut(plan: Plan): boolean {
  return getPlanStockBadgeInfo(plan)?.soldOut === true
}

// ===== 展示用徽标信息 =====

export interface PlanStockBadgeInfo {
  /** 是否为售罄状态 */
  soldOut: boolean
  /** 文案所用的 i18n key（调用方用 t() 翻译） */
  labelKey: 'plan.soldOut' | 'plan.limitedStock' | 'plan.stockRemaining' | 'plan.stockRemainTotal'
  /** 数量（limitedStock / stockRemaining 使用） */
  count: number | null
  /** 剩余库存（stockRemainTotal 使用） */
  remain: number | null
  /** 库存总数（stockRemainTotal 使用） */
  total: number | null
}

/**
 * 生成套餐库存徽标信息：
 * - 不限量 → null（不展示）
 * - 已售罄 → 「已售罄」
 * - 后端补丁提供剩余+总数 → 「剩余 X / 总 Y」
 * - 未打补丁 → v2board（剩余语义）「仅剩 N 份」；xboard（上限语义）「限量 N 份」
 */
export function getPlanStockBadgeInfo(plan: Plan): PlanStockBadgeInfo | null {
  // 1) 打补丁的后端：同时提供剩余库存与总数
  const remainingRaw = parseStockValue(plan.capacity_remaining)
  const totalRaw = parseStockValue(plan.capacity_total)

  if (remainingRaw !== null && totalRaw !== null) {
    const remain = remainingRaw === 'soldOut' ? 0 : remainingRaw
    const total = totalRaw === 'soldOut' ? 0 : totalRaw
    const soldOut = remain <= 0
    return {
      soldOut,
      labelKey: soldOut ? 'plan.soldOut' : 'plan.stockRemainTotal',
      count: null,
      remain,
      total,
    }
  }

  // 2) 未打补丁：按后端语义解读 capacity_limit
  const base = parseStockValue(plan.capacity_limit)
  if (base === null) return null
  if (base === 'soldOut') {
    return { soldOut: true, labelKey: 'plan.soldOut', count: null, remain: null, total: null }
  }

  if (can('planStockRemaining')) {
    // v2board：capacity_limit 即剩余库存
    return { soldOut: false, labelKey: 'plan.stockRemaining', count: base, remain: base, total: null }
  }

  // xboard：capacity_limit 即库存上限（总数）
  return { soldOut: false, labelKey: 'plan.limitedStock', count: base, remain: null, total: base }
}

export type StockDisplayStyle = 'conservative' | 'aggressive' | 'balanced'

export interface PlanStockDisplayInfo {
  soldOut: boolean
  count: number
  style: StockDisplayStyle
  textKey: 'plan.stockSufficient' | 'plan.stockAlmostSoldOut' | 'plan.stockLow' | 'plan.stockQuantity' | 'plan.stockNumber' | 'plan.stockSoldOut'
  params?: { count: number }
}

const STOCK_LOW_THRESHOLD = 5

/** Reads the configured style and safely falls back to the balanced style. */
export function getStockDisplayStyle(): StockDisplayStyle {
  const configured = typeof window !== 'undefined' ? window.settings?.stock_display_style : undefined
  return configured === 'conservative' || configured === 'aggressive' || configured === 'balanced'
    ? configured
    : 'balanced'
}

/** Converts backend-aware stock information into one display model. */
export function getPlanStockDisplayInfo(plan: Plan): PlanStockDisplayInfo | null {
  const badge = getPlanStockBadgeInfo(plan)
  if (!badge) return null

  const count = badge.soldOut ? 0 : badge.remain ?? badge.count ?? 0
  const style = getStockDisplayStyle()

  if (badge.soldOut) {
    return {
      soldOut: true,
      count: 0,
      style,
      textKey: style === 'aggressive' ? 'plan.stockNumber' : 'plan.stockSoldOut',
      params: { count: 0 },
    }
  }

  if (style === 'aggressive') {
    return { soldOut: false, count, style, textKey: 'plan.stockNumber', params: { count } }
  }

  if (style === 'conservative') {
    return {
      soldOut: false,
      count,
      style,
      textKey: count <= STOCK_LOW_THRESHOLD ? 'plan.stockAlmostSoldOut' : 'plan.stockSufficient',
      params: { count },
    }
  }

  return {
    soldOut: false,
    count,
    style,
    textKey: count <= STOCK_LOW_THRESHOLD ? 'plan.stockLow' : 'plan.stockQuantity',
    params: { count },
  }
}

/**
 * Keep visible plans and informational sold-out plans. Some backends turn
 * `sell` off automatically after stock reaches zero, but `show` still controls
 * whether the plan should remain in the catalog.
 */
export function shouldDisplayPlan(plan: Plan): boolean {
  if (plan.show === false) return false
  if (plan.sell !== false) return true
  return getPlanStockBadgeInfo(plan)?.soldOut === true
}
