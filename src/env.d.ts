/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface Window {
  routerBase: string
  settings: {
    title: string
    description: string
    assets_path: string
    theme: {
      color: string
    }
    version: string
    /** @deprecated 已被 background 配置取代，保留以向后兼容 */
    background_url: string
    logo: string
    landing_theme_mode?: 'dark' | 'light'
    landing_page_enabled?: boolean
    telegram_group?: string
    api_error_contact?: string
    header_code?: string
    footer_code?: string
    api?: import('@/utils/apiConfig').ApiRuntimeConfig
    i18n?: string[]
    client_downloads?: {
      windows?: string
      macos?: string
      android?: string
      ios?: string
      linux?: string
      router?: string
    }
    /** 全站背景配置（支持图片/视频） */
    background?: {
      /** 是否启用全站背景 */
      enabled: boolean
      /** 媒体类型：'image' 静态图片 | 'video' 视频背景 */
      type: 'image' | 'video'
      /** 媒体资源 URL（图片或视频地址） */
      url: string
      /** 备用图片 URL（视频不可用时回退，可选） */
      poster?: string
      /** 背景遮罩透明度 0-1（叠加在媒体之上的纯色遮罩，提升内容可读性） */
      overlay_opacity: number
      /** 遮罩颜色（任意合法 CSS 颜色值） */
      overlay_color: string
      /** 视频是否自动播放（仅 type='video' 生效） */
      video_autoplay: boolean
      /** 视频是否循环播放（仅 type='video' 生效） */
      video_loop: boolean
      /** 视频是否静音（仅 type='video' 生效） */
      video_muted: boolean
    }
    /** 全局毛玻璃（Glassmorphism）卡片效果配置 */
    glassmorphism?: {
      /** 是否为所有卡片组件启用毛玻璃效果 */
      enabled: boolean
      /** 背景模糊强度，单位 px（对应 backdrop-filter: blur()） */
      blur: number
      /** 卡片背景透明度 0-1（叠加在模糊层之上的半透明色） */
      opacity: number
      /** 边框样式：'none' 无边框 | 'solid' 实线 | 'light' 细半透明线 */
      border_style: 'none' | 'solid' | 'light'
      /** 边框颜色（任意合法 CSS 颜色值，border_style 为 none 时忽略） */
      border_color: string
      /** 边框宽度，单位 px */
      border_width: number
      /** 圆角，单位 px */
      radius: number
    }
  }
}
