<template>
  <div class="landing-page" :class="{ dark: isDark }">
    <!-- 导航栏 -->
    <nav class="landing-nav">
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
        <div class="nav-menu">
          <a href="#features" class="nav-link">{{ t('landing.features') }}</a>
          <a href="#pricing" class="nav-link">{{ t('landing.pricing') }}</a>
          <a href="#faq" class="nav-link">FAQ</a>
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
            <button class="nav-btn primary" @click="goDashboard">
              {{ t('landing.console') }}
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </template>
          <template v-else>
            <button class="nav-btn ghost" @click="$router.push('/login')">{{ t('landing.login') }}</button>
            <button class="nav-btn primary" @click="$router.push('/register')">{{ t('landing.register') }}</button>
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
                <span class="node-name">HK · Stream</span>
                <span class="node-status online"></span>
              </div>
              <div class="node-card-body">
                <div class="node-metric"><span>延迟</span><span>8ms</span></div>
                <div class="node-metric"><span>解锁</span><span>Netflix</span></div>
                <div class="node-metric"><span>协议</span><span>Reality</span></div>
                <div class="node-metric"><span>倍率</span><span>1.0x</span></div>
              </div>
            </div>
            <div class="node-card card-2">
              <div class="node-card-header">
                <span class="node-flag">🇯🇵</span>
                <span class="node-name">JP · Low Latency</span>
                <span class="node-status online"></span>
              </div>
              <div class="node-card-body">
                <div class="node-metric"><span>延迟</span><span>18ms</span></div>
                <div class="node-metric"><span>解锁</span><span>YouTube</span></div>
                <div class="node-metric"><span>协议</span><span>Hysteria2</span></div>
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
                <span class="node-name">US · Premium</span>
                <span class="node-status online"></span>
              </div>
              <div class="node-card-body">
                <div class="node-metric"><span>延迟</span><span>42ms</span></div>
                <div class="node-metric"><span>解锁</span><span>Disney+</span></div>
                <div class="node-metric"><span>协议</span><span>Trojan</span></div>
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
流媒体解锁
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
              <span class="price-period">/{{ t('landing.month') }}</span>
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
            <a href="https://github.com/aklibk86-dev/stellar" target="_blank" rel="noopener noreferrer">aklibk86-dev</a>.
            {{ t('landing.allRightsReserved') }}
          </p>
          <div class="footer-links">
            <a href="https://github.com/aklibk86-dev/stellar" target="_blank" rel="noopener noreferrer" aria-label="GitHub 项目仓库">GitHub</a>
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
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { guestApi } from '@/api'
import type { Plan } from '@/api/types'

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

const toggleLang = () => {
  const newLocale = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
  locale.value = newLocale
  appStore.setLocale(newLocale)
}

const fallbackPlans = [
  {
    id: 0,
    name: '轻量加速',
    displayPrice: '9.9',
    displayFeatures: ['适合轻度网页访问', '常用地区节点', '流媒体基础解锁', '全平台订阅导入', '在线客服支持'],
  },
  {
    id: 0,
    name: '标准加速',
    displayPrice: '19.9',
    displayFeatures: ['适合日常稳定使用', '高速低延迟节点', 'Netflix / YouTube 优化', '多设备同时使用', '热门线路优先接入'],
  },
  {
    id: 0,
    name: '高级加速',
    displayPrice: '39.9',
    displayFeatures: ['适合高频跨境访问', '高级专线节点', '4K/8K 流媒体体验', '游戏与远程办公优化', '更高流量与速率保障'],
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
  return (cents / 100).toFixed(0)
}

const displayPlans = computed(() => {
  if (plans.value.length === 0) return fallbackPlans
  const sorted = [...plans.value].sort((a, b) => {
    const pa = a.month_price || a.onetime_price || 0
    const pb = b.month_price || b.onetime_price || 0
    return pa - pb
  })
  const top3 = sorted.slice(0, 3)
  return top3.map((plan) => ({
    id: plan.id,
    name: plan.name,
    displayPrice: formatPrice(plan.month_price || plan.onetime_price),
    displayFeatures: plan.content ? plan.content.split('\n').filter(Boolean).slice(0, 5) : [],
  }))
})

// 方法
const goHome = () => {
  router.push('/')
}

const goPlans = () => {
  router.push('/plan')
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
    const [planRes, configRes] = await Promise.allSettled([
      guestApi.getPlans(),
      guestApi.getConfig(),
    ])
    if (planRes.status === 'fulfilled') {
      plans.value = planRes.value.data || []
    }
    // 优先使用配置文件中的 telegram_group，避免依赖后端字段
    const configTelegram = window.settings?.telegram_group || ''
    if (configTelegram) {
      telegramGroupUrl.value = configTelegram
      return
    }
    if (configRes.status === 'fulfilled') {
      const apiTelegram =
        configRes.value.data?.telegram_group ||
        configRes.value.data?.telegram ||
        configRes.value.data?.tg_group ||
        configRes.value.data?.group_link ||
        ''
      telegramGroupUrl.value = apiTelegram
    }
  } catch (err) {
    console.warn('[Landing] 获取 TG 群组链接失败:', err)
  }
}

