# Stellar Theme

[![GitHub](https://img.shields.io/badge/GitHub-aklibk86--dev%2Fstellar-181717?logo=github)](https://github.com/aklibk86-dev/stellar)

**项目仓库：** <https://github.com/aklibk86-dev/stellar>  
**项目文档：** <https://stellar.aklibk.wiki>

Stellar Theme 是一套面向 XBoard 的现代化用户端主题，基于 Vue 3、TypeScript 与 Vite 构建，覆盖落地页、认证、套餐购买、订单、工单、邀请、知识库、流量统计、订阅导入和个人资料等完整功能。

支持中英文切换、深浅色主题、响应式布局、多 API 可用性检测、运行时配置、子目录部署及 CDN 静态资源加速。大部分站点信息和 API 设置均可通过 `public/env.js` 修改，无需重新构建。

兼容两类后端：
- **cedar2025/Xboard**：支持魔法链接登录、礼品卡、Turnstile/reCAPTCHA v3
- **wyx2685/v2board**：支持工单提现、流量提前重置、解绑 Telegram

通过 `public/env.js` 中的 `api.backend_type` 字段切换后端类型。

## 功能

| 功能模块 | 说明 |
| --- | --- |
| 官网落地页 | 品牌导航、核心卖点、线路展示、数据指标、套餐列表、FAQ、行动按钮 |
| 用户认证 | 用户名/邮箱登录、注册、邮箱验证码登录、忘记密码、登录状态持久化 |
| 用户仪表盘 | 账户概况、有效期、剩余流量、订阅复制/导入、待支付订单/工单提醒 |
| 订阅导入 | 多平台客户端资源，支持配置下载链接 |
| 节点与服务器 | 查看后端返回的可用节点信息 |
| 套餐购买 | 从后端读取套餐、展示价格周期、选择支付方式、提交订单 |
| 订单管理 | 查看历史订单和状态，仪表盘提醒待支付订单 |
| 工单系统 | 提交工单、查看状态，控制台提醒待处理工单 |
| 邀请与返利 | 邀请链接、记录及佣金数据 |
| 知识库 | 加载帮助文章，支持 HTML/Markdown 混排并经 DOMPurify 净化 |
| 流量统计 | ECharts 图表展示流量使用趋势 |
| 个人资料 | 基础资料、密码和账户相关设置 |
| API 可用性检测 | 多地址并行检测，自动选择可用 API |

## 技术栈

| 技术 | 用途 |
| --- | --- |
| Vue 3 | 前端应用框架 |
| TypeScript | 静态类型检查 |
| Vite | 开发服务器与构建 |
| Vue Router | 前端路由 |
| Pinia | 状态管理 |
| Naive UI | UI 组件库 |
| Axios | HTTP 请求 |
| Vue I18n | 国际化 |
| ECharts / Vue ECharts | 图表展示 |
| Tailwind CSS / PostCSS / Sass | 样式工具链 |
| DOMPurify | HTML 内容安全净化 |

## 环境要求

- Node.js 20 LTS+
- npm 10+
- 可正常访问的 XBoard 后端 API
- 生产部署推荐 Nginx

查看版本：

```bash
node -v
npm -v
```

## 快速开始

### 1. 获取项目

```bash
git clone https://github.com/aklibk86-dev/stellar.git
cd stellar
```

### 2. 安装依赖

```bash
npm ci
```

更新依赖使用：

```bash
npm install
```

### 3. 配置开发 API

复制环境变量模板：

```bat
copy .env.example .env.development
```

修改 `.env.development` 中的后端地址：

```env
VITE_DEV_API_TARGET=https://api.example.com
```

> 仅开发环境使用，生产环境在 `public/env.js` 中配置。

### 4. 启动开发服务器

```bash
npm run dev
```

访问：`http://localhost:3100`

### 5. 构建生产版本

```bash
npm run build
```

产物输出到 `dist/` 目录。

### 6. 预览生产版本

```bash
npm run preview
```

## 可用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 类型检查并构建 |
| `npm run preview` | 预览构建产物 |

## 配置说明

### 构建时配置

复制示例文件：

```bash
# Windows
copy .env.example .env.production

# Linux/macOS
cp .env.example .env.production
```

| 变量 | 说明 |
| --- | --- |
| `VITE_BASE` | 构建资源基础路径 |
| `VITE_CDN_URL` | 静态资源 CDN 前缀 |
| `VITE_DEV_API_TARGET` | 本地开发代理目标 |

### 运行时配置

`public/env.js` 文件部署后可直接修改，无需重新构建：

```js
window.routerBase = '/'

window.settings = {
  title: 'Stellar',
  description: 'Stellar Panel',
  assets_path: '/assets',
  theme: { color: 'default' },
  version: '1.0.0',
  background_url: '',
  logo: '',
  landing_theme_mode: 'dark',
  telegram_group: '',
  api_error_contact: '',
  glassmorphism: {},
  client_downloads: {
    windows: '', macos: '', android: '', ios: '', linux: '', router: '',
  },
  api: {
    url_mode: 'auto',
    static_base_urls: [],
    backend_type: 'auto',
    check_enabled: false,
  },
}
```

| 配置项 | 说明 |
| --- | --- |
| `routerBase` | Vue Router 基础路径，必须以 `/` 开头和结尾 |
| `title` / `description` | 网站名称和描述 |
| `assets_path` | 静态资源目录 |
| `theme.color` | 主题色标识 |
| `background_url` | 自定义背景图片地址 |
| `logo` | 自定义 Logo 地址 |
| `landing_theme_mode` | 落地页默认模式：`dark` / `light` |
| `telegram_group` | Telegram 群组链接 |
| `glassmorphism` | 毛玻璃卡片特效配置 |

## API 接入方式

### 方式一：固定 API 地址

```js
api: {
  url_mode: 'static',
  static_base_urls: ['https://panel.example.com'],
  check_enabled: false,
}
```

多个地址启用检测：

```js
api: {
  url_mode: 'static',
  static_base_urls: ['https://panel-a.example.com', 'https://panel-b.example.com'],
  check_enabled: true,
}
```

### 方式二：同域自动地址

```js
api: {
  url_mode: 'auto',
  auto: { use_same_protocol: true, host: '', append_path: '/api' },
  check_enabled: false,
}
```

### 方式三：前端代理模式

```js
api: {
  url_mode: 'static',
  static_base_urls: ['https://panel.example.com'],
  proxy_enabled: true,
  proxy_url: 'https://www.example.com',
  proxy_path: '/api-proxy',
  proxy_mode: 'base64Path',
}
```

> 注意：代理模式需服务器实现对应转发逻辑，并配置白名单防范 SSRF 风险。

## 多后端适配

在 `public/env.js` 中设置 `backend_type`：

```js
api: {
  backend_type: 'auto', // 'xboard' | 'v2board' | 'auto'
}
```

| 功能 | Xboard | v2board |
| --- | --- | --- |
| 邮箱链接登录 | ✅ | ❌ |
| 游客获取套餐 | ✅ | ❌ |
| 礼品卡校验/兑换 | ✅ | ✅（路径不同） |
| 工单提现 | ❌ | ✅ |
| 流量提前重置 | ❌ | ✅ |
| 解绑 Telegram | ❌ | ✅ |
| 高级验证码 | ✅ | ❌ |

自动探测规则：首次请求 `guest/comm/config` 后，根据返回字段（`is_captcha`、`captcha_type` 等）判断后端类型。

## 生产部署

### 根目录部署（推荐）

1. 构建：`npm run build`
2. 上传 `dist/` 到服务器
3. 修改 `env.js`：`window.routerBase = '/'`
4. 配置 Nginx SPA 回退：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/stellar;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_set_header Host $host;
    }

    location = /env.js { expires -1; add_header Cache-Control "no-store, no-cache"; }
    location / { try_files $uri $uri/ /index.html; }
}
```

### 子目录部署

访问地址 `https://example.com/stellar/`：

