import type { TrafficLog } from '@/api/types'

const DAY_MS = 24 * 60 * 60 * 1000
const MEBIBYTE = 1024 * 1024

export type HeatmapRange = [string, string]
export type HeatmapPoint = [string, number]

export interface TrafficHeatmapSummary {
  data: HeatmapPoint[]
  total: number
  average: number
  max: number
  activeDays: number
  totalDays: number
  visualMax: number
}

const formatDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const toLocalDateKey = (timestamp: number): string =>
  formatDateKey(new Date(timestamp * 1000))

export const getCalendarMonthRange = (monthCount: number, now = new Date()): HeatmapRange => {
  const months = Math.max(1, Math.floor(monthCount))
  const end = new Date(now)
  const start = new Date(end)

  // Set the day first so dates such as March 31 cannot overflow when changing month.
  start.setDate(1)
  start.setMonth(start.getMonth() - (months - 1))

  return [formatDateKey(start), formatDateKey(end)]
}

const dateKeyToUtc = (dateKey: string): number => {
  const [year, month, day] = dateKey.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

export const countDaysInRange = ([start, end]: HeatmapRange): number =>
  Math.max(0, Math.floor((dateKeyToUtc(end) - dateKeyToUtc(start)) / DAY_MS) + 1)

const toPositiveNumber = (value: number): number =>
  Number.isFinite(value) && value > 0 ? value : 0

const niceCeiling = (value: number): number => {
  if (value <= 0) return MEBIBYTE
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const multiplier = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return multiplier * magnitude
}

const getVisualMax = (points: HeatmapPoint[]): number => {
  if (points.length === 0) return MEBIBYTE

  // A single exceptional day should not wash out the color of every normal day.
  const values = points.map(([, value]) => value).sort((a, b) => a - b)
  const representativeMax = values.length >= 20
    ? values[Math.floor((values.length - 1) * 0.95)]
    : values[values.length - 1]
  return Math.max(MEBIBYTE, niceCeiling(representativeMax))
}

export const buildTrafficHeatmap = (
  logs: TrafficLog[],
  range: HeatmapRange,
): TrafficHeatmapSummary => {
  const [rangeStart, rangeEnd] = range
  const totalsByDay = new Map<string, number>()

  for (const log of logs) {
    if (!Number.isFinite(log.record_at) || log.record_at <= 0) continue

    const dateKey = toLocalDateKey(log.record_at)
    if (dateKey < rangeStart || dateKey > rangeEnd) continue

    const bytes = toPositiveNumber(log.u) + toPositiveNumber(log.d)
    if (bytes === 0) continue
    totalsByDay.set(dateKey, (totalsByDay.get(dateKey) ?? 0) + bytes)
  }

  const data = Array.from(totalsByDay, ([date, bytes]): HeatmapPoint => [date, bytes])
    .sort(([left], [right]) => left.localeCompare(right))
  const total = data.reduce((sum, [, bytes]) => sum + bytes, 0)
  const max = data.reduce((current, [, bytes]) => Math.max(current, bytes), 0)
  const totalDays = countDaysInRange(range)

  return {
    data,
    total,
    average: totalDays > 0 ? Math.floor(total / totalDays) : 0,
    max,
    activeDays: data.length,
    totalDays,
    visualMax: getVisualMax(data),
  }
}

export const pageIsOlderThanRange = (logs: TrafficLog[], rangeStart: string): boolean => {
  if (logs.length === 0) return true

  for (let index = 0; index < logs.length; index += 1) {
    const timestamp = logs[index].record_at
    if (!Number.isFinite(timestamp) || (index > 0 && timestamp > logs[index - 1].record_at)) {
      return false
    }
  }

  return toLocalDateKey(logs[logs.length - 1].record_at) < rangeStart
}

interface HeatmapOptionInput {
  summary: TrafficHeatmapSummary
  range: HeatmapRange
  isDark: boolean
  locale: string
  formatValue: (bytes: number) => string
}

export const createTrafficHeatmapOption = ({
  summary,
  range,
  isDark,
  locale,
  formatValue,
}: HeatmapOptionInput) => ({
  tooltip: {
    formatter: (params: { value?: HeatmapPoint }) => {
      const [date, bytes] = params.value ?? ['', 0]
      return `${date}<br/><b>${formatValue(bytes)}</b>`
    },
  },
  visualMap: {
    min: 0,
    max: summary.visualMax,
    show: false,
    inRange: {
      color: isDark
        ? ['rgba(59,130,246,0.08)', 'rgba(59,130,246,0.3)', 'rgba(59,130,246,0.6)', '#3b82f6', '#2563eb']
        : ['rgba(59,130,246,0.08)', 'rgba(59,130,246,0.25)', 'rgba(59,130,246,0.5)', 'rgba(59,130,246,0.8)', '#2563eb'],
    },
  },
  calendar: {
    top: 30,
    left: 40,
    right: 20,
    bottom: 30,
    range,
    cellSize: ['auto', 13],
    itemStyle: {
      borderWidth: 2,
      borderColor: isDark ? 'rgba(26,29,36,0.8)' : '#fff',
      color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.025)',
    },
    splitLine: { show: false },
    yearLabel: { show: false },
    monthLabel: {
      nameMap: locale.toLowerCase().startsWith('zh') ? 'ZH' : 'EN',
      color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
      fontSize: 11,
      margin: 8,
    },
    dayLabel: {
      firstDay: 1,
      nameMap: locale.toLowerCase().startsWith('zh') ? 'ZH' : 'EN',
      color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
      fontSize: 10,
    },
  },
  series: [
    {
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: summary.data,
    },
  ],
})
