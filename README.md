# Stellar Theme

[![GitHub](https://img.shields.io/badge/GitHub-aklibk86--dev%2Fstellar-181717?logo=github)](https://github.com/aklibk86-dev/stellar)

**项目仓库：<https://github.com/aklibk86-dev/stellar>**
**项目文档：<https://stellar.aklibk.wiki>**

Stellar Theme 是一套面向 XBoard 的现代化用户端主题。项目采用 Vue 3、TypeScript 与 Vite 构建，为用户提供落地页、认证、套餐购买、订单、工单、邀请、知识库、流量统计、订阅导入和个人资料等完整功能。

项目支持中英文切换、深浅色主题、响应式布局、多 API 地址可用性检测、运行时配置、子目录部署以及 CDN 静态资源加速。大部分站点信息和 API 设置均可通过 `public/env.js` 修改，生产环境调整配置时通常不需要重新构建。

## 项目介绍

Stellar Theme 不只是一个展示页面，而是一套可以直接连接 XBoard 后端 API 的完整用户中心前端。它覆盖用户从访问官网、注册登录、选择套餐、创建订单、获取订阅，到查看流量、提交工单和管理账户的主要使用流程。

项目将站点展示与 XBoard 业务功能整合在同一个单页应用中：未登录用户可以浏览落地页和套餐，登录后则进入带侧边栏的用户控制台。主题采用前后端分离设计，不包含 XBoard 后端服务和管理后台，部署前需要准备一个接口兼容的 XBoard 后端。

### 适用场景

- 为 XBoard 部署一套独立、现代化的用户端主题
- 将官网落地页、套餐营销页和用户中心合并部署
- 前端与 XBoard 后端分别使用不同域名
- 前端与 API 通过 Nginx 反向代理在同一域名下运行
- 一个前端站点配置多个备用 API，提高入口可用性
- 使用 CDN 托管前端静态资源，并在源站动态调整站点配置

## 功能介绍

### 1. 官网落地页

首页为访客提供完整的产品展示入口，包括品牌导航、核心卖点、线路效果展示、数据指标、功能卡片、套餐列表、FAQ 和行动按钮。

- 自动从 XBoard 后端读取套餐，按价格排序并展示前三个套餐
- 后端暂时不可用时显示内置的示例套餐，避免页面内容空白
- 支持登录、注册、购买套餐和进入控制台等快捷入口
- Telegram 群组链接可在运行时配置，也可尝试从后端获取
- 桌面端展示完整视觉效果，移动端自动切换为单栏布局

### 2. 用户认证

主题提供完整的账户入口，并根据用户登录状态执行页面访问控制。

- 用户名或邮箱登录
- 用户注册
- 邮箱验证码登录
- 忘记密码与密码重置入口
- 登录凭证持久化
- 未登录访问用户中心时自动跳转到登录页
- 已登录用户访问登录或注册页时自动返回控制台
- 登录失效或 API 返回 401 时自动退出并重新登录

### 3. 用户仪表盘

仪表盘集中展示用户最常用的信息和操作，用户登录后无需在多个页面之间查找订阅资料。

- 账户与订阅概况
- 套餐有效期和剩余流量信息
- 订阅地址复制与快捷导入
- 待支付订单提醒
- 待处理工单提醒
- 常用客户端入口和客户端下载按钮
- Windows、macOS、Android、iOS、Linux 和软路由平台支持

### 4. 订阅与客户端导入

主题提供订阅导入弹窗和多平台客户端资源，方便用户从网页直接进入对应客户端。

- 根据平台展示对应客户端及 Logo
- 支持配置各平台的客户端下载链接
- 未配置下载地址的平台不会显示无效按钮
- 可通过订阅链接配合不同客户端完成导入
- 客户端图片作为本地静态资源提供，减少外部图片依赖

### 5. 节点与服务器

服务器页面用于查看后端返回的可用节点信息，帮助用户了解当前服务覆盖范围和线路状态。实际展示内容取决于 XBoard 后端返回的数据及用户权限。

### 6. 套餐购买与结算

主题覆盖从套餐浏览到订单创建的购买流程。

- 从后端读取可售套餐
- 展示套餐名称、价格、周期和套餐内容
- 从落地页或控制台进入套餐页面
- 按套餐编号进入结算页面
- 选择可用支付方式并提交订单
- 未登录购买时先引导用户完成登录或注册

### 7. 订单管理

订单页面用于集中查看账户历史订单和当前订单状态，包括待支付、已支付、已取消等由后端返回的状态。仪表盘还会对待支付订单进行醒目提醒，减少遗漏付款的情况。

### 8. 工单系统

用户可以通过工单页面联系服务方，查看已有工单及处理状态。存在待处理工单时，控制台会显示提醒横幅，方便用户及时跟进回复。

### 9. 邀请与返利

邀请页面用于展示 XBoard 后端配置的邀请信息，为用户提供邀请链接、邀请记录以及佣金相关数据。具体邀请规则、佣金比例和提现能力由后端配置决定。

### 10. 知识库

知识库页面从后端加载帮助文章，用于发布客户端教程、常见问题、服务说明和使用规范。富文本内容在前端展示前会进行安全处理，降低不可信 HTML 带来的风险。

### 11. 流量统计

流量页面通过图表展示用户的流量使用情况，便于查看不同时间范围内的使用趋势。图表能力由 ECharts 和 Vue ECharts 提供。

### 12. 个人资料与账户安全

个人资料页面用于查看和维护账户信息。可用操作取决于后端接口，一般包括基础资料、密码和账户相关设置。

### 13. API 可用性检测

当配置多个固定 API 地址时，主题可在进入站点前并行检测各地址：

- 使用指定的健康检查接口测试后端
- 展示可用状态、HTTP 状态和请求延迟
- 自动选择可用 API 地址
- 将选中结果保存在当前浏览器会话中
- 全部检测失败时展示预设的联系信息
- 可按部署需求完全关闭检测功能

## 项目特点

### 现代化界面与响应式设计

主题使用卡片式控制台布局和独立营销落地页，适配桌面端、平板和手机。导航、套餐、统计数据及操作区域会根据屏幕宽度自动调整，移动端无需单独部署页面。

### 深浅色主题

落地页和用户中心支持深色、浅色模式切换，并可通过运行时配置指定落地页默认模式。用户选择会由前端状态管理保存，降低重复设置成本。

### 中英文国际化

项目集成 Vue I18n，支持简体中文与英文切换。页面导航、操作反馈和落地页主要内容均通过国际化配置管理，便于继续增加其他语言。

### 运行时配置，无需反复构建

站点标题、描述、Logo、背景、Telegram 链接、客户端下载地址和 API 接入方式集中存放在 `public/env.js`。部署后可以直接编辑服务器上的 `env.js` 并刷新页面，不必每次修改品牌信息都重新编译前端。

### 灵活的 API 接入方案

项目可适配多种前后端部署关系：

- 单个固定 API 地址
- 多个固定 API 地址与可用性检测
- 根据当前站点域名自动生成 API 地址
- 同域 Nginx 反向代理
- 自定义代理服务转发

这使主题既能作为 XBoard 同服务器主题使用，也能独立部署到静态托管或 CDN。

### 完整的登录保护

路由守卫会区分公开页面与用户页面，自动处理未登录跳转、已登录回跳、用户资料初始化和登录失效。HTTP 层统一添加认证信息，并将常见状态码转换为易读错误提示。

### 按需加载与构建优化

页面视图通过动态导入进行路由级拆分，Vue、Naive UI 和 ECharts 等大型依赖被拆分为独立构建块。Naive UI 组件和常用 Vue API 支持自动导入，减少重复样板代码。

### 静态资源与 CDN 支持

构建时可以配置相对基础路径或 CDN 地址，适配根目录、任意子目录和静态资源 CDN。带哈希的资源可长期缓存，运行时配置文件则可以独立设置为不缓存。

### 类型安全与内容安全

项目启用 TypeScript 严格模式，并通过 `vue-tsc` 在构建前检查类型。对于后端返回的富文本内容，项目集成 DOMPurify 进行净化，降低跨站脚本攻击风险。

### 低侵入式品牌定制

常见品牌项不需要修改 Vue 源码，只需调整运行时配置即可完成：

- 网站名称与描述
- Logo 和背景图
- 默认主题模式
- Telegram 群组与故障联系入口
- 各平台客户端下载地址
- API 地址及检测策略

## 技术栈

| 技术 | 用途 |
| --- | --- |
| Vue 3 | 前端应用框架 |
| TypeScript | 静态类型与开发体验 |
| Vite | 开发服务器与生产构建 |
| Vue Router | 前端路由 |
| Pinia | 状态管理 |
| Naive UI | UI 组件库 |
| Axios | HTTP 请求 |
| Vue I18n | 国际化 |
| ECharts / Vue ECharts | 图表展示 |
| Tailwind CSS / PostCSS / Sass | 样式工具链 |
| DOMPurify | HTML 内容安全净化 |

## 环境要求

建议使用以下环境：

- Node.js 20 LTS 或更高版本
- npm 10 或更高版本
- 可正常访问的 XBoard 后端 API
- 生产部署可选 Nginx 或其他支持 SPA 回退的 Web 服务器

查看本机版本：

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

如果已经取得项目源码，可直接进入项目根目录。

### 2. 安装依赖

推荐根据锁文件安装确定版本的依赖：

```bash
npm ci
```

需要更新依赖时也可以使用：

```bash
npm install
```

### 3. 配置开发 API

开发服务器默认运行于 `http://localhost:3100`，并将 `/api/v1` 和 `/api/v2` 请求代理到 `VITE_DEV_API_TARGET` 指定的 XBoard 后端。

开始开发前，复制环境变量模板：

```bat
copy .env.example .env.development
```

然后在 `.env.development` 中把安全示例域名替换为实际开发后端地址：

```env
# 仅供 Vite 本地开发代理使用；必须包含协议，建议不要以 / 结尾
VITE_DEV_API_TARGET=https://api.example.com
```

> `api.example.com` 是保留的占位域名，无法连接真实 API。修改 `.env.development` 后需要重启开发服务器。生产环境 API 不读取此变量，请在 `public/env.js` 中配置。

### 4. 启动开发服务器

```bash
npm run dev
```

浏览器访问：

```text
http://localhost:3100
```

### 5. 构建生产版本

```bash
npm run build
```

构建前会执行 TypeScript 类型检查，构建产物输出到 `dist/` 目录。

### 6. 本地预览生产版本

```bash
npm run preview
```

终端会显示实际预览地址。预览命令适合本地验收，不建议作为生产服务器使用。

## 可用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 执行类型检查并构建生产版本 |
| `npm run preview` | 本地预览生产构建产物 |

## 配置说明

项目配置分为构建时配置与运行时配置两部分。

### 构建时配置

复制示例配置文件：

Windows CMD：

```bat
copy .env.example .env.production
```

PowerShell：

```powershell
Copy-Item .env.example .env.production
```

Linux/macOS：

```bash
cp .env.example .env.production
```

可用变量：

| 变量 | 模板值 | 说明 |
| --- | --- | --- |
| `VITE_BASE` | `./` | 构建资源基础路径；固定子目录部署时填写以 `/` 开头和结尾的路径 |
| `VITE_CDN_URL` | 空 | 静态资源 CDN 完整前缀；配置后优先于 `VITE_BASE`，且应以 `/` 结尾 |
| `VITE_DEV_API_TARGET` | `https://api.example.com` | 本地开发代理目标；占位域名必须替换，仅在开发服务器中生效 |

根目录部署通常保持：

```env
VITE_BASE=./
VITE_CDN_URL=
```

使用 CDN 时，确保地址以 `/` 结尾：

```env
VITE_CDN_URL=https://cdn.example.com/stellar/
```

然后重新构建：

```bash
npm run build
```

### 运行时配置

运行时配置位于 `public/env.js`。该文件会被复制到构建目录并在页面启动前加载。生产环境可直接修改部署目录中的 `env.js`，刷新页面即可生效，无需重新执行构建。

基础配置示例：

```js
window.routerBase = '/'

window.settings = {
  title: 'Stellar',
  description: 'Stellar Panel',
  assets_path: '/assets',
  theme: {
    color: 'default',
  },
  version: '1.0.0',
  background_url: '',
  logo: '',
  landing_theme_mode: 'dark',
  telegram_group: '',
  api_error_contact: '',
  client_downloads: {
    windows: '',
    macos: '',
    android: '',
    ios: '',
    linux: '',
    router: '',
  },
  api: {
    url_mode: 'auto',
    static_base_urls: [],
    auto: {
      use_same_protocol: true,
      host: '',
      append_path: '',
    },
    check_enabled: false,
    check_path: '/api/v1/guest/comm/config',
    proxy_enabled: false,
    proxy_url: '',
    proxy_path: '/api-proxy',
    proxy_mode: 'base64Path',
  },
}
```

#### 通用配置项

| 配置项 | 说明 |
| --- | --- |
| `window.routerBase` | Vue Router 基础路径，必须以 `/` 开头和结尾 |
| `title` | 网站名称和页面标题后缀 |
| `description` | 网站描述 |
| `assets_path` | 静态资源目录，相对于 `routerBase` |
| `theme.color` | 主题色标识 |
| `version` | 当前主题版本标识 |
| `background_url` | 自定义背景图片地址，留空使用默认样式 |
| `logo` | 自定义 Logo 地址，留空使用默认标识 |
| `landing_theme_mode` | 落地页默认模式，可选 `dark` 或 `light` |
| `telegram_group` | Telegram 群组链接；留空时尝试从后端获取 |
| `api_error_contact` | API 全部不可用时展示的联系信息或链接 |

#### 客户端下载配置

在 `client_downloads` 中填写下载地址后，对应平台会显示下载入口；留空则隐藏该平台入口。

```js
client_downloads: {
  windows: 'https://download.example.com/client.exe',
  macos: 'https://download.example.com/client.dmg',
  android: 'https://download.example.com/client.apk',
  ios: 'https://apps.apple.com/app/example',
  linux: 'https://download.example.com/client.AppImage',
  router: 'https://download.example.com/router.img',
},
```

## API 接入方式

### 方式一：固定 API 地址

适用于前端与后端不同域，且后端已经正确配置 CORS 的场景。

单个地址：

```js
api: {
  url_mode: 'static',
  static_base_urls: ['https://panel.example.com'],
  check_enabled: false,
  check_path: '/api/v1/guest/comm/config',
  proxy_enabled: false,
}
```

多个地址：

```js
api: {
  url_mode: 'static',
  static_base_urls: [
    'https://panel-a.example.com',
    'https://panel-b.example.com',
  ],
  check_enabled: true,
  check_path: '/api/v1/guest/comm/config',
  proxy_enabled: false,
}
```

当固定地址超过一个、启用检测且当前会话尚未选定地址时，应用会进入 API 检测页面，选择可用后端并在当前浏览器会话中保存结果。

### 方式二：同域自动 API 地址

适用于前端和 API 通过同一域名访问的推荐部署方式。

前端位于 `https://www.example.com/`，API 由 Nginx 转发到 `/api`：

```js
api: {
  url_mode: 'auto',
  auto: {
    use_same_protocol: true,
    host: '',
    append_path: '/api',
  },
  check_enabled: false,
  proxy_enabled: false,
}
```

参数说明：

- `use_same_protocol`：为 `true` 时使用当前页面协议。
- `host`：留空使用当前页面域名，也可以填写独立 API 域名。
- `append_path`：附加到 API 域名后的路径前缀。

### 方式三：前端代理 URL 模式

用于通过自定义代理服务转发请求。启用前必须确保服务器实现了对应 URL 编码和转发逻辑。

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

支持的 `proxy_mode`：

| 模式 | 生成方式 | 服务端要求 |
| --- | --- | --- |
| `base64Path` | 将完整目标 URL 编码到路径中 | 服务端需解码并安全转发目标 URL |
| `query` | 通过 `target` 查询参数传递目标 URL | 服务端需读取、校验并转发查询参数 |
| `plainPath` | 将原 API 路径直接附加到代理路径 | 服务端需预先配置固定上游后端 |

> 不要部署一个允许任意目标地址且没有白名单校验的开放代理，否则可能带来 SSRF 和带宽滥用风险。

## 生产部署

### 根目录部署（推荐）

1. 完成生产构建：

   ```bash
   npm run build
   ```

2. 将 `dist/` 中的全部文件上传到服务器目录，例如 `/var/www/stellar/`。
3. 修改服务器上的 `env.js`：

   ```js
   window.routerBase = '/'
   ```

4. 根据实际部署方式配置 API。
5. 配置 Web 服务器将不存在的前端路由回退到 `index.html`。

项目根目录中的 `nginx.conf.example` 提供了完整参考。根目录部署的核心配置如下：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/stellar;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location = /env.js {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

部署 HTTPS 时，建议使用 Certbot 或服务器面板申请证书，并将 HTTP 请求重定向到 HTTPS。

### 子目录部署

例如访问地址为 `https://www.example.com/stellar/`：

1. 构建资源使用默认相对路径，或设置：

   ```env
   VITE_BASE=./
   ```

2. 修改 `public/env.js`，重新构建；或者直接修改构建产物中的 `dist/env.js`：

   ```js
   window.routerBase = '/stellar/'
   ```

3. 将构建产物部署到 `/var/www/stellar/`。
4. 配置子目录路由回退：

   ```nginx
   location /stellar/ {
       alias /var/www/stellar/;
       try_files $uri $uri/ /stellar/index.html;
   }
   ```

5. 禁止缓存运行时配置：

   ```nginx
   location = /stellar/env.js {
       expires -1;
       add_header Cache-Control "no-store, no-cache, must-revalidate";
   }
   ```

`window.routerBase` 配置错误会导致刷新子页面后出现 404，或登录跳转到错误路径。

### CDN 部署

在 `.env.production` 中设置 CDN 地址：

```env
VITE_CDN_URL=https://cdn.example.com/stellar/
```

执行构建后，JavaScript、CSS 和图片等构建资源会使用 CDN 前缀。部署时请注意：

- 将构建生成的 `assets/` 上传或同步到 CDN。
- `index.html` 与 `env.js` 建议保留在页面源站。
- `index.html` 与 `env.js` 不应长期缓存。
- 带内容哈希的静态资源可设置长期缓存。
- CDN 地址应允许浏览器跨域加载所需资源。

## 推荐缓存策略

| 文件 | 推荐策略 |
| --- | --- |
| `index.html` | 不缓存或短时间缓存 |
| `env.js` | `no-store, no-cache, must-revalidate` |
| 带哈希的 JS/CSS/图片 | 长期缓存，可设置 `immutable` |
| `assets/stellar.js` | 文件名固定，升级时建议短缓存或主动刷新 CDN |

## 项目结构

```text
stellar-src/
├─ public/
│  ├─ env.js                 # 运行时配置
│  └─ client-logos/          # 客户端 Logo
├─ src/
│  ├─ api/                   # API 请求、类型和 HTTP 封装
│  ├─ assets/                # 项目静态资源
│  ├─ components/            # 通用组件
│  ├─ i18n/                  # 国际化配置
│  ├─ layouts/               # 主布局、顶部栏和侧边栏
│  ├─ router/                # 路由和访问控制
│  ├─ stores/                # Pinia 状态管理
│  ├─ styles/                # 全局样式
│  ├─ utils/                 # 配置、格式化和安全工具
│  ├─ views/                 # 页面视图
│  ├─ App.vue                # 根组件
│  └─ main.ts                # 应用入口
├─ .env.example              # 构建环境变量示例
├─ index.html                # HTML 入口
├─ nginx.conf.example        # Nginx 部署参考
├─ package.json              # 依赖与命令
├─ tailwind.config.js        # Tailwind CSS 配置
├─ tsconfig.json             # TypeScript 配置
└─ vite.config.ts            # Vite 开发与构建配置
```

## 使用流程

部署完成后，普通用户可按以下流程使用：

1. 打开站点落地页，查看功能和套餐。
2. 注册新账户，或使用已有账户登录。
3. 在套餐页面选择套餐并完成结算。
4. 在仪表盘复制订阅地址，或通过订阅导入功能打开支持的客户端。
5. 在客户端中更新订阅并选择可用节点。
6. 在订单、流量、邀请和工单页面管理账户相关信息。

管理员需要先在 XBoard 后端正确配置套餐、支付方式、知识库、邀请规则和站点信息，前端会通过 API 获取并展示这些数据。

## 常见问题

### 页面可以打开，但所有 API 请求失败

依次检查：

1. `env.js` 中 API 地址是否正确。
2. 后端 API 是否可以从浏览器直接访问。
3. 跨域部署时后端是否允许当前前端域名。
4. 同域代理时 Nginx 的 `location` 与 `append_path` 是否一致。
5. HTTPS 页面是否请求了 HTTP API；浏览器会拦截混合内容。
6. 浏览器开发者工具的 Network 和 Console 是否显示 CORS、404 或 502。

### 刷新 `/dashboard` 后出现 404

项目使用 History 路由以保持 `/dashboard` 这类整洁 URL。静态托管平台必须把不存在的文件路径回退到 `index.html`。仓库已提供主流平台的最小配置：

| 平台 | 配置文件 | 说明 |
| --- | --- | --- |
| Vercel | `vercel.json` | 将所有前端路由重写到 `/index.html` |
| Netlify | `public/_redirects` | 构建时自动复制到 `dist/_redirects` |
| Cloudflare Pages | `public/_redirects` | 与 Netlify 共用同一条 SPA 回退规则 |
| Nginx | `nginx.conf.example` | 将对应场景的 `server` 配置部署到服务器 |
| Apache | `public/.htaccess` | 构建时自动复制到 `dist/.htaccess`，服务器需启用 `mod_rewrite` |
| Firebase Hosting | `firebase.json` | 构建后执行 Firebase 部署，发布目录为 `dist` |

Nginx 根目录部署的核心规则是：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

子目录部署还需要将回退地址改为对应子目录下的 `index.html`。

### 修改 `env.js` 后没有生效

- 强制刷新浏览器或清理站点缓存。
- 检查 Nginx、CDN 和浏览器是否缓存了 `env.js`。
- 确认修改的是当前站点实际加载的文件。
- 在浏览器开发者工具 Network 面板查看 `env.js` 响应内容。

### 多 API 检测页面反复出现

- 确认至少一个 `static_base_urls` 地址可访问检测接口。
- 确认检测接口支持浏览器跨域请求。
- 检查 `check_path` 是否与后端一致。
- 检测结果保存在 `sessionStorage` 中，关闭当前会话后会重新检测。
- 不需要检测时将 `check_enabled` 设置为 `false`。

### 子目录中的资源或登录跳转路径错误

确保运行时配置使用完整的首尾斜杠：

```js
window.routerBase = '/stellar/'
```

不要写成 `stellar`、`/stellar` 或 `stellar/`。

## 安全建议

- 生产站点使用 HTTPS。
- 不要在前端配置文件中存放数据库密码、私钥或服务端密钥；前端文件对访问者完全可见。
- 后端 CORS 不应无条件允许任意来源，优先使用同域反向代理。
- 若启用代理模式，应限制可访问的目标域名并防范 SSRF。
- 对 `env.js`、Nginx 配置和后端地址进行发布前检查。
- 定期升级依赖并执行安全审计：

  ```bash
  npm audit
  ```

- 发布前至少执行一次完整构建，确保 TypeScript 检查通过：

  ```bash
  npm run build
  ```

## 开发说明

- `@` 路径别名指向 `src/`。
- Vue、Vue Router 和 Pinia 常用 API 已通过自动导入插件配置。
- Naive UI 组件支持按需自动导入。
- 新增页面后，需要在 `src/router/index.ts` 中注册路由。
- 新增运行时配置项时，应同步更新 `public/env.js`、`src/env.d.ts` 和 `src/utils/settings.ts`。
- 修改 API 地址解析逻辑时，应重点检查固定地址、多地址检测、自动地址和代理模式。
- 前端对后端返回的富文本内容应继续使用 DOMPurify 等方式进行安全净化。

## 发布检查清单

- [ ] 已执行 `npm ci`
- [ ] 已配置正确的 API 地址
- [ ] 已修改站点标题、描述、Logo 和联系链接
- [ ] 已清理示例客户端下载安装地址
- [ ] 已执行 `npm run build`
- [ ] 已上传 `dist/` 中的全部文件
- [ ] 已配置 SPA History 路由回退
- [ ] 已禁用 `env.js` 长期缓存
- [ ] 已验证注册、登录、套餐、订单和订阅流程
- [ ] 已在桌面端和移动端完成基础测试
- [ ] 已启用 HTTPS 并检查浏览器控制台无混合内容错误

## 项目地址与授权

- GitHub 仓库：<https://github.com/aklibk86-dev/stellar>
- 项目作者：[@aklibk86-dev](https://github.com/aklibk86-dev)
- 交流群组：[Telegram群组](https://t.me/kqxw_chat)

当前源码中未提供许可证文件。在公开分发、商用或二次发布前，请先确认项目作者的授权范围，并按实际授权补充许可证说明。
