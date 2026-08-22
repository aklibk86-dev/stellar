// ============================================================
// Stellar 主题 - 运行时配置（静态托管用）
// ============================================================
// 使用说明：
//   1. 此文件由 index.html 在应用启动前加载，用于生成 window.settings。
//   2. 修改此文件后无需重新构建；刷新页面即可加载新配置。
//   3. 静态托管时，后端与前端不同源，建议使用 url_mode: 'static'。
//   4. 请勿在此文件填写密码、Token、订阅链接等私密信息。
// ============================================================

// 前端路由基础路径。
// 根目录部署填写 '/'；子目录部署填写类似 '/stellar/'，必须以 / 开头和结尾。
window.routerBase = '/'

window.settings = {
  // ==========================================================
  // 品牌信息
  // ==========================================================

  // 站点名称（浏览器标题、侧边栏品牌名）
  title: 'Stellar',

  // 站点简介
  description: 'Stellar Panel',

  // ==========================================================
  // 资源与主题
  // ==========================================================

  // 静态资源目录（保留默认 '/assets' 即可）
  assets_path: '/assets',

  // 主题主色：'default'（默认蓝紫）或 'green' 'orange' 'red' 等
  theme: {
    color: 'default',
  },

  // 前端展示的主题版本号
  version: '1.0.0',

  // 背景图片 URL（留空用默认）
  // 注意：此字段为旧版配置，仅用于 auth 页面背景，已由下方 background 配置取代。
  // 若同时配置了 background.enabled，将以 background 为准。
  background_url: '',

  // Logo URL（留空用项目默认图标）
  logo: '',

  // 用户头像源 URL；留空使用后端 avatar_url；支持 {email}、{username}、{seed} 占位符
  // 示例：https://api.dicebear.com/9.x/initials/svg?seed={email}
  avatar_source: '',

  // 页头自定义代码（注入到 <head> 标签尾部）
  // 支持 <script>、<style>、<link>、<meta> 等标签
  header_code: '',

  // 页脚自定义代码（在页面底部渲染）
  // 可放置统计代码、版权信息等
  footer_code: '',

  // ==========================================================
  // 落地页
  // ==========================================================

  // 落地页默认主题：'dark'（深色）或 'light'（浅色）
  landing_theme_mode: 'dark',

  // 是否启用落地页（true=首页显示落地页，false=直接跳登录/仪表盘）
  landing_page_enabled: true,

  // 官网顶部 Hero 文案，可分别配置中英文；留空时使用内置翻译
  landing_hero: {
    badge: '',
    badge_en: '',
    title: '',
    title_en: '',
    title_suffix: '',
    title_suffix_en: '',
    subtitle: '',
    subtitle_en: '',
    features: [
      // { label: '稳定高速', label_en: 'Stable and fast' },
    ],
  },

  // 顶部导航链接。可调整顺序、增删项目；items: [] 表示隐藏导航链接。
  // label_en 留空时，英文模式也会使用 label；url 支持 #锚点、站内路径和 http(s)/mailto/tel 链接。
  landing_navigation: {
    items: [
      { label: '功能', label_en: 'Features', url: '#features' },
      { label: '套餐', label_en: 'Pricing', url: '#pricing' },
      { label: '常见问题', label_en: 'FAQ', url: '#faq' },
      // { label: '状态页', label_en: 'Status', url: 'https://status.example.com', new_tab: true },
    ],
  },

  // 后台侧边栏。type: 'group' 表示分组标题；普通项使用 path（站内）或 url（外链）。
  // 支持调整顺序、visible: false 隐藏、badge 徽标；items: [] 表示隐藏全部菜单项。
  sidebar_navigation: {
    items: [
      { label: '仪表盘', label_en: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
      { type: 'group', label: '产品服务', label_en: 'Products' },
      { label: '线路列表', label_en: 'Servers', path: '/servers', icon: 'server' },
      { label: '购买套餐', label_en: 'Plans', path: '/plans', icon: 'shop' },
      { type: 'group', label: '账户管理', label_en: 'Account' },
      { label: '订单中心', label_en: 'Orders', path: '/orders', icon: 'receipt' },
      { label: '工单系统', label_en: 'Tickets', path: '/tickets', icon: 'ticket' },
      { label: '邀请中心', label_en: 'Invite', path: '/invite', icon: 'users' },
      { label: '流量统计', label_en: 'Traffic', path: '/traffic', icon: 'chart' },
      { type: 'group', label: '帮助支持', label_en: 'Support' },
      { label: '文档中心', label_en: 'Docs', path: '/knowledge', icon: 'book' },
      { label: '账户设置', label_en: 'Profile', path: '/profile', icon: 'user' },
      // { label: '服务状态', label_en: 'Status', url: 'https://status.example.com', icon: 'world', new_tab: true, badge: 'NEW' },
    ],
  },

  // ==========================================================
  // 社交 / 联系方式
  // ==========================================================

  // Telegram 群组完整 URL（留空则读取后端配置，仍为空则隐藏入口）
  telegram_group: '',

  // API 全部检测失败时的联系文案
  api_error_contact: '',

  // ==========================================================
  // 客户端下载地址
  // ==========================================================

  client_downloads: {
    windows: '',
    macos: '',
    android: '',
    ios: '',
    linux: '',
    router: '',
  },

  // 一键导入白名单。clients 留空表示允许所有内置客户端。
  client_imports: {
    enabled: true,
    clients: [],
  },

  // 邀请分享卡片及可见的社交平台。
  social_sharing: {
    enabled: true,
    platforms: ['wechat', 'qq', 'weibo', 'twitter', 'telegram', 'facebook', 'copy'],
    title: '',
    description: '',
  },

  // 第三方客服：tawk / crisp / chatwoot / intercom / custom。
  // 仅 enabled=true 时加载。标识登录用户会向客服平台发送用户 ID、邮箱和头像，可按需关闭。
  customer_service: {
    enabled: true,
    provider: 'tawk',

    // 通用加载与可见性配置
    load_delay: 800,
    load_on_idle: true,
    identify_user: true,
    track_page_views: true,
    show_on_routes: [], // 例如 ['/dashboard', '/tickets*']；空数组表示全部路由
    hide_on_routes: ['/login', '/register', '/forget'],
    // 登录、注册、找回密码页默认仍显示客服；设为 false 可关闭
    show_on_auth_routes: true,
    hide_on_mobile: false,
    tags: ['stellar'],
    attributes: {},
    allow_insecure_http: false,

    // Tawk（https://www.tawk.to/）
    tawk_property_id: '6a7fee6896f34e1d453f1cf8',
    tawk_widget_id: '1k01rmj18',
    tawk_auto_start: true,
    // 安全模式 hash 必须由后端使用 Tawk API Key 按当前用户生成，禁止在静态配置中填写通用值。
    tawk_secure_hash: '',
    // 直接透传 Tawk 官方 customStyle 对象。
    tawk_custom_style: {},

    // Crisp
    crisp_website_id: '',

    // Chatwoot
    chatwoot_base_url: '',
    chatwoot_website_token: '',
    chatwoot_locale: 'auto',
    chatwoot_position: 'right',

    // Intercom
    intercom_app_id: '',
    intercom_api_base: 'https://api-iam.intercom.io',

    // 自定义客服脚本（仅接受 HTTPS，localhost 除外）
    script_url: '',
  },

  // ==========================================================
  // 全站背景（支持静态图片 / 视频两种媒体类型）
  // ==========================================================
  // 启用后，背景媒体会响应式地覆盖整个视口（position: fixed; inset: 0）。
  // - 图片：使用 <div> + background-size: cover 实现自适应铺满
  // - 视频：使用 <video> 标签，object-fit: cover 铺满，支持自动播放/循环/静音
  // 媒体之上会叠加一层半透明遮罩，以提升前景内容的可读性。
  // ==========================================================
  background: {
    // 是否启用全站背景
    enabled: false,

    // 媒体类型：'image'（静态图片）或 'video'（视频背景）
    type: 'image',

    // 媒体资源 URL
    // - type='image' 时填写图片地址（jpg/png/webp/svg 等）
    // - type='video' 时填写视频地址（mp4/webm/ogg 等，建议 mp4 + H.264 兼容性最佳）
    // 兼容旧配置：desktop_url / mobile_url 留空时作为两端的通用回退地址
    url: '',

    // 电脑端壁纸 URL（视口宽度大于 767px 时优先使用）
    desktop_url: '',

    // 手机端壁纸 URL（视口宽度小于等于 767px 时优先使用）
    mobile_url: '',

    // 视频封面图 URL（仅 type='video' 生效，视频加载前/不可用时显示）
    poster: '',

    // 遮罩透明度 0-1（叠加在媒体之上的纯色遮罩，值越大前景越清晰但背景越暗）
    overlay_opacity: 0.35,

    // 遮罩颜色（任意合法 CSS 颜色值，如 '#000000' / 'rgba(0,0,0,0.5)'）
    overlay_color: '#000000',

    // ---- 以下三项仅 type='video' 生效 ----
    // 视频自动播放（浏览器要求自动播放必须静音，建议保持 muted: true）
    video_autoplay: true,
    // 视频循环播放
    video_loop: true,
    // 视频静音（自动播放场景下必须为 true，否则会被浏览器拦截）
    video_muted: true,
  },

  // ==========================================================
  // 全局毛玻璃（Glassmorphism）卡片效果
  // ==========================================================
  // 启用后，所有使用 .stellar-glass / .stellar-card 类的卡片组件
  // 将应用 backdrop-filter 模糊 + 半透明背景 + 可选边框的毛玻璃效果。
  // 通过 CSS 变量驱动，可在运行时动态调整而无需重新构建。
  // ==========================================================
  glassmorphism: {
    // 是否启用毛玻璃效果（false 时卡片使用默认实色背景）
    enabled: false,

    // 背景模糊强度，单位 px（对应 backdrop-filter: blur(Npx)）
    blur: 12,

    // 卡片背景透明度 0-1（叠加在模糊层之上的半透明色，值越小越通透）
    opacity: 0.65,

    // 边框样式：
    //   'none'   - 无边框
    //   'solid'  - 实线边框（使用 border_color / border_width）
    //   'light'  - 细半透明线（适合玻璃质感，推荐）
    border_style: 'light',

    // 边框颜色（任意合法 CSS 颜色值，border_style='none' 时忽略）
    border_color: 'rgba(255, 255, 255, 0.18)',

    // 边框宽度，单位 px
    border_width: 1,

    // 卡片圆角，单位 px
    radius: 12,
  },

  // ==========================================================
  // 文档中心
  // ==========================================================

  // 分类侧边栏样式：
  //   'list' - 平铺列表式（默认，所有分类一直展开显示）
  //   'nav'  - 上下导航式（顶部上一项 + 中间当前分类大卡片 + 底部下一项 + 紧凑分类网格）
  knowledge_sidebar_style: 'nav',
  knowledge_require_subscription: true,

  // ==========================================================
  // 后端 API 配置（静态托管核心配置）
  // ==========================================================

  api: {
    // 【模式选择】
    // 'static' - 固定后端地址列表（推荐静态托管使用，支持多地址+健康检测自动切换）
    // 'auto'   - 自动同源拼接（适合后端和前端部署在同一域名下）
    url_mode: 'static',

    // 【static 模式】后端 API 地址列表（支持多个，会自动检测可用的）
    static_base_urls: ['https://xboard.wf1.one'],

    // 【auto 模式】同源拼接规则（url_mode='auto' 时生效）
    auto: {
      use_same_protocol: true,
      host: '',
      append_path: '',
    },

    // 【健康检测】启用后前端会自动检测 static_base_urls 中可用的后端
    check_enabled: true,
    check_path: '/api/v1/guest/comm/config',

    // 【正向转发】解决 CORS 或内网穿透问题（非必须不启用）
    proxy_enabled: false,
    proxy_url: '',
    proxy_path: '/api-proxy',
    proxy_mode: 'base64Path',

    // 【后端类型】用于适配不同后端项目的 API 差异
    // 'xboard'  - cedar2025/Xboard（默认猜测，支持魔法链接登录、礼品卡完整模块、Turnstile 验证码等）
    // 'v2board' - wyx2685/v2board 及兼容的原版 v2board（支持工单提现、流量提前重置、解绑 Telegram 等）
    // 'auto'    - 自动探测（首次请求 guest/comm/config 后根据字段判断，无法判断时按 xboard 处理）
    backend_type: 'xboard',
  },
}