onMounted(() => {
  if (userStore.authToken) {
    userStore.checkLogin()
  }
  fetchData()
})
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: #0a0f1a;
  color: #fff;
  overflow-x: hidden;
  transition: background 0.35s ease, color 0.35s ease;
}
.landing-page:not(.dark) {
  background: #f8fafc;
  color: #1e293b;
}

/* 导航栏 */
.landing-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(10, 15, 26, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.landing-page:not(.dark) .landing-nav {
  background: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.brand-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
.brand-icon.small { width: 28px; height: 28px; border-radius: 8px; }
.brand-name { font-size: 18px; font-weight: 700; }
.nav-menu { display: flex; gap: 32px; }
.nav-link {
  font-size: 14px;
  color: rgba(255,255,255,0.6);
  text-decoration: none;
  transition: color 0.2s;
}
.nav-link:hover { color: #fff; }
.landing-page:not(.dark) .nav-link { color: rgba(0,0,0,0.6); }
.landing-page:not(.dark) .nav-link:hover { color: #1e293b; }
.nav-actions { display: flex; align-items: center; gap: 10px; }
.theme-toggle-btn {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.78);
  cursor: pointer;
  transition: all 0.22s ease;
}
.theme-toggle-btn:hover {
  color: #fff;
  border-color: rgba(96,165,250,0.45);
  background: rgba(59,130,246,0.16);
  transform: translateY(-1px) rotate(-6deg);
  box-shadow: 0 10px 24px rgba(59,130,246,0.18);
}
.theme-toggle-btn svg { transition: transform 0.25s ease; }
.theme-toggle-btn:hover svg { transform: scale(1.08); }
.landing-page:not(.dark) .theme-toggle-btn {
  background: rgba(15,23,42,0.04);
  border-color: rgba(15,23,42,0.08);
  color: rgba(15,23,42,0.72);
}
.landing-page:not(.dark) .theme-toggle-btn:hover {
  color: #1e293b;
  background: rgba(59,130,246,0.1);
}
.lang-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  font-weight: 600;
}
.lang-toggle-btn:hover {
  color: #60a5fa;
  background: rgba(59,130,246,0.12);
  border-color: rgba(59,130,246,0.25);
}
.landing-page:not(.dark) .lang-toggle-btn {
  background: rgba(15,23,42,0.04);
  border-color: rgba(15,23,42,0.08);
  color: rgba(15,23,42,0.72);
}
.landing-page:not(.dark) .lang-toggle-btn:hover {
  color: #2563eb;
  background: rgba(59,130,246,0.1);
}
.nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  white-space: nowrap;
}
.nav-btn.ghost {
  background: transparent;
  color: rgba(255,255,255,0.7);
}
.landing-page:not(.dark) .nav-btn.ghost { color: rgba(0,0,0,0.7); }
.nav-btn.ghost:hover { background: rgba(255,255,255,0.1); }
.landing-page:not(.dark) .nav-btn.ghost:hover { background: rgba(0,0,0,0.05); }
.nav-btn.primary {
  background: #3b82f6;
  color: white;
}
.nav-btn.primary:hover { background: #2563eb; }
.nav-brand:hover .brand-icon { animation: logoPulse 0.7s ease; }
.nav-link { position: relative; }
.nav-link::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -6px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.25s ease;
}
.nav-link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}
@keyframes logoPulse { 0%, 100% { transform: scale(1) rotate(0deg); } 45% { transform: scale(1.08) rotate(-8deg); } }

