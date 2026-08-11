<template>
  <!--
    全站背景组件
    - 根据 background.type 动态渲染 <img> 或 <video>
    - 媒体以 position: fixed; inset:0 响应式覆盖整个视口
    - 视频支持 autoplay / loop / muted 属性
    - 媒体之上叠加半透明遮罩层，提升前景内容可读性
  -->
  <div v-if="appStore.backgroundEnabled" class="stellar-global-bg" aria-hidden="true">
    <!-- 图片背景 -->
    <img
      v-if="appStore.background.type === 'image'"
      :src="currentBackgroundUrl"
      class="stellar-bg-media"
      alt=""
      draggable="false"
    />

    <!-- 视频背景 -->
    <video
      v-else
      :key="currentBackgroundUrl"
      :src="currentBackgroundUrl"
      :poster="appStore.background.poster || undefined"
      class="stellar-bg-media"
      :autoplay="appStore.background.video_autoplay"
      :loop="appStore.background.video_loop"
      :muted="appStore.background.video_muted"
      playsinline
      preload="auto"
    ></video>

    <!-- 遮罩层 -->
    <div
      class="stellar-bg-overlay"
      :style="{
        backgroundColor: appStore.background.overlay_color,
        opacity: appStore.background.overlay_opacity,
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const MOBILE_BACKGROUND_QUERY = '(max-width: 767px)'
const mobileMediaQuery = typeof window !== 'undefined'
  ? window.matchMedia(MOBILE_BACKGROUND_QUERY)
  : null
const isMobileViewport = ref(mobileMediaQuery?.matches ?? false)

const currentBackgroundUrl = computed(() => (
  isMobileViewport.value
    ? appStore.mobileBackgroundUrl
    : appStore.desktopBackgroundUrl
))

const handleViewportChange = (event: MediaQueryListEvent) => {
  isMobileViewport.value = event.matches
}

onMounted(() => {
  mobileMediaQuery?.addEventListener('change', handleViewportChange)
})

onUnmounted(() => {
  mobileMediaQuery?.removeEventListener('change', handleViewportChange)
})
</script>

<style scoped>
/* 背景容器：固定铺满整个视口，置于最底层 */
.stellar-global-bg {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  /* 高度兼容移动端地址栏伸缩 */
  height: 100dvh;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: var(--stellar-bg);
}

/* 媒体元素：响应式覆盖整个视口（object-fit: cover 保证不变形） */
.stellar-bg-media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  /* 避免图片/视频被选中拖动 */
  user-select: none;
  -webkit-user-drag: none;
}

/* 遮罩层：叠加在媒体之上，提升前景可读性 */
.stellar-bg-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* 尊重用户的减少动画偏好：视频暂停动画相关属性 */
@media (prefers-reduced-motion: reduce) {
  .stellar-bg-media {
    animation: none !important;
  }
}
</style>
