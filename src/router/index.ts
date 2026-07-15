import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import '@/utils/settings'
import { useUserStore } from '@/stores/user'
import { shouldCheckApiAvailability } from '@/utils/apiConfig'
import i18n from '@/i18n'

let hasRedirectedToApiValidation = false

const Layout = () => import('@/layouts/MainLayout.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'landing',
    alias: '/landing',
    component: () => import('@/views/Landing.vue'),
    meta: { title: 'landing', noAuth: true },
    beforeEnter: () => {
      // 落地页关闭时重定向到登录/仪表盘
      if (window.settings?.landing_page_enabled === false) {
        return { name: 'dashboard' }
      }
      return true
    },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { title: 'login', noAuth: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { title: 'register', noAuth: true },
  },
  {
    path: '/forget',
    name: 'forget',
    component: () => import('@/views/auth/Forget.vue'),
    meta: { title: 'forget', noAuth: true },
  },
  {
    path: '/email-login',
    name: 'email-login',
    component: () => import('@/views/auth/EmailLogin.vue'),
    meta: { title: 'emailLogin', noAuth: true },
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: 'dashboard', icon: 'grid' },
      },
      {
        path: 'servers',
        name: 'servers',
        component: () => import('@/views/Servers.vue'),
        meta: { title: 'servers', icon: 'server' },
      },
      {
        path: 'plans',
        name: 'plans',
        component: () => import('@/views/Plans.vue'),
        meta: { title: 'plans', icon: 'cart' },
      },
      {
        path: 'checkout/:planId',
        name: 'checkout',
        component: () => import('@/views/Checkout.vue'),
        meta: { title: 'checkout' },
      },
      {
        path: 'orders',
        name: 'orders',
        component: () => import('@/views/Orders.vue'),
        meta: { title: 'orders', icon: 'receipt' },
      },
      {
        path: 'tickets',
        name: 'tickets',
        component: () => import('@/views/Tickets.vue'),
        meta: { title: 'tickets', icon: 'chat' },
      },
      {
        path: 'invite',
        name: 'invite',
        component: () => import('@/views/Invite.vue'),
        meta: { title: 'invite', icon: 'people' },
      },
      {
        path: 'knowledge',
        name: 'knowledge',
        component: () => import('@/views/Knowledge.vue'),
        meta: { title: 'knowledge', icon: 'book' },
      },
      {
        path: 'traffic',
        name: 'traffic',
        component: () => import('@/views/Traffic.vue'),
        meta: { title: 'traffic', icon: 'stats' },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: 'profile', icon: 'person' },
      },
    ],
  },
  {
    path: '/api-validation',
    name: 'ApiValidation',
    component: () => import('@/views/ApiValidation.vue'),
    meta: { title: 'API 检测', noAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '404', noAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(window.routerBase || '/'),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()
  const t = i18n.global.t

  // 设置页面标题
  const titleKey = to.meta.title as string
  let pageTitle = titleKey || ''
  if (titleKey && /^[a-z_]+$/.test(titleKey)) {
    pageTitle = t(`nav.${titleKey}`)
  }
  document.title = `${pageTitle} - ${window.settings?.title || 'Stellar'}`

  if (!hasRedirectedToApiValidation && shouldCheckApiAvailability() && to.name !== 'ApiValidation') {
    hasRedirectedToApiValidation = true
    next({ name: 'ApiValidation', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.noAuth) {
    // landing 页面允许已登录用户访问
    if (to.name === 'landing') {
      next()
      return
    } else if (userStore.isLoggedIn) {
      next({ name: 'dashboard' })
    } else {
      next()
    }
    return
  }

  if (!userStore.isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  if (!userStore.user) {
    await userStore.fetchUser()
  }

  next()
})

export default router
