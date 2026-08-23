// ============================================================
// 构建前环境文件检查脚本
// ============================================================
// 说明：
//   public/env.js 含真实后端地址等运营信息，已从版本库移除（git 不再跟踪），
//   仓库只提供无敏感值的模板 public/env.js.example。
//   本脚本在 npm run build 前自动执行（package.json 的 prebuild 钩子）：
//   - public/env.js 已存在：直接通过，不做任何覆盖；
//   - public/env.js 缺失：自动从 env.js.example 复制生成（全新 clone 可正常构建）。
// ============================================================

import { existsSync, copyFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ENV_FILE = resolve(__dirname, '..', 'public', 'env.js')
const EXAMPLE_FILE = resolve(__dirname, '..', 'public', 'env.js.example')

if (existsSync(ENV_FILE)) {
  console.log('[ensure-env] ✅ public/env.js 已存在，跳过复制')
  process.exit(0)
}

if (!existsSync(EXAMPLE_FILE)) {
  console.error(`[ensure-env] ❌ 未找到 public/env.js，且缺少模板 public/env.js.example`)
  console.error('   请先执行：cp public/env.js.example public/env.js 并填写真实配置后重新构建')
  process.exit(1)
}

try {
  copyFileSync(EXAMPLE_FILE, ENV_FILE)
  console.log('[ensure-env] ✅ 已从 public/env.js.example 自动复制生成 public/env.js')
  console.log('[ensure-env] ⚠ 请检查并填写真实配置（后端地址、客服 ID 等）后重新构建部署')
  process.exit(0)
} catch (err) {
  console.error(`[ensure-env] ❌ 复制 public/env.js.example 失败：`, err)
  process.exit(1)
}