import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart, HeatmapChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CalendarComponent,
  VisualMapComponent,
} from 'echarts/components'

let registered = false

export function registerECharts() {
  if (registered) return
  registered = true
  use([
    CanvasRenderer,
    PieChart,
    BarChart,
    HeatmapChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    CalendarComponent,
    VisualMapComponent,
  ])
}

registerECharts()
