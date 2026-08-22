/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  // 注意：src/utils 下有写入工具残留且被占用的 .tmpdir 临时目录（无读取权限，
  // 递归扫描会以 EPERM 中断构建），因此 src/utils 只做平铺扫描（其下仅有纯工具
  // 函数与自定义样式类，无 Tailwind 工具类）；其余目录全部递归扫描。
  content: [
    './index.html',
    './src/*.{vue,js,ts,jsx,tsx}',
    './src/utils/*.{js,ts}',
    './src/{api,assets,components,i18n,layouts,router,stores,styles,views}/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}