/* Hero 区域 */
.hero-section {
  position: relative;
  padding: 140px 24px 80px;
  overflow: hidden;
}
.hero-bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.08) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(circle at 50% 20%, #000 0%, transparent 68%);
  animation: gridDrift 18s linear infinite;
  pointer-events: none;
}
.hero-bg-glow {
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, transparent 70%);
  filter: blur(2px);
  pointer-events: none;
}
.glow-main {
  top: -200px;
  right: -100px;
  animation: glowFloat 9s ease-in-out infinite;
}
.glow-purple {
  left: -180px;
  bottom: -260px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.16) 0%, transparent 70%);
  animation: glowFloat 11s ease-in-out infinite reverse;
}
.hero-orbit {
  position: absolute;
  width: 420px;
  height: 420px;
  border: 1px solid rgba(96, 165, 250, 0.12);
  border-radius: 50%;
  right: 9%;
  top: 145px;
  pointer-events: none;
  animation: orbitRotate 26s linear infinite;
}
.hero-orbit::before {
  content: '';
  position: absolute;
  top: 58px;
  left: 52px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #60a5fa;
  box-shadow: 0 0 18px rgba(96, 165, 250, 0.9);
}
.orbit-2 {
  width: 300px;
  height: 300px;
  right: 13%;
  top: 205px;
  animation-duration: 18s;
  animation-direction: reverse;
}
.speed-line {
  position: absolute;
  width: 160px;
  height: 1px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.8), transparent);
  opacity: 0;
  pointer-events: none;
  animation: speedFly 4.8s ease-in-out infinite;
}
.line-1 { top: 30%; left: 8%; animation-delay: 0.2s; }
.line-2 { top: 48%; left: 2%; animation-delay: 1.6s; }
.line-3 { top: 68%; right: 8%; animation-delay: 3s; }
@keyframes gridDrift { to { background-position: 56px 56px; } }
@keyframes glowFloat { 0%, 100% { transform: translate3d(0, 0, 0) scale(1); } 50% { transform: translate3d(34px, 22px, 0) scale(1.08); } }
@keyframes orbitRotate { to { transform: rotate(360deg); } }
@keyframes speedFly { 0% { transform: translateX(-80px); opacity: 0; } 18%, 62% { opacity: 0.8; } 100% { transform: translateX(280px); opacity: 0; } }
.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  position: relative;
}
.hero-left {
  animation: heroTextIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.hero-right {
  animation: heroVisualIn 0.95s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  font-size: 13px;
  color: #60a5fa;
  margin-bottom: 24px;
}
.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.hero-title {
  font-size: 48px;
  font-weight: 800;
  line-height: 1.15;
  margin: 0 0 20px 0;
}
.gradient-text {
  background: linear-gradient(120deg, #3b82f6, #60a5fa, #a78bfa, #3b82f6);
  background-size: 220% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientFlow 4.5s ease-in-out infinite;
}
@keyframes gradientFlow { 0%, 100% { background-position: 0% center; } 50% { background-position: 100% center; } }
@keyframes heroTextIn { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes heroVisualIn { from { opacity: 0; transform: translateX(36px) scale(0.96); } to { opacity: 1; transform: translateX(0) scale(1); } }
.hero-subtitle {
  font-size: 17px;
  color: rgba(255,255,255,0.5);
  line-height: 1.6;
  margin: 0 0 28px 0;
}
.landing-page:not(.dark) .hero-subtitle { color: rgba(0,0,0,0.5); }
.hero-features {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 32px;
}
.hero-feature-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: rgba(255,255,255,0.7);
}
.landing-page:not(.dark) .hero-feature-item { color: rgba(0,0,0,0.7); }
.hero-feature-item {
  animation: featurePop 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.hero-feature-item:nth-child(1) { animation-delay: 0.18s; }
.hero-feature-item:nth-child(2) { animation-delay: 0.28s; }
.hero-feature-item:nth-child(3) { animation-delay: 0.38s; }
.hero-feature-item svg { color: #10b981; animation: checkPulse 2.6s ease-in-out infinite; }
.hero-feature-item:nth-child(2) svg { animation-delay: 0.4s; }
.hero-feature-item:nth-child(3) svg { animation-delay: 0.8s; }
@keyframes featurePop { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes checkPulse { 0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(16,185,129,0)); } 45% { transform: scale(1.18); filter: drop-shadow(0 0 6px rgba(16,185,129,0.55)); } }
.hero-cta { display: flex; gap: 14px; }
.cta-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 10px;
  background: #3b82f6;
  color: white;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.cta-primary {
  position: relative;
  overflow: hidden;
}
.cta-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.34), transparent 80%);
  transform: translateX(-120%);
  animation: buttonShine 3.2s ease-in-out infinite;
}
.cta-primary > * { position: relative; z-index: 1; }
.cta-primary:hover { background: #2563eb; transform: translateY(-2px); box-shadow: 0 10px 28px rgba(59,130,246,0.42); }
.cta-primary:hover svg { animation: arrowNudge 0.7s ease-in-out infinite; }
@keyframes buttonShine { 0%, 48% { transform: translateX(-120%); } 72%, 100% { transform: translateX(120%); } }
@keyframes arrowNudge { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(4px); } }
.cta-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 10px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.7);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.landing-page:not(.dark) .cta-secondary { background: rgba(0,0,0,0.03); border-color: rgba(0,0,0,0.1); color: rgba(0,0,0,0.7); }
.cta-secondary:hover { background: rgba(255,255,255,0.1); }

