import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig(({ mode }) => {
  // 加载当前模式的 .env 文件。第三个参数为空字符串，允许读取全部变量。
  const env = loadEnv(mode, process.cwd(), '')
  // 构建资源基础路径；默认相对路径可适配根目录及多数子目录部署。
  const base = env.VITE_BASE || './'
  // CDN 前缀留空时不启用；配置后会覆盖 base。
  const cdnUrl = env.VITE_CDN_URL || ''

  return {
    plugins: [
      vue(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        dts: 'src/auto-imports.d.ts',
      }),
      Components({
        resolvers: [NaiveUiResolver()],
        dts: 'src/components.d.ts',
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    base: cdnUrl || base,
    build: {
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: true,
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          entryFileNames: 'assets/stellar.js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'naive-ui': ['naive-ui'],
            'echarts': ['echarts', 'vue-echarts'],
          },
        },
      },
      chunkSizeWarningLimit: 2000,
    },
    server: {
      port: 3100,
    },
  }
})