```js
window.routerBase = '/stellar/'
```

```nginx
location /stellar/ {
    alias /var/www/stellar/;
    try_files $uri $uri/ /stellar/index.html;
}
```

### CDN 部署

```env
VITE_CDN_URL=https://cdn.example.com/stellar/
```

- `assets/` 上传到 CDN
- `index.html` 和 `env.js` 保留在源站
- 带哈希的资源可长期缓存

## 推荐缓存策略

| 文件 | 策略 |
| --- | --- |
| `index.html` | 不缓存或短缓存 |
| `env.js` | `no-store, no-cache` |
| 带哈希的 JS/CSS | 长期缓存 + `immutable` |

## 项目结构

```text
stellar/
├─ public/            # 静态资源
│  ├─ env.js          # 运行时配置
│  └─ client-logos/   # 客户端 Logo
├─ src/
│  ├─ api/            # API 请求
│  ├─ assets/         # 静态资源
│  ├─ components/     # 通用组件
│  ├─ i18n/           # 国际化
│  ├─ layouts/        # 布局组件
│  ├─ router/         # 路由配置
│  ├─ stores/         # Pinia 状态管理
│  ├─ styles/         # 全局样式
│  ├─ utils/          # 工具函数
│  ├─ views/          # 页面视图
│  ├─ App.vue
│  └─ main.ts
├─ .env.example       # 环境变量示例
├─ nginx.conf.example # Nginx 配置示例
└─ package.json
```

## 常见问题

**API 请求失败？**
- 检查 `env.js` 中 API 地址是否正确
- 确认后端可访问且配置了正确的 CORS
- 检查 Nginx 代理配置与 `append_path` 是否一致

**刷新后 404？**
- 配置 SPA History 路由回退：`try_files $uri $uri/ /index.html`

**env.js 修改不生效？**
- 强制刷新浏览器，检查 Nginx/CDN 是否缓存了该文件

**多 API 检测页面反复出现？**
- 确认至少一个 `static_base_urls` 地址可访问检测接口
- 不需要检测时将 `check_enabled` 设置为 `false`

**子目录路径错误？**
- 确保 `routerBase` 使用完整的首尾斜杠：`/stellar/`

## 安全建议

- 生产环境使用 HTTPS
- 不在前端配置文件中存放敏感信息
- 后端 CORS 限制来源，优先使用同域代理
- 定期执行 `npm audit` 检查依赖安全

## 开发说明

- `@` 路径别名指向 `src/`
- Vue、Vue Router、Pinia 和 Naive UI 支持自动导入
- 新增页面需在 `src/router/index.ts` 注册路由
- 修改运行时配置需同步更新 `src/env.d.ts` 和 `src/utils/settings.ts`

## 发布检查清单

- [ ] 已执行 `npm ci`
- [ ] 已配置正确的 API 地址
- [ ] 已修改站点标题、Logo 和联系链接
- [ ] 已清理示例客户端下载地址
- [ ] 已执行 `npm run build`
- [ ] 已上传 `dist/` 全部文件
- [ ] 已配置 SPA 路由回退
- [ ] 已禁用 `env.js` 长期缓存
- [ ] 已验证注册、登录、套餐、订单和订阅流程
- [ ] 已启用 HTTPS

## 项目地址

- GitHub：<https://github.com/aklibk86-dev/stellar>
- 作者：[@aklibk86-dev](https://github.com/aklibk86-dev)
- Telegram：<https://t.me/kqxw_chat>

> 当前源码未提供许可证文件，商用前请确认授权范围。