/* Hero 可视化 */
.hero-right { position: relative; }
.hero-visual {
  position: relative;
  height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.connection-ring {
  position: absolute;
  width: 330px;
  height: 330px;
  border-radius: 50%;
  border: 1px dashed rgba(96, 165, 250, 0.22);
  animation: ringPulse 5.5s ease-in-out infinite;
  pointer-events: none;
}
.connection-ring.ring-2 {
  width: 250px;
  height: 250px;
  border-color: rgba(16, 185, 129, 0.2);
  animation-delay: 1s;
  animation-direction: reverse;
}
.signal-dot {
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #60a5fa;
  box-shadow: 0 0 14px rgba(96, 165, 250, 0.9);
  animation: signalMove 4.8s ease-in-out infinite;
}
.dot-1 { transform: translate(-130px, -80px); animation-delay: 0s; }
.dot-2 { transform: translate(120px, 72px); animation-delay: 1.2s; background: #10b981; box-shadow: 0 0 14px rgba(16, 185, 129, 0.9); }
.dot-3 { transform: translate(-80px, 130px); animation-delay: 2.4s; background: #a78bfa; box-shadow: 0 0 14px rgba(167, 139, 250, 0.9); }
@keyframes ringPulse { 0%, 100% { transform: scale(0.95) rotate(0deg); opacity: 0.45; } 50% { transform: scale(1.05) rotate(12deg); opacity: 0.9; } }
@keyframes signalMove { 0%, 100% { opacity: 0.28; filter: blur(0); } 50% { opacity: 1; filter: blur(0.2px); } }
.node-card {
  position: absolute;
  width: 240px;
  background: rgba(30, 41, 59, 0.94);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
}
.node-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, rgba(96,165,250,0.75), transparent 35%, rgba(16,185,129,0.5));
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}
.node-card:hover::before { opacity: 1; }
.node-card:hover { border-color: rgba(96,165,250,0.35); box-shadow: 0 16px 46px rgba(59,130,246,0.2); }
.landing-page:not(.dark) .node-card {
  background: rgba(255,255,255,0.96);
  border-color: rgba(0,0,0,0.08);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}
.card-1 { transform: translate(40px, -60px) rotate(3deg); z-index: 3; animation: float1 6s ease-in-out infinite; }
.card-2 { transform: translate(-20px, 20px) rotate(-2deg); z-index: 2; animation: float2 7s ease-in-out infinite; }
.card-3 { transform: translate(-80px, 80px) rotate(-5deg); z-index: 1; animation: float3 8s ease-in-out infinite; }
@keyframes float1 { 0%,100% { transform: translate(40px, -60px) rotate(3deg); } 50% { transform: translate(40px, -70px) rotate(3deg); } }
@keyframes float2 { 0%,100% { transform: translate(-20px, 20px) rotate(-2deg); } 50% { transform: translate(-20px, 10px) rotate(-2deg); } }
@keyframes float3 { 0%,100% { transform: translate(-80px, 80px) rotate(-5deg); } 50% { transform: translate(-80px, 70px) rotate(-5deg); } }
.node-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.node-flag { font-size: 18px; }
.node-name { font-size: 14px; font-weight: 600; flex: 1; }
.node-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
}
.node-status.online {
  box-shadow: 0 0 8px #10b981;
  animation: statusBlink 1.8s ease-in-out infinite;
}
@keyframes statusBlink { 0%, 100% { transform: scale(1); box-shadow: 0 0 8px #10b981; } 50% { transform: scale(1.35); box-shadow: 0 0 18px #10b981; } }
.node-card-body { display: flex; flex-direction: column; gap: 6px; }
.node-metric {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}
.node-metric span:first-child { color: rgba(255,255,255,0.4); }
.landing-page:not(.dark) .node-metric span:first-child { color: rgba(0,0,0,0.4); }
.node-metric span:last-child { font-weight: 500; }
.node-card-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255,255,255,0.06);
  font-size: 12px;
}
.landing-page:not(.dark) .node-card-footer { border-top-color: rgba(0,0,0,0.06); }
.node-ping { color: #10b981; font-weight: 600; }
.node-uptime { color: rgba(255,255,255,0.4); }
.landing-page:not(.dark) .node-uptime { color: rgba(0,0,0,0.4); }
.floating-tag {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 20px;
  background: rgba(59, 130, 246, 0.18);
  border: 1px solid rgba(59, 130, 246, 0.2);
  font-size: 12px;
  color: #60a5fa;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.12);
}
.tag-top { top: 20px; right: 0; animation: tagFloat 4.6s ease-in-out infinite; }
.tag-bottom { bottom: 20px; left: -10px; animation: tagFloat 5.2s ease-in-out infinite reverse; }
@keyframes tagFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

/* 性能优化：保留静态视觉层次，关闭持续循环动画，避免长期占用 CPU/GPU */
.hero-bg-grid,
.hero-bg-glow,
.hero-orbit,
.speed-line,
.badge-dot,
.gradient-text,
.hero-feature-item svg,
.cta-primary::before,
.connection-ring,
.signal-dot,
.node-status.online,
.floating-tag {
  animation: none !important;
}
.hero-bg-grid { background-position: 28px 28px; }
.hero-bg-glow { transform: translate3d(0, 0, 0); filter: none; }
.hero-orbit { transform: rotate(10deg); }
.orbit-2 { transform: rotate(-14deg); }
.speed-line { opacity: 0.26; transform: translateX(0); }
.badge-dot { box-shadow: 0 0 12px rgba(16,185,129,0.7); }
.gradient-text { background-position: 36% center; }
.hero-feature-item svg { filter: drop-shadow(0 0 3px rgba(16,185,129,0.28)); }
.cta-primary::before { display: none; }
.connection-ring { transform: scale(1); opacity: 0.72; }
.signal-dot { opacity: 0.85; filter: none; }
.node-status.online { box-shadow: 0 0 10px rgba(16,185,129,0.78); }
.tag-top { transform: translateY(-4px); }
.tag-bottom { transform: translateY(4px); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.001ms !important;
  }
}

