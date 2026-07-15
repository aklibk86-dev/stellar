// 格式化工具函数

// 格式化字节数（用户流量等，单位为字节）
export function formatTraffic(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`
}

// 格式化套餐流量（API 返回的 transfer_enable 单位为 GB）
export function formatPlanTraffic(gb: number): string {
  if (!gb || gb === 0) return '0 GB'
  if (gb >= 1024) {
    return `${(gb / 1024).toFixed(2)} TB`
  }
  return `${gb} GB`
}

export function formatNumber(num: number): string {
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 格式化金额: API 返回的金额单位为分,自动除以100转为元并添加千分位
export function formatMoney(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return '0.00'
  return (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function formatDate(timestamp: number | null | undefined): string {
  if (!timestamp) return '-'
  const date = new Date(timestamp * 1000)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

export function formatDateShort(timestamp: number | null | undefined): string {
  if (!timestamp) return '-'
  const date = new Date(timestamp * 1000)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return '-'
  return (price / 100).toFixed(2)
}

export function formatPeriod(period: string): string {
  const map: Record<string, string> = {
    month_price: 'plan.month',
    quarter_price: 'plan.quarter',
    half_year_price: 'plan.halfYear',
    year_price: 'plan.year',
    two_year_price: 'plan.twoYear',
    three_year_price: 'plan.threeYear',
    onetime_price: 'plan.onetime',
    reset_price: 'plan.resetTraffic',
  }
  return map[period] || period
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}
