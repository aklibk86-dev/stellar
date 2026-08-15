<template>
  <div class="landing-page" :class="{ dark: isDark }">
    <!-- 导航栏 -->
    <nav ref="navigationRoot" class="landing-nav">
      <div class="nav-container">
        <div class="nav-brand" @click="goHome">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <span class="brand-name">{{ appStore.title || 'Stellar' }}</span>
        </div>
        <div v-if="navigationItems.length" class="nav-menu">
          <a
            v-for="item in navigationItems"
            :key="`${item.label}-${item.url}`"
            :href="navigationHref(item.url)"
            class="nav-link"
            :target="item.newTab ? '_blank' : undefined"
            :rel="item.newTab ? 'noopener noreferrer' : undefined"
            @click="handleNavigationClick($event, item)"
          >
            {{ item.label }}
          </a>
        </div>
        <div class="nav-actions">
          <button class="theme-toggle-btn" :title="isDark ? '切换到浅色模式' : '切换到暗色模式'" @click="appStore.toggleDark()">
            <svg v-if="isDark" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3a6 6 0 0 0 9 7.5A9 9 0 1 1 12 3Z" />
            </svg>
          </button>
          <button class="lang-toggle-btn" :title="currentLang === 'zh-CN' ? 'Switch to English' : '切换为中文'" @click="toggleLang">
            <span class="lang-text">{{ currentLang === 'zh-CN' ? '中' : 'EN' }}</span>
          </button>
          <template v-if="isLoggedIn">
            <button class="nav-btn primary nav-desktop-auth" @click="goDashboard">
              {{ t('landing.console') }}
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </template>
          <template v-else>
            <button class="nav-btn ghost nav-desktop-auth" @click="$router.push('/login')">{{ t('landing.login') }}</button>
            <button class="nav-btn primary nav-desktop-auth" @click="$router.push('/register')">{{ t('landing.register') }}</button>
          </template>
          <button
            class="nav-mobile-toggle"
            type="button"
            :title="mobileMenuOpen ? t('common.closeNavigation') : t('common.openNavigation')"
            :aria-label="mobileMenuOpen ? t('common.closeNavigation') : t('common.openNavigation')"
            :aria-expanded="mobileMenuOpen"
            aria-controls="landing-mobile-navigation"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <StellarIcon :name="mobileMenuOpen ? 'close' : 'menu'" :size="20" />
          </button>
        </div>
        <div
          v-if="mobileMenuOpen"
          id="landing-mobile-navigation"
          class="nav-mobile-menu"
        >
          <a
            v-for="item in navigationItems"
            :key="`mobile-${item.label}-${item.url}`"
            :href="navigationHref(item.url)"
            class="nav-mobile-link"
            :target="item.newTab ? '_blank' : undefined"
            :rel="item.newTab ? 'noopener noreferrer' : undefined"
            @click="handleNavigationClick($event, item)"
          >
            {{ item.label }}
            <StellarIcon v-if="item.newTab" name="arrowUpRight" :size="16" />
          </a>
          <div v-if="navigationItems.length" class="nav-mobile-divider"></div>
          <router-link
            v-if="isLoggedIn"
            to="/dashboard"
            class="nav-mobile-link nav-mobile-command"
            @click="mobileMenuOpen = false"
          >
            {{ t('landing.console') }}
            <StellarIcon name="arrowRight" :size="16" />
          </router-link>
          <template v-else>
            <router-link to="/login" class="nav-mobile-link nav-mobile-command" @click="mobileMenuOpen = false">
              {{ t('landing.login') }}
            </router-link>
            <router-link to="/register" class="nav-mobile-link nav-mobile-command primary" @click="mobileMenuOpen = false">
              {{ t('landing.register') }}
              <StellarIcon name="arrowRight" :size="16" />
            </router-link>
          </template>
        </div>
      </div>
    </nav>

    <!-- Hero 区域 -->
    <section class="hero-section">
      <div class="hero-bg-grid"></div>
      <div class="hero-bg-glow glow-main"></div>
      <div class="hero-bg-glow glow-purple"></div>
      <div class="hero-orbit orbit-1"></div>
      <div class="hero-orbit orbit-2"></div>
      <div class="speed-line line-1"></div>
      <div class="speed-line line-2"></div>
      <div class="speed-line line-3"></div>
      <div class="hero-container">
        <div class="hero-left">
          <div class="hero-badge">
            <span class="badge-dot"></span>
            {{ t('landing.heroBadge') }}
          </div>
          <h1 class="hero-title">
            <span class="gradient-text">{{ appStore.title || 'Stellar' }}</span>
            {{ t('landing.heroTitleSuffix') }}
          </h1>
          <p class="hero-subtitle">{{ t('landing.heroSubtitle') }}</p>
          <div class="hero-features">
            <div class="hero-feature-item">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {{ t('landing.feature1') }}
            </div>
            <div class="hero-feature-item">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {{ t('landing.feature2') }}
            </div>
            <div class="hero-feature-item">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {{ t('landing.feature3') }}
            </div>
          </div>
          <div class="hero-cta">
            <button class="cta-primary" @click="goPlans">
              {{ t('landing.buyNow') }}
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
            <button v-if="telegramGroupUrl" class="cta-secondary" @click="openTelegram">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>
              {{ t('landing.joinTelegram') }}
            </button>
          </div>
        </div>
        <div class="hero-right">
          <div class="hero-visual">
            <!-- 线路卡片堆叠 -->
            <div class="node-card card-3">
              <div class="node-card-header">
                <span class="node-flag">🇭🇰</span>
                <span class="node-name">Region A · Standard</span>
                <span class="node-status online"></span>
              </div>
              <div class="node-card-body">
                <div class="node-metric"><span>延迟</span><span>8ms</span></div>
                <div class="node-metric"><span>应用</span><span>在线影音</span></div>
                <div class="node-metric"><span>类型</span><span>标准线路</span></div>
                <div class="node-metric"><span>倍率</span><span>1.0x</span></div>
              </div>
            </div>
            <div class="node-card card-2">
              <div class="node-card-header">
                <span class="node-flag">🇯🇵</span>
                <span class="node-name">Region B · Low Latency</span>
                <span class="node-status online"></span>
              </div>
              <div class="node-card-body">
                <div class="node-metric"><span>延迟</span><span>18ms</span></div>
                <div class="node-metric"><span>应用</span><span>高清视频</span></div>
                <div class="node-metric"><span>类型</span><span>低延迟线路</span></div>
                <div class="node-metric"><span>倍率</span><span>1.0x</span></div>
              </div>
              <div class="node-card-footer">
                <span class="node-ping">4.2ms</span>
                <span class="node-uptime">99.99%</span>
              </div>
            </div>
            <div class="node-card card-1">
              <div class="node-card-header">
                <span class="node-flag">🇺🇸</span>
                <span class="node-name">Region C · Premium</span>
                <span class="node-status online"></span>
              </div>
              <div class="node-card-body">
                <div class="node-metric"><span>延迟</span><span>42ms</span></div>
                <div class="node-metric"><span>应用</span><span>多媒体</span></div>
                <div class="node-metric"><span>类型</span><span>优选线路</span></div>
                <div class="node-metric"><span>倍率</span><span>1.5x</span></div>
              </div>
              <div class="node-card-footer">
                <span class="node-ping">12ms</span>
                <span class="node-uptime">99.99%</span>
              </div>
            </div>
            <!-- 浮动标签 -->
            <div class="connection-ring"></div>
            <div class="connection-ring ring-2"></div>
            <div class="signal-dot dot-1"></div>
            <div class="signal-dot dot-2"></div>
            <div class="signal-dot dot-3"></div>
            <div class="floating-tag tag-top">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
              {{ t('landing.globalNodes') }}
            </div>
            <div class="floating-tag tag-bottom">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