/* 数据统计 */
.stats-section { padding: 40px 24px; }
.stats-container {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 32px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
}
.landing-page:not(.dark) .stats-container { background: rgba(0,0,0,0.02); border-color: rgba(0,0,0,0.06); }
.stat-item {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: transform 0.25s ease;
}
.stat-item:hover { transform: translateY(-4px) scale(1.03); }
.stat-num { font-size: 28px; font-weight: 800; color: #3b82f6; }
.stat-text { font-size: 13px; color: rgba(255,255,255,0.5); }
.landing-page:not(.dark) .stat-text { color: rgba(0,0,0,0.5); }
.stat-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.08); }
.landing-page:not(.dark) .stat-divider { background: rgba(0,0,0,0.08); }

/* Section 通用 */
.section-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.section-header { text-align: center; margin-bottom: 48px; }
.section-title { font-size: 32px; font-weight: 800; margin: 0 0 12px 0; }
.section-subtitle { font-size: 16px; color: rgba(255,255,255,0.5); margin: 0; }
.landing-page:not(.dark) .section-subtitle { color: rgba(0,0,0,0.5); }

/* 功能特性 */
.features-section { padding: 80px 0; }
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.feature-card {
  position: relative;
  overflow: hidden;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  padding: 28px 24px;
  transition: all 0.25s ease;
}
.feature-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--mx, 50%) var(--my, 0%), rgba(59,130,246,0.14), transparent 38%);
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}
.feature-card:hover::after { opacity: 1; }
.landing-page:not(.dark) .feature-card { background: rgba(0,0,0,0.02); border-color: rgba(0,0,0,0.06); }
.feature-card:hover { border-color: rgba(59,130,246,0.3); transform: translateY(-3px); }
.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.feature-card:hover .feature-icon {
  transform: translateY(-4px) rotate(-4deg) scale(1.08);
  box-shadow: 0 10px 24px rgba(59,130,246,0.18);
}
.feature-title { font-size: 17px; font-weight: 700; margin: 0 0 8px 0; }
.feature-desc { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.5; margin: 0; }
.landing-page:not(.dark) .feature-desc { color: rgba(0,0,0,0.5); }

