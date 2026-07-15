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
    background_url: string
    logo: string
    landing_theme_mode?: 'dark' | 'light'
    landing_page_enabled?: boolean
    telegram_group?: string
    api_error_contact?: string
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
  }
}