影音体验优化
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 数据统计 -->
    <section class="stats-section">
      <div class="stats-container">
        <div class="stat-item">
          <span class="stat-num">100+</span>
          <span class="stat-text">{{ t('landing.statNodes') }}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">99.99%</span>
          <span class="stat-text">{{ t('landing.statUptime') }}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">24/7</span>
          <span class="stat-text">{{ t('landing.statSupport') }}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">4K/8K</span>
          <span class="stat-text">{{ t('landing.statBandwidth') }}</span>
        </div>
      </div>
    </section>

    <!-- 功能特性 -->
    <section id="features" class="features-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">{{ t('landing.featuresTitle') }}</h2>
          <p class="section-subtitle">{{ t('landing.featuresSubtitle') }}</p>
        </div>
        <div class="features-grid">
          <div class="feature-card" v-for="(feature, idx) in featureList" :key="idx">
            <div class="feature-icon" :style="{ background: feature.bg, color: feature.color }">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" v-html="feature.icon"></svg>
            </div>
            <h3 class="feature-title">{{ t(feature.titleKey) }}</h3>
            <p class="feature-desc">{{ t(feature.descKey) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 套餐展示 -->
    <section id="pricing" class="pricing-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">{{ t('landing.pricingTitle') }}</h2>
          <p class="section-subtitle">{{ t('landing.pricingSubtitle') }}</p>
        </div>
        <div class="pricing-grid">
          <div
            v-for="plan in displayPlans"
            :key="plan.id"
            class="plan-card"
          >
            <h3 class="plan-name">{{ plan.name }}</h3>
            <div class="plan-price">
              <span class="price-currency">¥</span>
              <span class="price-amount">{{ plan.displayPrice }}</span>
              <span class="price-period">{{ plan.displayPeriod }}</span>
            </div>
            <ul class="plan-features">
              <li v-for="(feat, i) in plan.displayFeatures" :key="i">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {{ feat }}
              </li>
            </ul>
            <button
              class="plan-btn"
              @click="goCheckout(plan.id)"
            >
              {{ t('landing.choosePlan') }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="faq-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">FAQ</h2>
          <p class="section-subtitle">{{ t('landing.faqSubtitle') }}</p>
        </div>
        <div class="faq-list">
          <div
            v-for="(item, idx) in faqList"
            :key="idx"
            class="faq-item"
            :class="{ open: openFaq === idx }"
            @click="toggleFaq(idx)"
          >
            <div class="faq-question">
              <span>{{ t(item.qKey) }}</span>
              <svg class="faq-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="faq-answer">{{ t(item.aKey) }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA 区域 -->
    <section class="cta-section">
      <div class="cta-container">
        <h2 class="cta-title">{{ t('landing.ctaTitle') }}</h2>
        <p class="cta-subtitle">{{ t('landing.ctaSubtitle') }}</p>
        <button class="cta-btn" @click="goPlans">{{ t('landing.buyNow') }}</button>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="landing-footer">
      <div class="footer-container">
        <div class="footer-brand">
          <div class="brand-icon small">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <span class="footer-name">{{ appStore.title || 'Stellar' }}</span>
        </div>
        <div class="footer-meta">
          <p class="footer-copyright">
            Copyright © {{ new Date().getFullYear() }}
            <a :href="authorUrl" target="_blank" rel="noopener noreferrer">{{ authorName }}</a>.
            {{ t('landing.allRightsReserved') }}
          </p>
          <div class="footer-links">
            <a :href="authorUrl" target="_blank" rel="noopener noreferrer" aria-label="GitHub 项目仓库">GitHub</a>
            <template v-if="telegramGroupUrl">
              <span>·</span>
              <a :href="telegramGroupUrl" target="_blank" rel="noopener noreferrer" aria-label="Telegram 群组">TG 群组</a>
            </template>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { guestApi } from '@/api'
import type { Plan } from '@/api/types'
import StellarIcon from '@/components/StellarIcon.vue'
import {
  isInternalNavigationTarget,
  normalizeLandingNavigation,
  type LandingNavigationItem,
} from '@/utils/landingNavigation'

const { t } = useI18n()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const { locale } = useI18n()

const isDark = computed(() => appStore.isDark)
const isLoggedIn = computed(() => userStore.isLoggedIn)
const currentLang = computed(() => locale.value)
const plans = ref<Plan[]>([])
const openFaq = ref<number | null>(0)
const telegramGroupUrl = ref('')
const navigationRoot = ref<HTMLElement | null>(null)
const mobileMenuOpen = ref(false)

const defaultNavigationItems = computed<LandingNavigationItem[]>(() => [
  { label: t('landing.features'), url: '#features', newTab: false },
  { label: t('landing.pricing'), url: '#pricing', newTab: false },
  { label: 'FAQ', url: '#faq', newTab: false },
])

const navigationItems = computed(() => {
  const configuredItems = window.settings?.landing_navigation?.items
  return Array.isArray(configuredItems)
    ? normalizeLandingNavigation(configuredItems, String(locale.value))
    : defaultNavigationItems.value
})

const navigationHref = (target: string) => {
  return isInternalNavigationTarget(target) ? router.resolve(target).href : target
}

const handleNavigationClick = (event: MouseEvent, item: LandingNavigationItem) => {
  mobileMenuOpen.value = false
  if (!item.newTab && item.url.startsWith('#')) {
    event.preventDefault()
    const target = document.getElementById(item.url.slice(1))
    if (target) {
      window.history.pushState(window.history.state, '', item.url)
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    return
  }
  if (!item.newTab && isInternalNavigationTarget(item.url)) {
    event.preventDefault()
    void router.push(item.url)
  }
}

const closeMobileMenuOnOutsideClick = (event: MouseEvent) => {
  if (navigationRoot.value && !navigationRoot.value.contains(event.target as Node)) {
    mobileMenuOpen.value = false
  }
}

const closeMobileMenuOnEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') mobileMenuOpen.value = false
}

// 保留作者署名是开源社区的基本礼仪，请勿移除或篡改版权信息。
const _a = [97, 107, 108, 105, 98, 107, 56, 54, 45, 100, 101, 118]
const _u = [104, 116, 116, 112, 115, 58, 47, 47, 103, 105, 116, 104, 117, 98, 46, 99, 111, 109, 47, 97, 107, 108, 105, 98, 107, 56, 54, 45, 100, 101, 118, 47, 115, 116, 101, 108, 108, 97, 114]
const authorName = computed(() => String.fromCharCode(..._a))
const authorUrl = computed(() => String.fromCharCode(..._u))

const toggleLang = () => {
  const newLocale = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
  locale.value = newLocale
  appStore.setLocale(newLocale)
}

const fallbackPlans = [
  {
    id: 0,
    name: '轻量服务',
    displayPrice: '9.9',
    displayPeriod: '/月',
    displayFeatures: ['适合轻度网页访问', '常用地区线路', '基础影音优化', '全平台配置导入', '在线客服支持'],
  },
  {
    id: 0,
    name: '标准服务',
    displayPrice: '19.9',
    displayPeriod: '/月',
    displayFeatures: ['适合日常稳定使用', '高速低延迟线路', '在线视频优化', '多设备同时使用', '热门线路优先接入'],
  },
  {
    id: 0,
    name: '高级服务',
    displayPrice: '39.9',
    displayPeriod: '/月',
    displayFeatures: ['适合高频网络使用', '高级专用线路', '4K/8K 在线影音体验', '游戏与远程办公优化', '更高流量与速率保障'],
  },
]

// 功能特性列表
const featureList = [
  {
    titleKey: 'landing.feat1Title',
    descKey: 'landing.feat1Desc',
    bg: 'rgba(59, 130, 246, 0.15)',
    color: '#3b82f6',
    icon: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  },
  {
    titleKey: 'landing.feat2Title',
    descKey: 'landing.feat2Desc',
    bg: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    icon: '<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>',
  },
  {
    titleKey: 'landing.feat3Title',
    descKey: 'landing.feat3Desc',
    bg: 'rgba(249, 115, 22, 0.15)',
    color: '#f97316',
    icon: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
  },
  {
    titleKey: 'landing.feat4Title',
    descKey: 'landing.feat4Desc',
    bg: 'rgba(139, 92, 246, 0.15)',
    color: '#8b5cf6',
    icon: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  },
  {
    titleKey: 'landing.feat5Title',
    descKey: 'landing.feat5Desc',
    bg: 'rgba(236, 72, 153, 0.15)',
    color: '#ec4899',
    icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  },
  {
    titleKey: 'landing.feat6Title',
    descKey: 'landing.feat6Desc',
    bg: 'rgba(6, 182, 212, 0.15)',
    color: '#06b6d4',
    icon: '<path d="M9 12l2 2 4-4"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>',
  },
]

// FAQ 列表
const faqList = [
  { qKey: 'landing.faq1Q', aKey: 'landing.faq1A' },
  { qKey: 'landing.faq2Q', aKey: 'landing.faq2A' },
  { qKey: 'landing.faq3Q', aKey: 'landing.faq3A' },
  { qKey: 'landing.faq4Q', aKey: 'landing.faq4A' },
]

// 处理套餐数据
const formatPrice = (cents: number | null): string => {
  if (!cents || cents === 0) return '0'
  const price = cents / 100
  return price.toFixed(price % 1 === 0 ? 0 : 2)
}

const formatTraffic = (bytes: number): string => {
  if (bytes <= 0) return '0'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return size.toFixed(i === 0 ? 0 : 1) + ' ' + units[i]
}

const displayPlans = computed(() => {
  if (plans.value.length === 0) return fallbackPlans
  const sorted = [...plans.value].filter(p => p.show !== false && p.sell !== false).sort((a, b) => {
    const pa = a.sort || a.month_price || a.onetime_price || 0
    const pb = b.sort || b.month_price || b.onetime_price || 0
    return pa - pb
  })
  // 周期价格优先级（月→季→半年→年→两年→三年→一次性）
  const priceFields: Array<{ field: keyof Plan, labelKey: string }> = [
    { field: 'month_price', labelKey: 'plan.perMonth' },
    { field: 'quarter_price', labelKey: 'plan.perQuarter' },
    { field: 'half_year_price', labelKey: 'plan.perHalfYear' },
    { field: 'year_price', labelKey: 'plan.perYear' },
    { field: 'two_year_price', labelKey: 'plan.perTwoYear' },
    { field: 'three_year_price', labelKey: 'plan.perThreeYear' },
    { field: 'onetime_price', labelKey: 'plan.perOnetime' },
  ]
  return sorted.map((plan) => {
    const features: string[] = []
    if (plan.transfer_enable) {
      features.push(`每月流量 ${formatTraffic(plan.transfer_enable)}`)
    }
    if (plan.speed_limit) {
      features.push(`限速 ${formatTraffic(plan.speed_limit)}/s`)
    } else {
      features.push('不限速')
    }
    if (plan.device_limit) {
      features.push(`${plan.device_limit} 台设备`)
    } else {
      features.push('不限设备')
    }
    // 按优先级回退取价格与周期标签
    let price = 0
    let period = ''
    for (const f of priceFields) {
      const v = plan[f.field] as number | null
      if (v !== null && v !== undefined) {
        price = v
        period = t(f.labelKey)
        break
      }
    }
    return {
      id: plan.id,
      name: plan.name,
      displayPrice: formatPrice(price),
      displayPeriod: period,
      displayFeatures: features,
    }
  })
})

// 方法
const goHome = () => {
  router.push('/')
}

const goPlans = () => {
  router.push('/plans')
}

const goDashboard = () => {
  router.push('/dashboard')
}

const openTelegram = () => {
  if (telegramGroupUrl.value) {
    window.open(telegramGroupUrl.value, '_blank', 'noopener,noreferrer')
  }
}

const goCheckout = (planId: number) => {
  if (!planId) {
    router.push('/register')
    return
  }
  router.push(`/checkout/${planId}`)
}

const scrollToFeatures = () => {
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
}

const toggleFaq = (idx: number) => {
  openFaq.value = idx
}

// 获取数据
const fetchData = async () => {
  try {
    const planRes = await guestApi.getPlans()
    plans.value = planRes.data || []
    // 优先使用配置文件中的 telegram_group，避免依赖后端字段
    const configTelegram = window.settings?.telegram_group || ''
    if (configTelegram) {
      telegramGroupUrl.value = configTelegram
      return
    }
    const config = userStore.guestConfig
    telegramGroupUrl.value =
      config?.telegram_group ||
      config?.telegram ||
      config?.tg_group ||
      config?.group_link ||
      ''
  } catch (err) {
    console.warn('[Landing] 获取 TG 群组链接失败:', err)
  }
}

onMounted(async () => {
  document.addEventListener('click', closeMobileMenuOnOutsideClick)
  document.addEventListener('keydown', closeMobileMenuOnEscape)
  // 先完成后端配置获取（这会触发后端类型探测），再验证登录状态
  await userStore.fetchGuestConfig()
  if (userStore.authToken) {
    userStore.checkLogin()
  }
  fetchData()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeMobileMenuOnOutsideClick)
  document.removeEventListener('keydown', closeMobileMenuOnEscape)
})
</script>

<style scoped src="./landing.css"></style>