/* 套餐展示 */
.pricing-section { padding: 80px 0; }
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.plan-card {
  position: relative;
  overflow: hidden;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: all 0.25s ease;
}
.plan-card::after {
  content: '';
  position: absolute;
  top: -80px;
  right: -80px;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59,130,246,0.18), transparent 68%);
  transform: scale(0.6);
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
}
.plan-card:hover::after { transform: scale(1); opacity: 1; }
.landing-page:not(.dark) .plan-card { background: rgba(0,0,0,0.02); border-color: rgba(0,0,0,0.08); }
.plan-card:hover { border-color: rgba(59,130,246,0.3); transform: translateY(-3px); }
.plan-name { font-size: 20px; font-weight: 700; margin: 0; }
.plan-price { display: flex; align-items: baseline; gap: 2px; }
.price-currency { font-size: 18px; font-weight: 600; color: rgba(255,255,255,0.5); }
.landing-page:not(.dark) .price-currency { color: rgba(0,0,0,0.5); }
.price-amount { font-size: 40px; font-weight: 800; }
.price-period { font-size: 14px; color: rgba(255,255,255,0.4); }
.landing-page:not(.dark) .price-period { color: rgba(0,0,0,0.4); }
.plan-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.plan-features li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255,255,255,0.6);
}
.landing-page:not(.dark) .plan-features li { color: rgba(0,0,0,0.6); }
.plan-features li svg { color: #10b981; flex-shrink: 0; }
.plan-btn {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.15);
  background: transparent;
  color: rgba(255,255,255,0.8);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: auto;
}
.landing-page:not(.dark) .plan-btn { border-color: rgba(0,0,0,0.15); color: rgba(0,0,0,0.8); }
.plan-btn:hover { background: rgba(255,255,255,0.05); }
.landing-page:not(.dark) .plan-btn:hover { background: rgba(0,0,0,0.03); }
/* FAQ */
.faq-section { padding: 80px 0; }
.faq-list { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; }
.faq-item {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}
.landing-page:not(.dark) .faq-item { background: rgba(0,0,0,0.02); border-color: rgba(0,0,0,0.06); }
.faq-item:hover { border-color: rgba(59,130,246,0.2); }
.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  font-size: 15px;
  font-weight: 600;
}
.faq-arrow { color: rgba(255,255,255,0.4); transition: transform 0.2s; flex-shrink: 0; }
.landing-page:not(.dark) .faq-arrow { color: rgba(0,0,0,0.4); }
.faq-item.open .faq-arrow { transform: rotate(180deg); }
.faq-answer {
  max-height: 0;
  overflow: hidden;
  padding: 0 24px;
  font-size: 14px;
  color: rgba(255,255,255,0.5);
  line-height: 1.6;
  transition: all 0.3s;
}
.landing-page:not(.dark) .faq-answer { color: rgba(0,0,0,0.5); }
.faq-item.open .faq-answer { max-height: 200px; padding: 0 24px 18px; }

