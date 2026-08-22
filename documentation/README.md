# Stellar Theme 项目文档

> 面向 XBoard 体系的现代化用户端主题 · Vue 3 + TypeScript + Vite

Stellar Theme 是一套可直接商用的用户端面板主题，覆盖**落地页 → 注册/登录 → 套餐购买 → 支付 → 订阅使用 → 续费 → 工单售后 → 邀请返利 → 流量统计**的完整用户生命周期，同时兼容两类主流后端，一套主题两处复用。

---

## 文档目录

| 文档 | 内容 |
| --- | --- |
| [部署教程](./部署教程.md) | 本地开发、生产构建、Nginx 根目录/子目录部署、Vercel 等静态托管、缓存策略、发布检查清单 |
| [配置文件详解](./配置文件详解.md) | `public/env.js` 全部配置项逐条说明（品牌 / 落地页 / 导航 / 背景 / 客服 / API 等） |
| [套餐配置详解](./套餐配置详解.md) | 套餐字段、价格周期、流量单位、`content` 富文本三种格式（JSON / HTML / Markdown）、优惠券与结算流程 |
| [占位符详解](./占位符详解.md) | 头像模板占位符、客服身份注入、双语配置、数据单位约定 |

---

## 项目简介

### 核心定位

- **一套主题，两个后端**：兼容 cedar2025/Xboard 与 wyx2685/v2board（含原版兼容系），通过 `env.js` 中 `api.backend_type` 一键切换，或 `auto` 自动探测。
- **零构建改配置**：站点信息、API 地址、导航、客服、背景等全部通过 `public/env.js` 运行时配置，部署后直接改文件、刷新即生效。
- **静态托管友好**：产物为纯静态文件，支持 Nginx / Vercel / Cloudflare Pages / Railway 等任意静态托管。

### 功能清单

| 模块 | 说明 |
| --- | --- |
| 官网落地页 | 双语导航、Hero 文案、卖点、套餐卡片、FAQ、行动按钮，主题/文案全部可配置 |
| 用户认证 | 用户名/邮箱登录、注册（可选邮箱验证码 + 邮箱域名白名单）、邮箱验证码登录、魔法链接登录（Xboard）、忘记密码 |
| 用户仪表盘 | 账户概况、有效期、剩余流量环形图、流量热力图、待支付订单/待处理工单横幅、客户端下载 |
| 订阅导入 | 30+ 客户端一键导入（Clash 系 / Shadowrocket / Surge / Stash / Quantumult X / Sing-box 等），二维码扫码，自动识别平台 |
| 套餐购买 | 后端读取套餐、周期选择与省钱提示、优惠券、余额/套餐折抵、支付方式与手续费展示 |
| 订单中心 | 订单列表/详情/状态、待支付续费、取消订单、移动端卡片适配 |
| 工单系统 | 新建/回复/关闭工单、优先级、移动端会话式布局 |
| 邀请返利 | 邀请链接/记录/佣金数据、社交平台分享卡片 |
| 知识库 | 文章分类浏览、HTML / Markdown / JSON 混排渲染、DOMPurify 净化、订阅权限控制 |
| 流量统计 | 近 6 个月流量热力图、总/日均/峰值统计 |
| 个人资料 | 修改密码、修改邮箱（验证码）、通知开关、Telegram 绑定引导、重置订阅 Token、在线会话管理 |
| 公告系统 | 重要公告高亮、弹窗公告（支持"今日不再显示"）、套餐页公告 |
| API 可用性 | 多地址并行健康检测、自动选择可用后端、失败联系页 |
| 客服集成 | Tawk / Crisp / Chatwoot / Intercom / 自定义脚本，用户身份同步与页面事件 |

### 技术栈

| 技术 | 用途 |
| --- | --- |
| Vue 3 + TypeScript | 应用框架与静态类型 |
| Vite | 构建工具（产物哈希命名、ECharts 单独分包） |
| Vue Router + Pinia | 路由（含登录守卫、会话校验）与状态管理 |
| Naive UI | UI 组件库（按需自动导入） |
| Axios | HTTP 客户端（统一错误码、401 处理、AbortController） |
| Vue I18n | 中英双语（zh-CN / en-US） |
| ECharts / Vue ECharts | 流量环形图、热力图 |
| Tailwind CSS + PostCSS + Sass | 样式工具链 |
| DOMPurify + marked | 富文本安全渲染（HTML / Markdown / JSON） |

### 双后端能力差异

| 功能 | Xboard | v2board |
| --- | --- | --- |
| 邮箱链接（魔法链接）登录 | ✅ | ❌ |
| 游客获取套餐列表 | ✅ | ❌ |
| 礼品卡完整模块（校验/兑换/历史） | ✅ | ❌（仅兑换，路径不同） |
| 工单提现 | ✅ | ✅ |
| 流量提前重置（扣到期时间） | ❌ | ✅ |
| 解绑 Telegram | ❌ | ✅ |
| Turnstile / reCAPTCHA v3 高级验证码 | ✅ | ❌ |
| 订阅速率限制 / 下次重置字段 | ✅ | ❌ |
| 在线 IP 数 / 流量提前重置字段 | ❌ | ✅ |

> `auto` 探测规则：首次请求 `guest/comm/config` 后，按返回字段特征（`is_captcha`、`captcha_type`、`turnstile_site_key` 等）判断后端类型，无法判断时按 Xboard 处理。

### 环境要求

- Node.js 20 LTS+
- npm 10+
- 可正常访问的 XBoard / v2board 后端 API
- 生产部署推荐 Nginx（或任意静态托管平台）

---

## 相关资源

- GitHub：<https://github.com/aklibk86-dev/stellar>
- 项目文档：<https://stellar.aklibk.wiki>
- 交流群：<https://t.me/kqxw_chat>