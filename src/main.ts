import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './utils/settings'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './styles/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)

app.config.errorHandler = (error, _instance, info) => {
  console.error(`[Vue] 页面渲染失败 (${info}):`, error)
  const currentRoute = router.currentRoute.value
  if (currentRoute.name === 'route-fallback') return
  void router.replace({
    name: 'route-fallback',
    query: { from: currentRoute.fullPath, reason: 'render_failed' },
  })
}

app.mount('#app')