/* CTA */
.cta-section { padding: 80px 24px; }
.cta-container {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1));
  border: 1px solid rgba(59,130,246,0.2);
  border-radius: 20px;
  padding: 56px 40px;
}
.cta-title { font-size: 30px; font-weight: 800; margin: 0 0 12px 0; }
.cta-subtitle { font-size: 16px; color: rgba(255,255,255,0.5); margin: 0 0 28px 0; }
.landing-page:not(.dark) .cta-subtitle { color: rgba(0,0,0,0.5); }
.cta-btn {
  padding: 14px 40px;
  border-radius: 10px;
  background: #3b82f6;
  color: white;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.cta-btn:hover { background: #2563eb; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(59,130,246,0.4); }

/* 页脚 */
.landing-footer {
  padding: 32px 24px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.landing-page:not(.dark) .landing-footer { border-top-color: rgba(0,0,0,0.06); }
.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.footer-brand { display: flex; align-items: center; gap: 10px; }
.footer-name { font-size: 16px; font-weight: 700; }
.footer-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.footer-copyright { font-size: 13px; color: rgba(255,255,255,0.65); margin: 0; }
.footer-copyright a,
.footer-links a { color: inherit; text-decoration: none; transition: color 0.2s; }
.footer-links { display: flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(255,255,255,0.4); }
.footer-copyright a:hover,
.footer-links a:hover { color: #60a5fa; }
.landing-page:not(.dark) .footer-copyright { color: rgba(0,0,0,0.65); }
.landing-page:not(.dark) .footer-links { color: rgba(0,0,0,0.4); }
.landing-page:not(.dark) .footer-links a:hover { color: #2563eb; }

/* 移动端 */
@media (max-width: 768px) {
  .nav-menu { display: none; }
  .hero-container { grid-template-columns: 1fr; gap: 40px; }
  .hero-title { font-size: 32px; }
  .hero-right { display: none; }
  .features-grid, .pricing-grid { grid-template-columns: 1fr; }
  .stats-container { flex-wrap: wrap; gap: 20px; }
  .stat-divider { display: none; }
  .stat-item { flex: 1 1 40%; }
  .footer-container { flex-direction: column; gap: 12px; }
  .footer-meta { align-items: center; text-align: center; }
  .section-title { font-size: 24px; }
  .cta-title { font-size: 22px; }
}
</style>
