# Stellar Theme

[![GitHub](https://img.shields.io/badge/GitHub-aklibk86--dev%2Fstellar-181717?logo=github)](https://github.com/aklibk86-dev/stellar)

**项目仓库：** <https://github.com/aklibk86-dev/stellar>  
**项目文档：** <https://stellar.aklibk.wiki>

Stellar Theme 是一套面向 XBoard 的现代化用户端主题，基于 Vue 3、TypeScript 与 Vite 构建，覆盖落地页、认证、套餐购买、订单、工单、邀请、知识库、流量统计、订阅导入和个人资料等完整功能。

支持中英文切换、深浅色主题、响应式布局、多 API 可用性检测、运行时配置及子目录部署。大部分站点信息和 API 设置均可通过 `public/env.js` 修改，无需重新构建。

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
| 线路与服务器 | 查看后端返回的可用线路信息 |
| 套餐购买 | 从后端读取套餐、展示价格周期、套餐库存展示（剩余/总数，需后端补丁，见 `documentation/套餐库存显示-后端补丁.md`）、选择支付方式、提交订单 |
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

首次部署先复制模板：`cp public/env.js.example public/env.js`（`env.js` 含真实后端地址等运营信息，**已被 git 忽略、不再进版本库**；`npm run build` 的 `prebuild` 钩子会在其缺失时自动从模板复制，全新 clone 也能构建，但值为占位，部署前必须替换）。然后在 `public/env.js` 的 `api` 配置中填写后端地址和类型。该文件是项目唯一的站点配置入口，修改后无需重新构建。

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
  landing_navigation: {
    items: [
      { label: '功能', label_en: 'Features', url: '#features' },
      { label: '套餐', label_en: 'Pricing', url: '#pricing' },
      { label: '状态页', label_en: 'Status', url: 'https://status.example.com', new_tab: true },
    ],
  },
  landing_hero: {
    badge: '', badge_en: '',
    title: '', title_en: '',
    title_suffix: '', title_suffix_en: '',
    subtitle: '', subtitle_en: '',
    features: [
      { label: '稳定高速', label_en: 'Stable and fast' },
    ],
  },
  sidebar_navigation: {
    items: [
      { label: '仪表盘', label_en: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
      { type: 'group', label: '产品服务', label_en: 'Products' },
      { label: '购买套餐', label_en: 'Plans', path: '/plans', icon: 'shop' },
      { label: '服务状态', label_en: 'Status', url: 'https://status.example.com', icon: 'world', new_tab: true, badge: 'NEW' },
    ],
  },
  telegram_group: '',
  api_error_contact: '',
  background: {
    enabled: true,
    type: 'image',
    url: '',
    desktop_url: 'https://example.com/wallpaper-desktop.webp',
    mobile_url: 'https://example.com/wallpaper-mobile.webp',
  },
  glassmorphism: {},
  client_downloads: {
    windows: '', macos: '', android: '', ios: '', linux: '', router: '',
  },
  client_imports: {
    enabled: true,
    clients: [],
  },
  social_sharing: {
    enabled: true,
    platforms: ['wechat', 'qq', 'weibo', 'twitter', 'telegram', 'facebook', 'copy'],
    title: '',
    description: '',
  },
  customer_service: {
    enabled: false,
    provider: 'tawk',
    load_delay: 800,
    load_on_idle: true,
    identify_user: true,
    track_page_views: true,
    show_on_routes: [],
    hide_on_routes: ['/login', '/register', '/forget'],
    hide_on_mobile: false,
    tags: ['stellar'],
    attributes: {},
    tawk_property_id: '',
    tawk_widget_id: 'default',
    crisp_website_id: '',
    chatwoot_base_url: '',
    chatwoot_website_token: '',
    intercom_app_id: '',
    script_url: '',
  },
  api: {
    url_mode: 'auto',
    static_base_urls: [],
    backend_type: 'auto',
    check_enabled: false,
    exclude_payment_methods: [],  // 支付方式排除名单（如 ['StripeCredit']）
  },
}
```

| 配置项 | 说明 |
| --- | --- |
| `routerBase` | Vue Router 基础路径，必须以 `/` 开头和结尾 |
| `title` / `description` | 网站名称和描述 |
| `assets_path` | 静态资源目录 |
| `theme.color` | 主题色标识 |
| `background_url` | 旧版登录页背景地址，仅用于向后兼容 |
| `background` | 全站图片/视频背景；支持 `desktop_url` 与 `mobile_url` 分别设置电脑和手机壁纸 |
| `logo` | 自定义 Logo 地址 |
| `landing_theme_mode` | 落地页默认模式：`dark` / `light` |
| `landing_navigation` | 落地页顶部导航；支持双语名称、锚点、站内路径、外链和新窗口打开，`items: []` 可隐藏链接 |
| `landing_hero` | 落地页顶部 Hero 文案；支持中英文徽标、标题、标题后缀、副标题和卖点列表 |
| `sidebar_navigation` | 后台侧边栏；支持分组、双语名称、排序、显隐、图标、徽标、站内路径及安全外链 |
| `telegram_group` | Telegram 群组链接 |
| `glassmorphism` | 毛玻璃卡片特效配置 |
| `client_imports` | 一键导入开关及客户端 ID 白名单；`clients: []` 表示全部 |
| `social_sharing` | 邀请分享开关、平台列表及自定义分享标题/描述 |
| `customer_service` | Tawk、Crisp、Chatwoot、Intercom 或可信自定义客服脚本配置 |
| `session` | 会话超时配置（小时，0=不限制）：`idle_hours` / `max_hours` / `remembered_max_hours`（"记住我"用） |
| `notice_tags` | 公告标签关键词（中英文）：`plan` / `popup` / `important` |
| `knowledge_require_subscription` | 是否要求订阅后才可查看文档，默认 `false`（登录即可查看） |

背景地址按视口宽度自动选择：宽度不超过 `767px` 时优先使用 `mobile_url`，其余视口优先使用 `desktop_url`。对应地址为空时会回退到通用 `url`，再回退到另一端地址，因此原有只配置 `url` 的部署无需修改。

内置客户端 ID 可直接查看 `src/components/SubscribeImportModal.vue`。常用示例：`ios-shadowrocket`、`ios-stash`、`android-flclash`、`android-v2rayng`、`windows-clashverge`、`mac-clashverge`。

Tawk 配置示例：

```js
customer_service: {
  enabled: true,
  provider: 'tawk',
  tawk_property_id: 'YOUR_PROPERTY_ID',
  tawk_widget_id: 'default',
  load_on_idle: true,
  load_delay: 800,
  identify_user: true,
    hide_on_routes: ['/login', '/register', '/forget', '/checkout/*'],
    show_on_auth_routes: true,
  tags: ['stellar-panel'],
  attributes: { source: 'web' },
}
```

Tawk 会自动同步当前登录用户的 UUID、邮箱、头像和套餐 ID，并转发 `onStatusChange`、`onChatStarted`、`onChatEnded`、`onOfflineSubmit` 等官方回调。页面可监听统一事件：

```js
window.addEventListener('stellar:customer-service', (event) => {
  console.log(event.detail.provider, event.detail.event, event.detail.payload)
})

await window.stellarCustomerService?.open()
window.stellarCustomerService?.track('order_created', { plan_id: 1 })
```

### 转化埋点事件（Analytics）

前端内置极简事件总线：`track()` 会广播 `stellar:track` 事件，任意分析平台脚本监听即可接入，无需改动前端代码；同时暴露 `window.stellarAnalytics.track(...)` 公开 API。已埋点：注册成功、登录成功、创建订单、订单支付成功、续费成功、创建工单、重置流量。**不采集邮箱/token 等 PII**，只传事件名与业务 ID。

```js
window.addEventListener('stellar:track', (event) => {
  console.log(event.detail.event, event.detail.metadata)
})

// 脚本侧也可直接调用
window.stellarAnalytics?.track('order_payment_success', { trade_no: '20240101xxxx' })
```

Tawk 安全模式必须在服务端使用 Property API Key 为每个用户生成 HMAC SHA256。可在应用启动前注入当前用户身份，禁止把通用 hash 或 API Key 写入静态文件：

```js
window.customerServiceIdentity = {
  user_id: 'CURRENT_USER_ID',
  hash: 'SERVER_GENERATED_TAWK_HASH',
  name: 'Current User',
  email: 'user@example.com',
}
```

其他客服平台示例：

```js
// Crisp
customer_service: {
  enabled: true,
  provider: 'crisp',
  crisp_website_id: 'YOUR_CRISP_WEBSITE_ID',
}

// Chatwoot（支持官方云服务和自托管）
customer_service: {
  enabled: true,
  provider: 'chatwoot',
  chatwoot_base_url: 'https://chat.example.com',
  chatwoot_website_token: 'YOUR_WEBSITE_TOKEN',
  chatwoot_locale: 'zh_CN',
  chatwoot_position: 'right',
}

// Intercom
customer_service: {
  enabled: true,
  provider: 'intercom',
  intercom_app_id: 'YOUR_APP_ID',
  intercom_api_base: 'https://api-iam.intercom.io',
}

// 其他系统：脚本监听 command:* 统一事件完成自己的 open/hide/track 逻辑
customer_service: {
  enabled: true,
  provider: 'custom',
  script_url: 'https://support.example.com/widget.js',
}
```

路由规则支持精确路径和结尾通配符，例如 `/tickets*` 可匹配工单列表及详情页。`hide_on_routes` 优先于 `show_on_routes`。`identify_user: false` 可完全关闭用户身份同步。

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

### 方式三：前端转发模式

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

> 注意：转发模式需服务器实现对应转发逻辑，并配置白名单防范 SSRF 风险。

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
| 套餐库存展示 | ✅（默认「限量 N 份」；打补丁后「剩余 X / 总 Y」） | ✅（默认「仅剩 N 份」；打补丁后「剩余 X / 总 Y」） |
| 礼品卡校验/兑换 | ✅ | ✅（路径不同） |
| 工单提现 | ❌ | ✅ |
| 流量提前重置 | ❌ | ✅ |
| 解绑 Telegram | ❌ | ✅ |
| 高级验证码 | ✅ | ❌ |

> 修改邮箱说明：前端已实现新邮箱验证码、提交、重新拉取用户信息和结果校验。cedar2025/Xboard 与 wyx2685/v2board 官方版本当前都未提供修改邮箱接口，`/api/v1/user/update` 仅接受提醒类设置，因此官方后端会显示“不支持修改邮箱”，不会误报成功。要真正启用该功能，需要后端扩展该接口并接受 `email`、`email_code` 字段。

自动探测规则：首次请求 `guest/comm/config` 后，根据返回字段（`is_captcha`、`captcha_type` 等）判断后端类型。

## 生产部署

### 根目录部署（推荐）

1. 首次部署先复制模板：`cp public/env.js.example public/env.js`，并填写真实后端地址、客服 ID 等配置
2. 构建：`npm run build`（`env.js` 缺失时 prebuild 会自动从模板复制）
3. 上传 `dist/` 到服务器
4. 修改 `dist/env.js`：`window.routerBase = '/'`
5. 配置 Nginx SPA 回退：

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

    # 禁止被 iframe 嵌入（frame-ancestors 只能通过响应头生效，meta 无效）
    add_header Content-Security-Policy "frame-ancestors 'none'" always;
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
├─ nginx.conf.example # Nginx 配置示例
└─ package.json
```

## 常见问题

**API 请求失败？**
- 检查 `env.js` 中 API 地址是否正确
- 确认后端可访问且配置了正确的 CORS
- 检查 Nginx 转发配置与 `append_path` 是否一致

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

- 生产环境使用 HTTPS，并在响应头设置 `Content-Security-Policy: frame-ancestors 'none'` 禁止 iframe 嵌入（该指令**只能通过 HTTP 响应头生效**，写在 index.html 的 `<meta>` 中会被浏览器忽略）
- 不在前端配置文件中存放敏感信息
- 后端 CORS 限制来源，优先使用同域转发
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
