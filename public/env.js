// ============================================================
// Stellar 主题 - 运行时配置模板
// ============================================================
// 使用说明：
//   1. 此文件由 index.html 在应用启动前加载，用于生成 window.settings。
//   2. 修改此文件后无需重新构建；刷新页面即可加载新配置。
//   3. 空字符串和空数组是安全占位值，请按下方注释替换为部署环境的实际值。
//   4. 请勿在此文件填写密码、Token、订阅链接等私密信息，因为浏览器可直接读取它。
// ============================================================

// 前端路由基础路径。
// 根目录部署填写 '/'；子目录部署填写类似 '/stellar/'，必须以 / 开头和结尾。
window.routerBase = '/'

window.settings = {
  // 浏览器标题、侧边栏和页面品牌名称。
  title: 'Stellar',

  // 站点简介，可用于页面描述或品牌说明。
  description: 'Stellar Panel',

  // 公共静态资源目录。一般保持 '/assets'，仅在自定义资源目录时修改。
  assets_path: '/assets',

  theme: {
    // 主题主色配置。'default' 表示使用项目默认配色。
    color: 'default',
  },

  // 前端展示的主题版本号，不影响后端版本。
  version: '1.0.0',

  // 登录页或全局背景图片 URL；留空使用默认背景。
  background_url: '',

  // 品牌 Logo URL；留空使用项目默认图标或文字标识。
  logo: '',

  // 落地页默认主题：'dark'（深色）或 'light'（浅色）。
  landing_theme_mode: 'dark',

  // 落地页开关：true 时访问首页显示落地页，false 时首页直接跳转到登录页/仪表盘
  landing_page_enabled: true,

  // Telegram 群组完整 URL；留空时尝试读取后端配置，仍为空则隐藏入口。
  telegram_group: '',

  // API 检测全部失败时展示的联系信息，可填写客服 URL 或提示文字；留空使用默认文案。
  api_error_contact: '',

  // 各平台客户端的官方下载 URL；对应项留空时不展示该平台的下载入口。
  client_downloads: {
    windows: '',
    macos: '',
    android: '',
    ios: '',
    linux: '',
    router: '',
  },

  api: {
    // 后端 API URL 获取模式：'auto'（自动同源拼接）或 'static'（静态地址列表）
    url_mode: 'auto',

    // static 模式下使用的后端 API 地址列表
    static_base_urls: [],

    // auto 模式下的拼接规则
    auto: {
      use_same_protocol: true,
      host: '',
      append_path: '',
    },

    // 是否启用 API 健康检测，自动切换可用后端
    check_enabled: false,
    check_path: '/api/v1/guest/comm/config',

    // 正向代理配置（用于解决 CORS 或内网穿透问题）
    proxy_enabled: false,
    proxy_url: '',
    proxy_path: '/api-proxy',
    proxy_mode: 'base64Path',
  },
}
