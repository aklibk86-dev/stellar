<template>
  <component :is="iconComponent" :size="size" :stroke-width="strokeWidth" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Activity,
  ArrowRight,
  ArrowUp,
  Book2,
  ChartBar,
  Copy,
  CreditCard,
  Crown,
  CurrencyDollar,
  Dashboard,
  FileText,
  Language,
  Link,
  Lock,
  Logout,
  Mail,
  Menu2,
  MessageCircle,
  Moon,
  Qrcode,
  Receipt,
  Router,
  Scan,
  Send,
  Server,
  Settings,
  ShieldLock,
  ShoppingCart,
  Sun,
  Ticket,
  User,
  UserCircle,
  Users,
  Wifi,
  World,
} from '@vicons/tabler'

const props = withDefaults(defineProps<{
  name: string
  size?: number | string
  strokeWidth?: number | string
}>(), {
  size: 20,
  strokeWidth: 2,
})

const icons = {
  activity: Activity,
  arrowRight: ArrowRight,
  arrowUp: ArrowUp,
  book: Book2,
  chart: ChartBar,
  copy: Copy,
  credit: CreditCard,
  crown: Crown,
  dashboard: Dashboard,
  file: FileText,
  language: Language,
  link: Link,
  lock: Lock,
  logout: Logout,
  mail: Mail,
  menu: Menu2,
  message: MessageCircle,
  moon: Moon,
  money: CurrencyDollar,
  qrcode: Qrcode,
  receipt: Receipt,
  router: Router,
  scan: Scan,
  send: Send,
  server: Server,
  settings: Settings,
  shield: ShieldLock,
  shop: ShoppingCart,
  sun: Sun,
  ticket: Ticket,
  user: User,
  userCircle: UserCircle,
  users: Users,
  wifi: Wifi,
  world: World,
} as const

const iconAliases: Record<string, keyof typeof icons> = {
  grid: 'dashboard',
  cart: 'shop',
  chat: 'ticket',
  people: 'users',
  stats: 'chart',
  person: 'user',
  knowledge: 'book',
  plans: 'shop',
  orders: 'receipt',
  servers: 'server',
  traffic: 'chart',
  profile: 'user',
  invite: 'users',
  tickets: 'ticket',
}

const iconComponent = computed(() => {
  const key = iconAliases[props.name] || props.name
  return icons[key as keyof typeof icons] || FileText
})
</script>
